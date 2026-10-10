-- ============================================================================
-- FIX: Réparer les policies RLS pour shop_items
-- ============================================================================
-- Ce script corrige les problèmes de policies RLS qui causent des erreurs 500
-- ============================================================================

begin;

-- Supprimer toutes les policies existantes sur shop_items pour repartir de zéro
drop policy if exists "Shop items are viewable by everyone" on public.shop_items;
drop policy if exists "Admins can manage shop items" on public.shop_items;

-- Policy 1: Tout le monde peut lire les items actifs
-- IMPORTANT: Cette policy permet de voir les items actifs
drop policy if exists "Shop items are viewable by everyone" on public.shop_items;
create policy "Shop items are viewable by everyone"
  on public.shop_items
  for select
  using (is_active = true);

-- Policy 2: Les admins peuvent tout voir (même les items inactifs)
create policy "Admins can view all shop items"
  on public.shop_items
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policy 3: Les admins peuvent insérer
create policy "Admins can insert shop items"
  on public.shop_items
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policy 4: Les admins peuvent modifier
create policy "Admins can update shop items"
  on public.shop_items
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policy 5: Les admins peuvent supprimer
create policy "Admins can delete shop items"
  on public.shop_items
  for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Vérifier que la contrainte item_type est correcte
do $$
begin
  -- Vérifier si la contrainte existe et contient ship_skin
  if not exists (
    select 1 
    from information_schema.check_constraints 
    where constraint_name = 'shop_items_item_type_check'
    and check_clause like '%ship_skin%'
  ) then
    -- Si la contrainte n'existe pas ou ne contient pas ship_skin, la recréer
    alter table public.shop_items
    drop constraint if exists shop_items_item_type_check;
    
    alter table public.shop_items
    add constraint shop_items_item_type_check 
    check (item_type in ('avatar', 'title', 'background', 'ship_skin'));
  end if;
end $$;

-- Vérifier que la colonne equipped_ship_skin_id existe
alter table public.user_equipped_items
add column if not exists equipped_ship_skin_id uuid references public.shop_items(id) on delete set null;

commit;

-- ============================================================================
-- VÉRIFICATIONS
-- ============================================================================
-- Exécutez ces requêtes pour vérifier que tout fonctionne
-- ============================================================================

-- Vérifier que tous les items existent toujours
select item_type, count(*) as total
from public.shop_items
group by item_type
order by item_type;

-- Vérifier les policies créées
select schemaname, tablename, policyname, permissive, roles, cmd, qual
from pg_policies
where tablename = 'shop_items'
order by policyname;

