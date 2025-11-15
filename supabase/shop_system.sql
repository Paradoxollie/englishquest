-- ============================================================================
-- SHOP SYSTEM - Système de boutique pour avatars, titres et backgrounds
-- ============================================================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- ============================================================================

begin;

-- ============================================================================
-- TABLE: shop_items
-- ============================================================================
-- Contient tous les items disponibles à l'achat (avatars, titres, backgrounds)
-- ============================================================================

create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  -- Type d'item: 'avatar', 'title', 'background'
  item_type text not null check (item_type in ('avatar', 'title', 'background')),
  -- Nom de l'item (ex: "Dragon Warrior", "Master", "Forest")
  name text not null,
  -- Description de l'item
  description text,
  -- Identifiant unique de l'item (ex: "avatar_dragon", "title_master", "bg_forest")
  item_key text not null unique,
  -- Prix en or
  price_gold integer not null default 0 check (price_gold >= 0),
  -- Niveau minimum requis pour acheter
  required_level integer not null default 1 check (required_level >= 1),
  -- Ordre d'affichage dans la boutique
  display_order integer not null default 0,
  -- Image/icône de l'item (URL ou identifiant)
  image_url text,
  -- Couleur/theme de l'item (pour les backgrounds)
  color_theme text,
  -- Actif ou non (pour désactiver temporairement)
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Index pour améliorer les performances
create index if not exists idx_shop_items_type on public.shop_items(item_type);
create index if not exists idx_shop_items_active on public.shop_items(is_active) where is_active = true;
create index if not exists idx_shop_items_level on public.shop_items(required_level);

-- ============================================================================
-- TABLE: user_items
-- ============================================================================
-- Contient les items possédés par les utilisateurs
-- ============================================================================

create table if not exists public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_item_id uuid not null references public.shop_items(id) on delete cascade,
  -- Date d'achat
  purchased_at timestamptz not null default timezone('utc', now()),
  -- Prix payé (pour historique)
  price_paid integer not null,
  unique(user_id, shop_item_id)
);

-- Index pour améliorer les performances
create index if not exists idx_user_items_user_id on public.user_items(user_id);
create index if not exists idx_user_items_shop_item_id on public.user_items(shop_item_id);

-- ============================================================================
-- TABLE: user_equipped_items
-- ============================================================================
-- Contient les items actuellement équipés par les utilisateurs
-- Un utilisateur peut avoir un avatar, un titre et un background équipés
-- ============================================================================

create table if not exists public.user_equipped_items (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Item équipé pour l'avatar
  equipped_avatar_id uuid references public.shop_items(id) on delete set null,
  -- Item équipé pour le titre
  equipped_title_id uuid references public.shop_items(id) on delete set null,
  -- Item équipé pour le background
  equipped_background_id uuid references public.shop_items(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- shop_items: Tout le monde peut lire les items disponibles
alter table public.shop_items enable row level security;

drop policy if exists "Shop items are viewable by everyone" on public.shop_items;
create policy "Shop items are viewable by everyone"
  on public.shop_items
  for select
  using (true);

-- user_items: Les utilisateurs peuvent voir leurs propres items
alter table public.user_items enable row level security;

drop policy if exists "Users can view own items" on public.user_items;
create policy "Users can view own items"
  on public.user_items
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own items" on public.user_items;
create policy "Users can insert own items"
  on public.user_items
  for insert
  with check (auth.uid() = user_id);

-- user_equipped_items: Les utilisateurs peuvent voir et modifier leurs items équipés
alter table public.user_equipped_items enable row level security;

drop policy if exists "Users can view own equipped items" on public.user_equipped_items;
create policy "Users can view own equipped items"
  on public.user_equipped_items
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own equipped items" on public.user_equipped_items;
create policy "Users can update own equipped items"
  on public.user_equipped_items
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can insert own equipped items" on public.user_equipped_items;
create policy "Users can insert own equipped items"
  on public.user_equipped_items
  for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- POPULATE SHOP ITEMS
-- ============================================================================
-- Exemples d'items à vendre (vous pouvez modifier selon vos besoins)
-- ============================================================================

-- Avatars (niveau 1 = gratuit, puis niveau 5, 10, 15, etc.)
insert into public.shop_items (item_type, name, description, item_key, price_gold, required_level, display_order, image_url, color_theme)
values
  -- Avatars gratuits (niveau 1)
  ('avatar', 'Défaut', 'Avatar par défaut', 'avatar_default', 0, 1, 1, null, 'emerald'),
  ('avatar', 'Guerrier', 'Un guerrier courageux', 'avatar_warrior', 0, 1, 2, null, 'red'),
  ('avatar', 'Mage', 'Un mage puissant', 'avatar_mage', 0, 1, 3, null, 'blue'),
  
  -- Avatars niveau 5
  ('avatar', 'Dragon Warrior', 'Un guerrier légendaire', 'avatar_dragon_warrior', 50, 5, 4, null, 'red'),
  ('avatar', 'Archmage', 'Un mage d''élite', 'avatar_archmage', 50, 5, 5, null, 'purple'),
  ('avatar', 'Ranger', 'Un archer expert', 'avatar_ranger', 50, 5, 6, null, 'green'),
  
  -- Avatars niveau 10
  ('avatar', 'Paladin', 'Un chevalier sacré', 'avatar_paladin', 150, 10, 7, null, 'gold'),
  ('avatar', 'Necromancer', 'Un sorcier des ténèbres', 'avatar_necromancer', 150, 10, 8, null, 'dark'),
  ('avatar', 'Assassin', 'Un tueur silencieux', 'avatar_assassin', 150, 10, 9, null, 'slate'),
  
  -- Avatars niveau 15
  ('avatar', 'Dragon Lord', 'Seigneur des dragons', 'avatar_dragon_lord', 300, 15, 10, null, 'red'),
  ('avatar', 'Celestial Mage', 'Mage céleste', 'avatar_celestial', 300, 15, 11, null, 'cyan'),
  
  -- Titres
  ('title', 'Débutant', 'Votre premier titre', 'title_beginner', 0, 1, 1, null, null),
  ('title', 'Élève', 'Un élève prometteur', 'title_student', 10, 3, 2, null, null),
  ('title', 'Expert', 'Un expert reconnu', 'title_expert', 50, 5, 3, null, null),
  ('title', 'Maître', 'Un maître accompli', 'title_master', 150, 10, 4, null, null),
  ('title', 'Légende', 'Une légende vivante', 'title_legend', 300, 15, 5, null, null),
  ('title', 'Immortel', 'Immortel parmi les mortels', 'title_immortal', 500, 20, 6, null, null),
  
  -- Backgrounds
  ('background', 'Défaut', 'Background par défaut', 'bg_default', 0, 1, 1, null, 'slate'),
  ('background', 'Forêt', 'Une forêt mystique', 'bg_forest', 25, 3, 2, null, 'green'),
  ('background', 'Océan', 'Les profondeurs de l''océan', 'bg_ocean', 25, 3, 3, null, 'blue'),
  ('background', 'Volcan', 'Un volcan en éruption', 'bg_volcano', 75, 7, 4, null, 'red'),
  ('background', 'Ciel', 'Les nuages célestes', 'bg_sky', 75, 7, 5, null, 'cyan'),
  ('background', 'Nuit', 'Une nuit étoilée', 'bg_night', 150, 10, 6, null, 'dark'),
  ('background', 'Aurore', 'L''aurore boréale', 'bg_aurora', 200, 12, 7, null, 'purple'),
  ('background', 'Cosmos', 'L''infini du cosmos', 'bg_cosmos', 300, 15, 8, null, 'dark')
on conflict (item_key) do nothing;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at sur shop_items
create or replace function public.update_shop_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists update_shop_items_updated_at on public.shop_items;
create trigger update_shop_items_updated_at
before update on public.shop_items
for each row
execute procedure public.update_shop_items_updated_at();

-- Trigger pour mettre à jour updated_at sur user_equipped_items
create or replace function public.update_user_equipped_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists update_user_equipped_items_updated_at on public.user_equipped_items;
create trigger update_user_equipped_items_updated_at
before update on public.user_equipped_items
for each row
execute procedure public.update_user_equipped_items_updated_at();

commit;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Exécutez ces requêtes pour vérifier que tout est bien créé
-- ============================================================================

-- Vérifier les items créés
select item_type, name, price_gold, required_level, display_order
from public.shop_items
order by item_type, display_order;

-- Compter les items par type
select item_type, count(*) as total
from public.shop_items
group by item_type;

