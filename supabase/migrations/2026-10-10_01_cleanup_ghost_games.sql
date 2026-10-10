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
