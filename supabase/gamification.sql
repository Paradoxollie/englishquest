-- ============================================================================
-- GAMIFICATION DATA MODEL
-- ============================================================================
-- 
-- IMPORTANT: This SQL file must be copied and executed manually in the
-- Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql).
-- 
-- This migration creates the tables needed for gamification:
-- - games: Static game definitions (Enigma Scroll, Brew Your Words, etc.)
-- - game_scores: User scores for each game session
-- 
-- These tables will be used later to:
-- - Store game results and track user progress
-- - Feed XP and gold updates based on game performance
-- - Display leaderboards and statistics
-- 
-- ============================================================================

-- ============================================================================
-- GAMES TABLE
-- ============================================================================
-- Stores the definition of available games.
-- This is a reference table that should be populated with the games
-- defined in lib/games/config.ts
-- ============================================================================

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Index for faster lookups by slug
create index if not exists idx_games_slug on public.games(slug);

-- Enable Row Level Security
alter table public.games enable row level security;

-- Policy: Anyone can read games (public data)
drop policy if exists "Games are viewable by everyone" on public.games;
create policy "Games are viewable by everyone"
  on public.games
  for select
  using (true);

-- ============================================================================
-- GAME_SCORES TABLE
-- ============================================================================
-- Stores individual game session scores for each user.
-- Each row represents one game play session.
-- ============================================================================

create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  score integer not null,
  max_score integer,
  duration_ms integer,
  created_at timestamptz not null default timezone('utc', now())
);

-- Add difficulty column if it doesn't exist
-- This allows the migration to work even if the table already exists
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
  end if;
end $$;

-- Indexes for faster queries
create index if not exists idx_game_scores_user_id on public.game_scores(user_id);
create index if not exists idx_game_scores_game_id on public.game_scores(game_id);
create index if not exists idx_game_scores_created_at on public.game_scores(created_at desc);
create index if not exists idx_game_scores_difficulty on public.game_scores(difficulty);
create index if not exists idx_game_scores_game_difficulty_score on public.game_scores(game_id, difficulty, score desc);

-- Enable Row Level Security
alter table public.game_scores enable row level security;

-- Policy: Users can insert their own scores
drop policy if exists "Users can insert their own scores" on public.game_scores;
create policy "Users can insert their own scores"
  on public.game_scores
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can select their own scores
drop policy if exists "Users can select their own scores" on public.game_scores;
create policy "Users can select their own scores"
  on public.game_scores
  for select
  using (auth.uid() = user_id);

-- Policy: Anyone can view leaderboard scores (for public leaderboards)
-- This allows reading scores for leaderboard display
-- Note: In production, consider creating a view or function that only exposes
-- aggregated leaderboard data (username, best_score, games_played) without
-- exposing individual user_ids directly
drop policy if exists "Leaderboard scores are viewable by everyone" on public.game_scores;
create policy "Leaderboard scores are viewable by everyone"
  on public.game_scores
  for select
  using (true);

-- ============================================================================
-- HELPER FUNCTION: Update user XP and gold based on game score
-- ============================================================================
-- TODO: This function can be called after inserting a game_score
-- to automatically update the user's XP and gold in the profiles table.
-- For now, this is a placeholder that can be implemented later.
-- ============================================================================

-- Example function structure (commented out for now):
-- create or replace function public.update_user_rewards_from_game_score(
--   p_user_id uuid,
--   p_score integer,
--   p_max_score integer,
--   p_game_id uuid
-- )
-- returns void
-- language plpgsql
-- security definer
-- as $$
-- declare
--   xp_earned integer;
--   gold_earned integer;
-- begin
--   -- Calculate XP and gold based on score
--   -- Update profiles table
--   -- This will be implemented when game logic is ready
-- end;
-- $$;

-- ============================================================================
-- POPULATE GAMES TABLE
-- ============================================================================
-- After creating the tables above, run these INSERT statements to populate
-- the games table with the games defined in lib/games/config.ts
-- ============================================================================

-- Insert games (run these after the tables are created)
insert into public.games (slug, name, description, difficulty)
values
  (
    'enigma-scroll',
    'Enigma Scroll',
    'Devinez les mots cachés dans des énigmes. Améliorez votre vocabulaire en résolvant des mystères linguistiques.',
    'easy'
  ),
  (
    'brew-your-words',
    'Brew Your Words',
    'Construisez des phrases correctes sous pression temporelle. Maîtrisez la grammaire anglaise en créant des phrases parfaites.',
    'medium'
  ),
  (
    'echoes-of-lexicon',
    'Echoes of Lexicon',
    'Testez votre orthographe dans un style Spelling Bee. Épelez correctement les mots pour progresser.',
    'medium'
  ),
  (
    'arcane-listening-trials',
    'Arcane Listening Trials',
    'Écoutez et comprenez des dialogues en anglais. Développez vos compétences d''écoute avec des défis progressifs.',
    'hard'
  ),
  (
    'speed-verb-challenge',
    'Speed Verb Challenge',
    'Conjuguez les verbes irréguliers anglais le plus rapidement possible. Testez votre vitesse et votre mémoire avec ce défi chronométré.',
    'medium'
  )
on conflict (slug) do nothing;

-- ============================================================================
-- NOTES FOR FUTURE IMPLEMENTATION
-- ============================================================================
-- 
-- 1. After running this migration, the games table will be populated with
--    the 4 games above. These match the games in lib/games/config.ts.
-- 
-- 2. When a user completes a game, insert a row into game_scores:
--    insert into public.game_scores (user_id, game_id, score, max_score, duration_ms)
--    values (auth.uid(), <game_id>, <score>, <max_score>, <duration_ms>);
-- 
-- 3. Use the game_scores data to:
--    - Calculate daily streaks (check consecutive days with scores)
--    - Update user XP and gold in the profiles table
--    - Display leaderboards
--    - Show game statistics
-- 
-- 4. TODO: Create a function to automatically update user XP/gold when
--    a game_score is inserted (see commented function above).
-- 
-- ============================================================================

