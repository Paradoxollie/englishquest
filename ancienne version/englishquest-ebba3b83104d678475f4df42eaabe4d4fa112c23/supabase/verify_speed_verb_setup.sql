-- ============================================================================
-- SCRIPT DE VÉRIFICATION - Speed Verb Challenge Setup
-- ============================================================================
-- Exécutez ce script dans le SQL Editor de Supabase pour vérifier que tout
-- est correctement configuré pour le jeu Speed Verb Challenge.
-- ============================================================================

-- 1. Vérifier que la table games existe et a les bonnes colonnes
SELECT 
  '1. Table games' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'games')
    THEN '✅ Table games existe'
    ELSE '❌ Table games N''EXISTE PAS - Exécutez supabase/gamification.sql'
  END as status;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'games'
ORDER BY ordinal_position;

-- 2. Vérifier que la table game_scores existe et a la colonne difficulty
SELECT 
  '2. Table game_scores' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_scores')
    THEN '✅ Table game_scores existe'
    ELSE '❌ Table game_scores N''EXISTE PAS - Exécutez supabase/gamification.sql'
  END as status;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'game_scores'
ORDER BY ordinal_position;

-- 3. Vérifier que la colonne difficulty existe dans game_scores
SELECT 
  '3. Colonne difficulty dans game_scores' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'game_scores' 
        AND column_name = 'difficulty'
    )
    THEN '✅ Colonne difficulty existe'
    ELSE '❌ Colonne difficulty N''EXISTE PAS - Exécutez supabase/gamification.sql'
  END as status;

-- 4. Vérifier que le jeu Speed Verb Challenge existe
SELECT 
  '4. Jeu Speed Verb Challenge' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.games WHERE slug = 'speed-verb-challenge')
    THEN '✅ Jeu speed-verb-challenge existe'
    ELSE '❌ Jeu speed-verb-challenge N''EXISTE PAS - Exécutez supabase/add_speed_verb_game.sql'
  END as status;

SELECT id, slug, name, difficulty, created_at
FROM public.games
WHERE slug = 'speed-verb-challenge';

-- 5. Vérifier les politiques RLS sur games
SELECT 
  '5. Politiques RLS sur games' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'games' 
        AND policyname = 'Games are viewable by everyone'
    )
    THEN '✅ Politique RLS existe'
    ELSE '❌ Politique RLS MANQUANTE - Exécutez supabase/gamification.sql'
  END as status;

SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'games';

-- 6. Vérifier les politiques RLS sur game_scores
SELECT 
  '6. Politiques RLS sur game_scores' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'game_scores'
    )
    THEN '✅ Politiques RLS existent'
    ELSE '❌ Politiques RLS MANQUANTES - Exécutez supabase/gamification.sql'
  END as status;

SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'game_scores'
ORDER BY policyname;

-- 7. Vérifier les index sur game_scores
SELECT 
  '7. Index sur game_scores' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'game_scores' 
        AND indexname = 'idx_game_scores_game_difficulty_score'
    )
    THEN '✅ Index important existe'
    ELSE '⚠️ Index manquant (non bloquant)'
  END as status;

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'game_scores'
ORDER BY indexname;

-- 8. Vérifier que la table profiles a les colonnes nécessaires
SELECT 
  '8. Colonnes XP/Gold/Level dans profiles' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name IN ('xp', 'gold', 'level')
    )
    THEN '✅ Colonnes XP/Gold/Level existent'
    ELSE '❌ Colonnes MANQUANTES - Vérifiez supabase/profiles.sql'
  END as status;

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('xp', 'gold', 'level')
ORDER BY column_name;

-- 9. Résumé des scores existants (si des scores ont déjà été enregistrés)
SELECT 
  '9. Scores existants' as check_name,
  COUNT(*) as total_scores,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT difficulty) as difficulties_used
FROM public.game_scores
WHERE game_id IN (SELECT id FROM public.games WHERE slug = 'speed-verb-challenge');

-- 10. Top scores par difficulté (si des scores existent)
SELECT 
  '10. Top scores par difficulté' as check_name,
  difficulty,
  MAX(score) as best_score,
  COUNT(*) as total_scores
FROM public.game_scores
WHERE game_id IN (SELECT id FROM public.games WHERE slug = 'speed-verb-challenge')
GROUP BY difficulty
ORDER BY 
  CASE difficulty
    WHEN 'easy' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'hard' THEN 3
  END;

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================
-- Si tous les checks montrent ✅, votre configuration est correcte !
-- Si vous voyez des ❌, exécutez les scripts SQL mentionnés.
-- ============================================================================

