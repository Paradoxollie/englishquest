-- Script pour nettoyer les scores qui ne sont pas des top scores personnels
-- Ce script supprime tous les scores sauf le meilleur score par utilisateur, jeu et difficulté
-- 
-- ATTENTION: Exécutez ce script avec précaution. Il supprimera définitivement des données.
-- Il est recommandé de faire une sauvegarde avant d'exécuter ce script.
--
-- Ce script peut être exécuté périodiquement pour maintenir la base de données propre.

-- Supprimer tous les scores sauf le meilleur score par utilisateur, jeu et difficulté
-- Pour chaque combinaison (user_id, game_id, difficulty), on garde uniquement le score le plus élevé

delete from public.game_scores
where id not in (
  -- Sous-requête pour identifier les IDs des meilleurs scores à conserver
  select distinct on (user_id, game_id, difficulty) id
  from public.game_scores
  order by user_id, game_id, difficulty, score desc, created_at desc
);

-- Vérifier le résultat
-- Cette requête devrait montrer qu'il n'y a plus qu'un seul score par utilisateur, jeu et difficulté
select 
  user_id,
  game_id,
  difficulty,
  count(*) as score_count,
  max(score) as best_score
from public.game_scores
group by user_id, game_id, difficulty
having count(*) > 1;

-- Si cette requête ne retourne aucun résultat, c'est que le nettoyage a réussi
-- Sinon, il reste des doublons à nettoyer manuellement

