-- Tables pour les jeux, scores et progression des cours
-- Run this script in the Supabase SQL Editor

begin;

-- Table des jeux disponibles
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  category text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Table des scores des joueurs pour chaque jeu
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  score integer not null default 0,
  played_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, game_id, played_at)
);

-- Index pour améliorer les performances des requêtes de scores
create index if not exists idx_game_scores_user_id on public.game_scores(user_id);
create index if not exists idx_game_scores_game_id on public.game_scores(game_id);
create index if not exists idx_game_scores_score on public.game_scores(score desc);

-- Table des cours (quests)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  course_number integer not null unique,
  title text not null,
  description text,
  required_xp integer not null default 0,
  reward_xp integer not null default 0,
  reward_gold integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Table de progression des cours par utilisateur
create table if not exists public.user_course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status text not null default 'locked' check (status in ('locked', 'unlocked', 'in_progress', 'completed')),
  best_score integer default 0,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, course_id)
);

-- Index pour améliorer les performances
create index if not exists idx_user_course_progress_user_id on public.user_course_progress(user_id);
create index if not exists idx_user_course_progress_course_id on public.user_course_progress(course_id);
create index if not exists idx_user_course_progress_status on public.user_course_progress(status);

-- Fonction pour mettre à jour updated_at
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Triggers pour updated_at
drop trigger if exists set_updated_at_games on public.games;
create trigger set_updated_at_games
before update on public.games
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_updated_at_courses on public.courses;
create trigger set_updated_at_courses
before update on public.courses
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_updated_at_user_course_progress on public.user_course_progress;
create trigger set_updated_at_user_course_progress
before update on public.user_course_progress
for each row
execute procedure public.set_current_timestamp_updated_at();

-- RLS pour games (lecture publique, écriture admin seulement)
alter table public.games enable row level security;

drop policy if exists "Games are viewable by everyone" on public.games;
create policy "Games are viewable by everyone"
on public.games
for select
using (true);

drop policy if exists "Only admins can insert games" on public.games;
create policy "Only admins can insert games"
on public.games
for insert
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- RLS pour game_scores
alter table public.game_scores enable row level security;

drop policy if exists "Users can view own scores" on public.game_scores;
create policy "Users can view own scores"
on public.game_scores
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own scores" on public.game_scores;
create policy "Users can insert own scores"
on public.game_scores
for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can view all scores" on public.game_scores;
create policy "Admins can view all scores"
on public.game_scores
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- RLS pour courses (lecture publique, écriture admin seulement)
alter table public.courses enable row level security;

drop policy if exists "Courses are viewable by everyone" on public.courses;
create policy "Courses are viewable by everyone"
on public.courses
for select
using (true);

drop policy if exists "Only admins can insert courses" on public.courses;
create policy "Only admins can insert courses"
on public.courses
for insert
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- RLS pour user_course_progress
alter table public.user_course_progress enable row level security;

drop policy if exists "Users can view own course progress" on public.user_course_progress;
create policy "Users can view own course progress"
on public.user_course_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own course progress" on public.user_course_progress;
create policy "Users can insert own course progress"
on public.user_course_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own course progress" on public.user_course_progress;
create policy "Users can update own course progress"
on public.user_course_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Teachers can view their students' progress" on public.user_course_progress;
create policy "Teachers can view their students' progress"
on public.user_course_progress
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

drop policy if exists "Admins can view all progress" on public.user_course_progress;
create policy "Admins can view all progress"
on public.user_course_progress
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

commit;












