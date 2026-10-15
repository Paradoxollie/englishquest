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
- Les quatre migrations du 13 octobre 2026 sont appliquées : lecture des profils
  sans récursion, validation et récompense atomiques des missions et examens,
  écritures des soldes et scores réservées au serveur. Les nouveaux comptes sont
  toujours créés avec le rôle étudiant ; les métadonnées utilisateur ne choisissent
  pas les droits administrateur.
- Les quatre migrations du 16 octobre 2026 (récompenses) sont à appliquer dans l'ordre :
  `10_xp_events` (historique de l'XP, ligue de la semaine), `11_badges`,
  `12_starter_shop` (boutique de départ, mises à jour et ajouts seulement),
  `13_course_practice` (étoile d'entraînement). Tant qu'elles ne sont pas passées,
  le site fonctionne : la ligue, les badges et les étoiles d'entraînement restent vides.
- `2026-10-16_30_classes.sql` (espace classe : classes à code, élèves inscrits, devoirs,
  limite des codes erronés) n'est pas encore appliquée. Les pages professeur et la carte
  Classe du profil en ont besoin ; sans elle, elles affichent un message d'erreur discret.
- `archive/` : les 39 scripts historiques de 2025-2026, déjà exécutés, à ne pas relancer.

## Tables utilisées par le code

`profiles`, `games`, `game_scores`, `courses`, `user_course_progress`, `chapter_exams`,
`shop_items`, `user_items`, `user_equipped_items`, `site_visits`, `contact_messages`,
`xp_events`, `user_badges`, `course_practice`, `classes`, `class_members`, `class_assignments`, `class_join_attempts`, bucket de stockage `custom-images`. Les tables `marvel_*` et `ship_skins` sont des
restes d'anciens prototypes, non utilisées.
