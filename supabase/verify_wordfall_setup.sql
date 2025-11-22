-- Script de vérification pour Wordfall
-- Exécutez ce script dans le SQL Editor de Supabase pour vérifier la configuration

-- Vérification 1: La table games existe-t-elle ?
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'games'
  ) then
    raise notice '✅ Table games existe';
  else
    raise notice '❌ Table games n''existe pas - Exécutez supabase/gamification.sql';
  end if;
end $$;

-- Vérification 2: La colonne slug existe-t-elle dans games ?
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'games' 
    and column_name = 'slug'
  ) then
    raise notice '✅ Colonne slug existe dans games';
  else
    raise notice '⚠️ Colonne slug n''existe pas dans games - Le script l''ajoutera automatiquement';
  end if;
end $$;

-- Vérification 3: Le jeu Wordfall existe-t-il ?
do $$
declare
  game_exists boolean;
  game_slug text;
  game_name text;
begin
  -- Vérifier avec slug
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'games' 
    and column_name = 'slug'
  ) then
    select exists(select 1 from public.games where slug = 'wordfall') into game_exists;
    if game_exists then
      select slug, name into game_slug, game_name from public.games where slug = 'wordfall' limit 1;
      raise notice '✅ Jeu Wordfall existe (slug: %, name: %)', game_slug, game_name;
    else
      raise notice '❌ Jeu Wordfall n''existe pas - Exécutez supabase/add_wordfall_game.sql';
    end if;
  else
    -- Vérifier avec name
    select exists(select 1 from public.games where name = 'Wordfall') into game_exists;
    if game_exists then
      select name into game_name from public.games where name = 'Wordfall' limit 1;
      raise notice '✅ Jeu Wordfall existe (name: %)', game_name;
      raise notice '⚠️ Colonne slug manquante - Le script l''ajoutera automatiquement';
    else
      raise notice '❌ Jeu Wordfall n''existe pas - Exécutez supabase/add_wordfall_game.sql';
    end if;
  end if;
end $$;

-- Vérification 4: La table game_scores existe-t-elle ?
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'game_scores'
  ) then
    raise notice '✅ Table game_scores existe';
  else
    raise notice '❌ Table game_scores n''existe pas - Exécutez supabase/gamification.sql';
  end if;
end $$;

-- Vérification 5: La colonne difficulty existe-t-elle dans game_scores ?
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'game_scores' 
    and column_name = 'difficulty'
  ) then
    raise notice '✅ Colonne difficulty existe dans game_scores';
  else
    raise notice '⚠️ Colonne difficulty n''existe pas dans game_scores - Le script l''ajoutera automatiquement';
  end if;
end $$;

-- Afficher les détails du jeu Wordfall s'il existe
select 
  'Détails du jeu Wordfall:' as info,
  id,
  slug,
  name,
  description,
  difficulty,
  created_at
from public.games
where slug = 'wordfall' or name = 'Wordfall'
limit 1;

