begin;

alter table public.shop_items
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists is_public boolean not null default true;

create index if not exists idx_shop_items_owner_user_id on public.shop_items(owner_user_id);
create index if not exists idx_shop_items_is_public on public.shop_items(is_public);

update public.shop_items as shop_item
set
  owner_user_id = user_item.user_id,
  is_public = false
from public.user_items as user_item
where shop_item.id = user_item.shop_item_id
  and shop_item.item_key like 'custom\_%' escape '\'
  and (shop_item.owner_user_id is null or shop_item.is_public <> false);

drop policy if exists "Shop items are viewable by everyone" on public.shop_items;
create policy "Shop items are viewable by everyone"
  on public.shop_items
  for select
  using (
    is_active = true
    and (
      is_public = true
      or owner_user_id = auth.uid()
    )
  );

drop function if exists public.purchase_shop_item(uuid, uuid);
create or replace function public.purchase_shop_item(
  p_user_id uuid,
  p_shop_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.shop_items%rowtype;
  v_profile public.profiles%rowtype;
  v_inserted_item_id uuid;
begin
  select *
  into v_item
  from public.shop_items
  where id = p_shop_item_id
    and is_active = true
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'Item not found or not available'
    );
  end if;

  if v_item.item_key like 'custom\_%' escape '\' then
    return jsonb_build_object(
      'success', false,
      'error', 'Cet item personnalise n''est pas disponible a l''achat.'
    );
  end if;

  if exists (
    select 1
    from public.user_items
    where user_id = p_user_id
      and shop_item_id = p_shop_item_id
  ) then
    return jsonb_build_object(
      'success', false,
      'error', 'Vous possedez deja cet item'
    );
  end if;

  select *
  into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  end if;

  if v_profile.level < v_item.required_level then
    return jsonb_build_object(
      'success', false,
      'error', format(
        'Niveau %s requis (vous etes niveau %s)',
        v_item.required_level,
        v_profile.level
      )
    );
  end if;

  if v_profile.gold < v_item.price_gold then
    return jsonb_build_object(
      'success', false,
      'error', format(
        'Pas assez d''or. Necessaire: %s, Vous avez: %s',
        v_item.price_gold,
        v_profile.gold
      )
    );
  end if;

  update public.profiles
  set
    gold = gold - v_item.price_gold,
    updated_at = timezone('utc', now())
  where id = p_user_id;

  insert into public.user_items (user_id, shop_item_id, price_paid)
  values (p_user_id, p_shop_item_id, v_item.price_gold)
  on conflict (user_id, shop_item_id) do nothing
  returning id into v_inserted_item_id;

  if v_inserted_item_id is null then
    update public.profiles
    set
      gold = gold + v_item.price_gold,
      updated_at = timezone('utc', now())
    where id = p_user_id;

    return jsonb_build_object(
      'success', false,
      'error', 'Vous possedez deja cet item'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'newGold', v_profile.gold - v_item.price_gold
  );
end;
$$;

grant execute on function public.purchase_shop_item(uuid, uuid) to authenticated;

commit;
