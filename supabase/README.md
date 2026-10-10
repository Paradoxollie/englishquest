# Base de données Supabase

Projet de production : `englishquest` (eu-north-1). Plan gratuit : le projet se met
en veille après une semaine sans requête ; la page Supabase du projet permet de le
réveiller (bouton Restore), ou n'importe quelle visite du site une fois réveillé le
maintient actif.

## Organisation

- `migrations/` : les scripts, dans l'ordre de leur nom. Chaque script est rejouable
  (`if not exists`, `on conflict`). Les scripts 02 à 05 du 10 octobre 2026 ont été
  appliqués en production ce jour-là ; le 01 (suppression de trois jeux fantômes sans
  score) reste à passer à la main dans l'éditeur SQL.
- `archive/` : les 39 scripts historiques de 2025-2026, déjà exécutés, à ne pas relancer.

## Tables utilisées par le code

`profiles`, `games`, `game_scores`, `courses`, `user_course_progress`, `chapter_exams`,
`shop_items`, `user_items`, `user_equipped_items`, `site_visits`, `contact_messages`,
bucket de stockage `custom-images`. Les tables `marvel_*` et `ship_skins` sont des
restes d'anciens prototypes, non utilisées.
