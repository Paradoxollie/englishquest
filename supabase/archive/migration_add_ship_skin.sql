-- ============================================================================
-- MIGRATION: Ajouter le support des skins de vaisseau dans shop_items
-- ============================================================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- ============================================================================

begin;

-- Ajouter 'ship_skin' au type d'item autorisé
alter table public.shop_items
drop constraint if exists shop_items_item_type_check;

alter table public.shop_items
add constraint shop_items_item_type_check 
check (item_type in ('avatar', 'title', 'background', 'ship_skin'));

-- Ajouter la colonne equipped_ship_skin_id à user_equipped_items
alter table public.user_equipped_items
add column if not exists equipped_ship_skin_id uuid references public.shop_items(id) on delete set null;

-- Créer un skin de vaisseau par défaut s'il n'existe pas
insert into public.shop_items (item_type, name, description, item_key, price_gold, required_level, display_order, image_url, color_theme)
values
  ('ship_skin', 'Vaisseau Classique', 'Le vaisseau par défaut du jeu', 'ship_skin_default', 0, 1, 1, null, null)
on conflict (item_key) do nothing;

-- Ajouter des policies RLS séparées pour permettre aux admins de gérer les shop_items
-- (On utilise des policies séparées pour éviter les problèmes de performance)

-- Policy pour que les admins puissent voir tous les items (même inactifs)
drop policy if exists "Admins can view all shop items" on public.shop_items;
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

-- Policy pour que les admins puissent insérer
drop policy if exists "Admins can insert shop items" on public.shop_items;
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

-- Policy pour que les admins puissent modifier
drop policy if exists "Admins can update shop items" on public.shop_items;
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

-- Policy pour que les admins puissent supprimer
drop policy if exists "Admins can delete shop items" on public.shop_items;
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

commit;

