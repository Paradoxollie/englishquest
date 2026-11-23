# Configuration Supabase pour Speed Verb Challenge

**Archive, repère au 23 novembre 2026.** Speed Verb Challenge utilise désormais la sauvegarde commune des scores et le contrôle de durée. L’état des tables de novembre et l’ordre des migrations figurent dans le [guide de la base](../../supabase/README.md).

Ce guide vous explique comment configurer Supabase pour que le jeu Speed Verb Challenge fonctionne correctement.

## 📋 Checklist de configuration

### Étape 1 : Vérifier la configuration actuelle

1. Ouvrez le **SQL Editor** dans votre dashboard Supabase
2. Exécutez le script `supabase/verify_speed_verb_setup.sql`
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

### Étape 3 : Ajouter le jeu Speed Verb Challenge

Si le script de vérification indique que le jeu n'existe pas :

1. **Exécutez `supabase/add_speed_verb_game.sql`** dans le SQL Editor
   - Ce script ajoute le jeu "Speed Verb Challenge" dans la table `games`
   - Utilise `on conflict do nothing` pour éviter les doublons

### Étape 4 : Vérifier la table profiles

Assurez-vous que la table `profiles` a les colonnes nécessaires :
- `xp` (integer, default 0)
- `gold` (integer, default 0)
- `level` (integer, default 1)

Si ces colonnes manquent, exécutez `supabase/profiles.sql`.

## 🔍 Vérification finale

Après avoir exécuté les scripts, réexécutez `supabase/verify_speed_verb_setup.sql` pour confirmer que tout est correct.

## 📊 Structure attendue

### Table `games`
```sql
- id (uuid, primary key)
- slug (text, unique, not null)
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
- difficulty (text, check: 'easy'|'medium'|'hard') ← IMPORTANT
- created_at (timestamptz)
```

### Table `profiles`
```sql
- id (uuid, primary key)
- xp (integer, default 0)
- gold (integer, default 0)
- level (integer, default 1)
- ... (autres colonnes)
```

## 🎮 Comment ça fonctionne

1. **Sauvegarde des scores** : Seuls les **top scores personnels** sont sauvegardés (un par difficulté)
2. **Calcul des récompenses** : XP et gold sont calculés selon :
   - Nombre de réponses correctes
   - Difficulté (easy=1 XP, medium=2 XP, hard=3 XP)
   - Bonus +80 XP si nouveau meilleur score global
3. **Mise à jour du profil** : XP, gold et level sont mis à jour automatiquement
4. **Leaderboards** : Les classements sont filtrés par difficulté

## 🐛 Dépannage

### Erreur "Game not found"
- Vérifiez que le jeu existe : `SELECT * FROM games WHERE slug = 'speed-verb-challenge';`
- Si absent, exécutez `supabase/add_speed_verb_game.sql`

### Erreur "Column difficulty does not exist"
- La colonne `difficulty` manque dans `game_scores`
- Exécutez `supabase/gamification.sql` (la section qui ajoute la colonne)

### Erreur de permissions RLS
- Vérifiez les politiques RLS : `SELECT * FROM pg_policies WHERE tablename = 'game_scores';`
- Exécutez `supabase/gamification.sql` pour recréer les politiques

### Les scores ne s'affichent pas
- Vérifiez que les scores sont bien sauvegardés : `SELECT * FROM game_scores WHERE game_id = (SELECT id FROM games WHERE slug = 'speed-verb-challenge');`
- Vérifiez que la colonne `difficulty` est remplie

## 💰 Vérifier que l'XP et l'or sont bien attribués

Pour vérifier que les récompenses XP et gold fonctionnent correctement :

1. **Exécutez `supabase/verify_xp_gold_rewards.sql`** dans le SQL Editor
2. Ce script vérifie :
   - Les profils avec XP/gold
   - La corrélation entre scores et récompenses
   - Les récompenses attendues vs réelles
   - Les scores récents et leurs récompenses

### Comportement attendu

**IMPORTANT** : Les récompenses XP/gold sont **TOUJOURS** attribuées, même si le score n'est pas sauvegardé !

- ✅ **Score sauvegardé** : Si c'est un nouveau record personnel → Score sauvegardé + XP/Gold attribués
- ✅ **Score non sauvegardé** : Si ce n'est pas un nouveau record → Score non sauvegardé MAIS XP/Gold quand même attribués

C'est normal : le système calcule et attribue les récompenses à chaque partie, mais ne sauvegarde que les top scores personnels pour éviter de surcharger la base de données.

### Formule des récompenses

- **XP** = (nombre de réponses correctes × XP par difficulté) + bonus si meilleur score global
  - Easy : 1 XP par réponse correcte
  - Medium : 2 XP par réponse correcte
  - Hard : 3 XP par réponse correcte
  - Bonus : +80 XP si nouveau meilleur score global

- **Gold** = floor(XP total / 8)

## ✅ Tout est prêt ?

Une fois que tous les checks du script de vérification montrent ✅, vous pouvez tester le jeu :

1. Connectez-vous à votre application
2. Allez sur `/play/speed-verb-challenge`
3. Jouez une partie
4. Vérifiez que :
   - Le score est sauvegardé (si c'est un nouveau record personnel)
   - Les récompenses XP/gold sont attribuées (toujours, même si score non sauvegardé)
   - Les top scores s'affichent correctement
5. Vérifiez votre profil : votre XP et gold doivent avoir augmenté

