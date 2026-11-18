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
- **15 novembre 2026 : production remise à jour.** Appliqués : les sections non destructives
  de `2026-11-15_apply_all_pending_oct16.sql` (3 et 5 à 10 : `search_path`, historique de l'XP
  et ligue, badges, boutique de départ, étoile d'entraînement, sessions de partie),
  `2026-10-16_30_classes.sql` (espace classe) et `2026-11-15_10_lock_public_writes.sql`
  (plus aucune écriture depuis le navigateur, scores plus lisibles publiquement).
  **Volontairement pas appliqué** (suppression de données, à décider) : sections 1, 2 et 4 du
  fichier consolidé (jeux fantômes, tables `marvel_*` et `ship_skins`, visites de test).
  Valeurs d'avant sauvegardées dans `output/backups/2026-11-15-avant-migrations.md` (hors dépôt).
- `archive/` : les 39 scripts historiques de 2025-2026, déjà exécutés, à ne pas relancer.

## Sauvegarde des parties et des missions invitées

Appliquer `migrations/20261118195018_reliable_game_scores_and_guest_progress.sql` avant
de publier la version qui reprend les missions invitées. Cette migration utilise les
sessions de partie du 16 octobre et la fonction de validation des cours du 13 octobre.

Une partie enregistrée ajoute son score, son gain et son reçu dans la même transaction.
Un nouvel envoi de la même partie retrouve le reçu initial. Les anciennes sessions
déjà utilisées gardent leur état. L'inscription utilise les 30 pièces de bienvenue
définies en base. Le solde des comptes existants est conservé.

Le serveur corrige les quiz invités et conserve sur l'appareil une preuve signée
pendant 180 jours. À la connexion, la base importe les résultats vérifiés, conserve
la meilleure note de chaque mission et attribue les récompenses dans l'ordre du
parcours. Le bilan d'audience compte les visites et les visiteurs distincts en base.
Ces trois fonctions sont appelables uniquement avec le rôle du serveur.

`npm test` exécute leurs essais sur un PostgreSQL en mémoire. Pour relancer
uniquement les essais de cette migration, utiliser `node scripts/tests/reliable-progress-postgres.cjs`.

## Albums du vestiaire

La migration `illustrated_reward_collections` introduit quatre albums et 23 pièces.
Elle archive les anciens modèles officiels et enregistre les objets déjà portés
dans l’inventaire de leur propriétaire. Un achat débite l’or, enregistre la pièce
et attribue les titres des albums terminés dans la même transaction. Les titres
acquis restent disponibles si le contenu d’un album change. L’interface
`/dashboard/shop` permet de rattacher une pièce à un album ou de l’archiver.
Les essais de ces règles s’exécutent avec `node scripts/tests/collection-shop-postgres.cjs`.

## Tables utilisées par le code

`profiles`, `games`, `game_scores`, `courses`, `user_course_progress`, `chapter_exams`,
`shop_items`, `user_items`, `user_equipped_items`, `site_visits`, `contact_messages`,
`xp_events`, `user_badges`, `course_practice`, `classes`, `class_members`, `class_assignments`, `class_join_attempts`, bucket de stockage `custom-images`. Les tables `marvel_*` et `ship_skins` sont des
restes d'anciens prototypes, non utilisées.
