-- Examens de chapitre : une ligne par joueur et par chapitre.
-- Rejouable sans dégât.

create table if not exists public.chapter_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chapter smallint not null check (chapter between 1 and 5),
  best_correct smallint not null default 0,
  total smallint not null default 15,
  attempts integer not null default 0,
  passed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter)
);

alter table public.chapter_exams enable row level security;

drop policy if exists "chapter_exams_select_own" on public.chapter_exams;
create policy "chapter_exams_select_own"
  on public.chapter_exams for select
  using (auth.uid() = user_id);

-- Les écritures passent par le serveur (clé service), pas par le navigateur.
