# Configuration Supabase pour Wordfall

Ce guide vous explique comment configurer Supabase pour que le jeu Wordfall fonctionne correctement.

## 📋 Checklist de configuration

### Étape 1 : Vérifier la configuration actuelle

1. Ouvrez le **SQL Editor** dans votre dashboard Supabase
2. Exécutez le script `supabase/verify_wordfall_setup.sql`
3. Vérifiez les résultats :
   - ✅ = Tout est bon
   - ❌ = Action requise
   - ⚠️ = Avertissement (non bloquant)

### Étape 2 : Créer les tables (si nécessaire)

Si le script de vérification indique que des tables manquent :

1. **Exécutez `supabase/gamification.sql`** dans le SQL Editor
   - Ce script crée les tables `games` et `game_scores`
   - Configure les politiques RLS (Row Level Security)
   - Crée les index nécessaires
   - Ajoute la colonne `difficulty` à `game_scores`
   - Ajoute automatiquement le jeu Wordfall

### Étape 3 : Ajouter le jeu Wordfall (si nécessaire)

Si le script de vérification indique que le jeu n'existe pas :

1. **Exécutez `supabase/add_wordfall_game.sql`** dans le SQL Editor
   - Ce script ajoute automatiquement la colonne `slug` si elle n'existe pas
   - Ajoute la colonne `difficulty` à `game_scores` si elle n'existe pas
   - Ajoute le jeu "Wordfall" dans la table `games`
   - Utilise `on conflict do nothing` pour éviter les doublons
   - Fonctionne avec les deux schémas possibles (avec ou sans slug)

### Étape 4 : Vérifier la table profiles

Assurez-vous que la table `profiles` a les colonnes nécessaires :
- `xp` (integer, default 0)
- `gold` (integer, default 0)
- `level` (integer, default 1)

Si ces colonnes manquent, exécutez `supabase/profiles.sql`.

## 🔍 Vérification finale

Après avoir exécuté les scripts, réexécutez `supabase/verify_wordfall_setup.sql` pour confirmer que tout est correct.

## 📊 Structure attendue

### Table `games`
```sql
- id (uuid, primary key)
- slug (text, unique, not null)  ← Requis pour Wordfall
- name (text, not null)
- description (text)
- difficulty (text, check: 'easy'|'medium'|'hard')
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Table `game_scores`
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- game_id (uuid, references games)
- score (integer, not null)
- max_score (integer)
- duration_ms (integer)
- difficulty (text, check: 'easy'|'medium'|'hard')  ← Requis pour Wordfall
- created_at (timestamptz)
```

## 🐛 Résolution de problèmes

### Erreur "Game not found"

Si vous voyez cette erreur à la fin d'une partie :

1. **Vérifiez que le jeu existe** :
   ```sql
   SELECT id, slug, name FROM public.games WHERE slug = 'wordfall';
   ```

2. **Si aucun résultat**, exécutez `supabase/add_wordfall_game.sql`

3. **Vérifiez que la colonne slug existe** :
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = 'games' 
   AND column_name = 'slug';
   ```

4. **Si la colonne n'existe pas**, le script `add_wordfall_game.sql` l'ajoutera automatiquement

### Erreur "Column difficulty does not exist"

Si vous voyez cette erreur :

1. **Exécutez `supabase/add_wordfall_game.sql`** - il ajoutera automatiquement la colonne
2. **Ou manuellement** :
   ```sql
   ALTER TABLE public.game_scores 
   ADD COLUMN IF NOT EXISTS difficulty text 
   CHECK (difficulty IN ('easy', 'medium', 'hard'));
   ```

## ✅ Test rapide

Pour tester rapidement si tout fonctionne :

```sql
-- Vérifier que le jeu existe
SELECT * FROM public.games WHERE slug = 'wordfall';

-- Vérifier la structure de game_scores
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'game_scores' 
AND column_name IN ('difficulty', 'max_score', 'duration_ms');
```

Les deux requêtes doivent retourner des résultats.

