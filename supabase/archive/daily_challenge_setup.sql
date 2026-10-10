-- ============================================================================
-- DAILY CHALLENGE SETUP
-- ============================================================================
-- 
-- Run this script in the Supabase SQL Editor to add the necessary columns
-- for the Daily Challenge feature.
-- 
-- ============================================================================

-- Add columns to profiles table if they don't exist
do $$
begin
  -- daily_games_count: Tracks how many games played today
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'daily_games_count') then
    alter table public.profiles add column daily_games_count integer default 0;
  end if;

  -- last_game_date: Tracks date of last game to know when to reset count
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'last_game_date') then
    alter table public.profiles add column last_game_date date;
  end if;

  -- last_daily_bonus_date: Tracks if bonus was already claimed today
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'last_daily_bonus_date') then
    alter table public.profiles add column last_daily_bonus_date date;
  end if;

  -- daily_streak: Tracks consecutive days played (stored in profile since game_scores only keeps Personal Bests)
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'daily_streak') then
    alter table public.profiles add column daily_streak integer default 0;
  end if;
end $$;

-- Update RLS policies to ensure users can read these new columns (usually covered by 'select *' but good to be safe if policies were specific)
-- Existing policies should cover "select" for own profile.
