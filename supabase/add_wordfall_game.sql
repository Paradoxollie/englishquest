-- Script pour ajouter le jeu Wordfall dans la table games
-- Exécutez ce script dans le SQL Editor de Supabase si le jeu n'existe pas encore
-- Ce script gère les deux schémas possibles (avec ou sans colonne slug)

-- Étape 1: Vérifier si la colonne slug existe
do $$
begin
  -- Si la colonne slug existe, utiliser le schéma avec slug
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'games' 
    and column_name = 'slug'
  ) then
    -- Schéma avec slug (gamification.sql)
    insert into public.games (slug, name, description, difficulty)
    values
      (
        'wordfall',
        'Wordfall',
        'Type falling words before they hit the ground. In free mode, invent as many valid words as you can!',
        'easy'
      )
    on conflict (slug) do nothing;
    
    raise notice '✅ Jeu Wordfall ajouté avec slug';
  else
    -- Schéma sans slug (games_and_progress.sql)
    -- Ajouter d'abord la colonne slug si elle n'existe pas
    if not exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'games' 
      and column_name = 'slug'
    ) then
      -- Ajouter la colonne slug
      alter table public.games add column if not exists slug text unique;
      create index if not exists idx_games_slug on public.games(slug);
      
      raise notice '✅ Colonne slug ajoutée à la table games';
    end if;
    
    -- Maintenant insérer le jeu avec slug
    insert into public.games (slug, name, description, difficulty)
    values
      (
        'wordfall',
        'Wordfall',
        'Type falling words before they hit the ground. In free mode, invent as many valid words as you can!',
        'easy'
      )
    on conflict (slug) do nothing;
    
    raise notice '✅ Jeu Wordfall ajouté';
  end if;
end $$;

-- Étape 2: Vérifier que la colonne difficulty existe dans game_scores
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'game_scores' 
    and column_name = 'difficulty'
  ) then
    alter table public.game_scores 
    add column difficulty text check (difficulty in ('easy', 'medium', 'hard'));
    
    create index if not exists idx_game_scores_difficulty on public.game_scores(difficulty);
    create index if not exists idx_game_scores_game_difficulty_score on public.game_scores(game_id, difficulty, score desc);
    
    raise notice '✅ Colonne difficulty ajoutée à la table game_scores';
  end if;
end $$;

-- Étape 3: Vérifier que le jeu a été ajouté
select 
  id, 
  slug, 
  name, 
  difficulty,
  created_at
from public.games
where slug = 'wordfall' or name = 'Wordfall'
order by created_at desc
limit 1;

-- Si aucun résultat, le jeu n'a pas été ajouté
-- Vérifiez les erreurs ci-dessus
