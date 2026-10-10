-- English Quest : les quatre migrations du 10 octobre 2026, dans l'ordre.
-- À coller telles quelles dans Supabase, SQL Editor, puis Run. Rejouable sans dégât.

-- ==== 2026-10-10_01_cleanup_ghost_games.sql ====
-- English Quest - nettoyage des jeux fantômes (2026-10-10)
-- À exécuter une fois dans l'éditeur SQL de Supabase (projet de production).
-- Ces trois jeux ont été insérés par gamification.sql en 2025 et n'ont jamais
-- été développés. Ils n'apparaissent pas sur le site mais polluent la table games
-- et peuvent fausser les statistiques du tableau de bord.

begin;

delete from public.game_scores
where game_id in (
  select id from public.games
  where slug in ('brew-your-words', 'echoes-of-lexicon', 'arcane-listening-trials')
);

delete from public.games
where slug in ('brew-your-words', 'echoes-of-lexicon', 'arcane-listening-trials');

-- L'ancien slug echo-lex a été renommé flashback (rename_echo_lex_to_flashback.sql).
-- On s'assure qu'il n'en reste pas de doublon.
delete from public.games
where slug = 'echo-lex'
  and exists (select 1 from public.games where slug = 'flashback');

commit;

-- Vérification : il doit rester exactement 6 jeux.
select slug, name, difficulty from public.games order by slug;

-- ==== 2026-10-10_02_placement.sql ====
-- Test de niveau : mémorise le chapitre de départ choisi par le test.
-- Rejouable sans dégât.

alter table public.profiles
  add column if not exists placement_chapter smallint,
  add column if not exists placement_at timestamptz;

comment on column public.profiles.placement_chapter is 'Chapitre de départ attribué par le test de niveau (1 à 5).';
comment on column public.profiles.placement_at is 'Date du dernier test de niveau.';

-- ==== 2026-10-10_03_chapter_exams.sql ====
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

-- ==== 2026-10-10_04_grammar_rush.sql ====
-- Septième jeu : Grammar Rush. Rejouable sans dégât.

insert into public.games (slug, name, description, difficulty)
values (
  'grammar-rush',
  'Grammar Rush',
  'Les questions des cours, sous chrono. Soixante secondes, quatre propositions, une série à tenir.',
  'medium'
)
on conflict (slug) do nothing;

