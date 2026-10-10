begin;

create extension if not exists "pgcrypto";

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

create index if not exists idx_user_course_progress_user_id on public.user_course_progress(user_id);
create index if not exists idx_user_course_progress_course_id on public.user_course_progress(course_id);
create index if not exists idx_user_course_progress_status on public.user_course_progress(status);

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

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

alter table public.courses enable row level security;
alter table public.user_course_progress enable row level security;

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
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

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
    select 1
    from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

drop policy if exists "Admins can view all progress" on public.user_course_progress;
create policy "Admins can view all progress"
on public.user_course_progress
for select
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

commit;
