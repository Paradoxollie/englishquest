-- ============================================================================
-- DAILY CHALLENGE PIVOT: SPECIFIC GAMES TRACKING
-- ============================================================================
-- 
-- Run this script in the Supabase SQL Editor to support the new requirement:
-- Players must play 3 *specific* games to get the bonus.
-- 
-- This adds the 'daily_played_games' column to track exactly which games
-- have been completed today.
-- ============================================================================

do $$
begin
  -- daily_played_games: Array of game slugs played today
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'daily_played_games') then
    alter table public.profiles add column daily_played_games text[] default array[]::text[];
  end if;
end $$;
