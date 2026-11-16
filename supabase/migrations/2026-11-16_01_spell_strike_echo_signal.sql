-- Huitième et neuvième jeux : Spell Strike (orthographe / Spelling Bee) et Echo Signal (compréhension orale).
-- Nettoie aussi d'éventuels anciens jeux fantômes jamais implémentés s'ils n'ont aucun score.

begin;

delete from public.games
where slug in ('brew-your-words', 'echoes-of-lexicon', 'arcane-listening-trials')
  and not exists (
    select 1 from public.game_scores gs where gs.game_id = public.games.id
  );

insert into public.games (slug, name, description, difficulty)
values
  (
    'spell-strike',
    'Spell Strike',
    'Écoute chaque mot anglais, appuie sur le contexte et frappe l''orthographe exacte sans faute.',
    'medium'
  ),
  (
    'echo-signal',
    'Echo Signal',
    'Capte les transmissions radio anglaises et relève les bonnes informations dans de courtes situations.',
    'medium'
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  difficulty = excluded.difficulty;

commit;
