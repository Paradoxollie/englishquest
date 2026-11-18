-- Les anciens objets restent attachés à leurs propriétaires et gardent leur apparence.
alter table public.shop_items
  add column if not exists collection_key text,
  add column if not exists is_collection_reward boolean not null default false;

with original as (
  select id from public.shop_items where owner_user_id is null and item_key = any(array[
    'avatar_default','avatar_d_faut_femme_1763206735902','avatar_warrior','avatar_mage','avatar_dragon_warrior',
    'avatar_archmage','avatar_ranger','avatar_paladin','avatar_necromancer','avatar_assassin','avatar_dragon_lord','avatar_celestial',
    'bg_default','bg_forest','bg_ocean','bg_volcano','bg_sky','bg_night','bg_aurora','bg_cosmos','ship_skin_default',
    'title_beginner','title_student','title_expert','title_master','title_legend','title_immortal',
    'title_apprentice','title_explorer','title_grammarian','title_polyglot'
  ])
), keep_equipped as (
  insert into public.user_items (user_id, shop_item_id, price_paid)
    select e.user_id, worn.id, 0 from public.user_equipped_items e
    cross join lateral unnest(array[e.equipped_avatar_id, e.equipped_background_id, e.equipped_title_id, e.equipped_ship_skin_id]) worn(id)
    join original on original.id = worn.id
  on conflict (user_id, shop_item_id) do nothing
)
update public.shop_items set is_public = false
where id in (select id from original) and is_public;

-- Certaines images privées étaient équipées même si leur reçu n’avait pas été créé.
insert into public.user_items (user_id, shop_item_id, price_paid)
select player.id, item.id, 0 from public.shop_items item
  join public.profiles player on player.id = item.owner_user_id
  where left(item.item_key,7) = 'custom_'
union
select e.user_id, item.id, 0 from public.user_equipped_items e
  cross join lateral unnest(array[e.equipped_avatar_id,e.equipped_background_id]) worn(id)
  join public.shop_items item on item.id = worn.id
  where item.owner_user_id is null and left(item.item_key,7) = 'custom_'
on conflict (user_id, shop_item_id) do nothing;
update public.shop_items set is_public = false where is_public and left(item_key,7) = 'custom_';

-- Le catalogue reste public. Un objet archivé reste lisible pour le compte qui le possède.
drop policy if exists "Owners can read their collected items" on public.shop_items;
create policy "Owners can read their collected items" on public.shop_items for select to authenticated
using (exists (select 1 from public.user_items ui where ui.shop_item_id = shop_items.id and ui.user_id = (select auth.uid())));

insert into public.shop_items
  (item_type, item_key, name, description, price_gold, required_level, display_order, image_url, color_theme, collection_key, is_collection_reward, is_public, is_active)
select kind, 'eq_' || album || '_' || piece, label, caption, gold, lvl, display,
  case when art is not null then '/art/collection/' || art || '.webp' end, tone, album, trophy, true, true
from (values
  ('depart','maya','avatar','Maya en route','Maya emporte son carnet de terrain pour sa première journée à Londres.',0,1,100,'maya-depart','amber',false),
  ('depart','sam','avatar','Sam en route','Un crayon derrière l’oreille, Sam est prêt à prendre le départ.',0,1,101,'sam-depart','blue',false),
  ('depart','quais','background','Les quais de la Tamise','Installe ton portrait au bord du fleuve londonien.',18,1,102,'decor-quais','blue',false),
  ('depart','comete','ship_skin','Comète','Pilote ce petit vaisseau maniable dans Lexicon Blaster.',0,1,103,'vaisseau-comete','amber',false),
  ('depart','carnet','title','Carnet en poche','Le titre du premier voyage, à porter sous ton nom.',0,1,104,null,'amber',false),
  ('depart','album','title','Cap sur Londres','Le titre de celles et ceux qui ont réuni les cinq pièces des quais.',0,1,105,null,'amber',true),
  ('enquete','maya','avatar','Maya mène l’enquête','Maya change de tenue pour remonter la piste d’un indice.',25,1,110,'maya-enquete','amber',false),
  ('enquete','sam','avatar','Sam sur la piste','Sam couvre l’enquête de terrain pour son carnet de reportage.',40,3,111,'sam-enquete','blue',false),
  ('enquete','archives','background','La salle des archives','Des dossiers et des indices pour composer ton décor d’enquête.',30,2,112,'decor-archives','amber',false),
  ('enquete','indice','title','Œil de lynx','Le titre des observateurs qui repèrent le détail décisif.',0,2,113,null,'amber',false),
  ('enquete','album','title','L’énigme résolue','Le titre du bureau des enquêtes au grand complet.',0,1,114,null,'amber',true),
  ('studio','maya','avatar','Maya prend l’antenne','Maya en tenue de studio, prête à lancer son émission.',60,5,120,'maya-studio','purple',false),
  ('studio','sam','avatar','Sam aux platines','Sam prépare le prochain morceau de la nuit londonienne.',65,6,121,'sam-studio','purple',false),
  ('studio','regie','background','La régie de minuit','La lumière du studio accompagne tes parties nocturnes.',45,4,122,'decor-studio','purple',false),
  ('studio','frequence','ship_skin','Fréquence','Emporte les couleurs du studio dans Lexicon Blaster.',75,7,123,'vaisseau-frequence','purple',false),
  ('studio','antenne','title','À l’antenne','La signature de ta première émission.',0,5,124,null,'purple',false),
  ('studio','album','title','La voix de minuit','Le titre de l’équipe qui a réuni tout le studio.',0,1,125,null,'purple',true),
  ('aurore','maya','avatar','Maya sous les aurores','Maya en tenue d’expédition pour observer le ciel polaire.',100,11,130,'maya-aurore','cyan',false),
  ('aurore','sam','avatar','Sam en expédition','Sam se prépare à une nuit au-delà du cercle polaire.',120,13,131,'sam-aurore','cyan',false),
  ('aurore','observatoire','background','L’observatoire polaire','Installe ton portrait sous les lumières du grand Nord.',85,9,132,'decor-observatoire','cyan',false),
  ('aurore','vaisseau','ship_skin','Aurore','Le vaisseau de l’expédition polaire prend son envol dans Lexicon Blaster.',160,18,133,'vaisseau-aurore','cyan',false),
  ('aurore','polaire','title','Étoile polaire','Le titre des voyageurs qui gardent le nord.',0,10,134,null,'cyan',false),
  ('aurore','album','title','Au-delà du cercle','La signature de l’expédition polaire complète.',0,1,135,null,'cyan',true)
) as pieces(album,piece,kind,label,caption,gold,lvl,display,art,tone,trophy)
on conflict (item_key) do nothing;

-- Les pièces offertes comptent dès le niveau requis. Le titre acquis reste dans l’inventaire.
create or replace function public.grant_completed_shop_titles(p_user_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  with eligible as (
    select prize.id, prize.item_key, prize.name
    from public.shop_items prize cross join public.profiles player
    where player.id = p_user_id and prize.is_collection_reward and prize.is_active and prize.is_public
      and prize.required_level <= player.level
      and exists (
        select 1 from public.shop_items p where p.collection_key = prize.collection_key and not p.is_collection_reward
          and p.is_active and p.is_public and left(p.item_key,7) <> 'custom_'
      )
      and not exists (
        select 1 from public.shop_items p where p.collection_key = prize.collection_key and not p.is_collection_reward
          and p.is_active and p.is_public and left(p.item_key,7) <> 'custom_'
          and not (p.price_gold = 0 and p.required_level <= player.level)
          and not exists (select 1 from public.user_items ui where ui.user_id = player.id and ui.shop_item_id = p.id)
      )
  ), grants as (
    insert into public.user_items(user_id,shop_item_id,price_paid)
      select p_user_id, id, 0 from eligible order by id
      on conflict(user_id,shop_item_id) do nothing returning shop_item_id
  )
  select coalesce(jsonb_agg(to_jsonb(e) order by e.item_key), '[]'::jsonb) from eligible e join grants g on g.shop_item_id = e.id
$$;

-- Le dernier élément d’un album peut être un cadeau de niveau. Son titre est
-- conservé dès le passage de niveau, même si le joueur ne rouvre pas le vestiaire.
create or replace function public.collect_titles_after_level_up()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  perform public.grant_completed_shop_titles(new.id);
  return new;
end
$$;
drop trigger if exists collect_titles_after_level_up on public.profiles;
create trigger collect_titles_after_level_up after update of level on public.profiles
  for each row when (new.level > old.level) execute function public.collect_titles_after_level_up();

create or replace function public.purchase_shop_item(p_user_id uuid, p_shop_item_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  item public.shop_items%rowtype;
  player public.profiles%rowtype;
  titles jsonb;
begin
  select * into player from public.profiles where id = p_user_id for update;
  if not found then return jsonb_build_object('success',false,'error','Profil introuvable.'); end if;
  select * into item from public.shop_items where id = p_shop_item_id for share;
  if not found or not item.is_active or not item.is_public or left(item.item_key,7) = 'custom_' then
    return jsonb_build_object('success',false,'error','Cette pièce n’est pas en vente.');
  end if;
  if item.is_collection_reward then
    return jsonb_build_object('success',false,'error','Complète cet album pour gagner son titre.');
  end if;
  -- Une nouvelle tentative après une coupure renvoie le solde actuel sans second débit.
  if not exists(select 1 from public.user_items where user_id = p_user_id and shop_item_id = item.id) then
    if player.level < item.required_level then
      return jsonb_build_object('success',false,'error',format('Cette pièce se débloque au niveau %s.',item.required_level));
    end if;
    if player.gold < item.price_gold then
      return jsonb_build_object('success',false,'error',format('Il te manque %s pièce%s d’or.',item.price_gold-player.gold,case when item.price_gold-player.gold>1 then 's' else '' end));
    end if;
    insert into public.user_items(user_id,shop_item_id,price_paid) values (player.id,item.id,item.price_gold);
    update public.profiles set gold = gold - item.price_gold, updated_at = now() where id = player.id returning gold into player.gold;
  end if;
  titles := public.grant_completed_shop_titles(player.id);
  return jsonb_build_object('success',true,'newGold',player.gold,'purchasedItem',to_jsonb(item),'unlockedTitles',titles);
end
$$;

create or replace function public.equip_shop_item(p_user_id uuid, p_shop_item_id uuid, p_item_type text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  item public.shop_items%rowtype;
  player_level int;
begin
  if p_item_type is null or p_item_type not in ('avatar','background','title','ship_skin') then
    return jsonb_build_object('success',false,'error','Catégorie inconnue.');
  end if;
  select level into player_level from public.profiles where id=p_user_id for update;
  if not found then return jsonb_build_object('success',false,'error','Profil introuvable.'); end if;
  if p_shop_item_id is not null then
    select * into item from public.shop_items where id=p_shop_item_id for share;
    if not found or item.item_type <> p_item_type then return jsonb_build_object('success',false,'error','Cette pièce ne correspond pas à cet emplacement.'); end if;
    if item.is_collection_reward then perform public.grant_completed_shop_titles(p_user_id); end if;
    if not exists(select 1 from public.user_items where user_id=p_user_id and shop_item_id=p_shop_item_id) then
      if item.is_collection_reward or not item.is_active or not item.is_public or left(item.item_key,7) = 'custom_' or item.price_gold <> 0 or item.required_level > player_level then
        return jsonb_build_object('success',false,'error','Cette pièce n’est pas encore dans ta collection.');
      end if;
      insert into public.user_items(user_id,shop_item_id,price_paid) values (p_user_id,p_shop_item_id,0) on conflict do nothing;
    end if;
  end if;
  insert into public.user_equipped_items(user_id,equipped_avatar_id,equipped_background_id,equipped_title_id,equipped_ship_skin_id)
    values (p_user_id,case when p_item_type='avatar' then p_shop_item_id end,case when p_item_type='background' then p_shop_item_id end,
            case when p_item_type='title' then p_shop_item_id end,case when p_item_type='ship_skin' then p_shop_item_id end)
  on conflict(user_id) do update set
    equipped_avatar_id = case when p_item_type='avatar' then p_shop_item_id else user_equipped_items.equipped_avatar_id end,
    equipped_background_id = case when p_item_type='background' then p_shop_item_id else user_equipped_items.equipped_background_id end,
    equipped_title_id = case when p_item_type='title' then p_shop_item_id else user_equipped_items.equipped_title_id end,
    equipped_ship_skin_id = case when p_item_type='ship_skin' then p_shop_item_id else user_equipped_items.equipped_ship_skin_id end,
    updated_at = now();
  return jsonb_build_object('success',true);
end
$$;

revoke all on function public.collect_titles_after_level_up(), public.grant_completed_shop_titles(uuid), public.purchase_shop_item(uuid,uuid), public.equip_shop_item(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.grant_completed_shop_titles(uuid), public.purchase_shop_item(uuid,uuid), public.equip_shop_item(uuid,uuid,text) to service_role;
