# Base de données Supabase

## Organisation

- `migrations/` : les scripts à exécuter, dans l'ordre de leur nom (date puis numéro).
  Chaque script est écrit pour être rejouable sans dégât (`if not exists`, `on conflict`).
- `archive/` : les 39 scripts historiques de 2025-2026. Ils ont déjà été exécutés en
  production, dans un ordre inconnu. Ne pas les relancer. Ils servent de référence.

## Schéma de référence

Le schéma réel de la base de production n'est pas encore dans ce dépôt. Pour le capturer :

1. Dans le tableau de bord Supabase, ouvrir **Database → Schema Visualizer** ou utiliser
   `supabase db dump --schema public > supabase/migrations/0000_schema_reference.sql`
   avec la CLI Supabase connectée au projet.
2. Commiter le fichier obtenu. À partir de là, toute modification passe par un nouveau
   fichier dans `migrations/`.

## Tables utilisées par le code

`profiles`, `games`, `game_scores`, `courses`, `user_course_progress`, `shop_items`,
`user_items`, `user_equipped_items`, `site_visits`, `contact_messages`,
bucket de stockage `custom-images`.
