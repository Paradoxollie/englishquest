-- ============================================================================
-- VÉRIFICATION XP ET GOLD - Speed Verb Challenge
-- ============================================================================
-- Ce script vérifie que les récompenses XP et gold sont bien attribuées
-- après les parties de Speed Verb Challenge.
-- ============================================================================

-- 1. Vérifier les profils avec XP et gold
SELECT 
  '1. Profils avec XP/Gold' as check_name,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN xp > 0 THEN 1 END) as profiles_with_xp,
  COUNT(CASE WHEN gold > 0 THEN 1 END) as profiles_with_gold,
  SUM(xp) as total_xp_all_users,
  SUM(gold) as total_gold_all_users,
  AVG(xp) as avg_xp_per_user,
  AVG(gold) as avg_gold_per_user
FROM public.profiles;

-- 2. Détails des profils avec XP/Gold (top 10)
SELECT 
  '2. Top 10 profils par XP' as check_name,
  id,
  username,
  xp,
  gold,
  level,
  updated_at
FROM public.profiles
WHERE xp > 0 OR gold > 0
ORDER BY xp DESC, gold DESC
LIMIT 10;

-- 3. Vérifier la corrélation entre scores et récompenses
-- Pour chaque utilisateur qui a joué, comparer ses scores avec son XP/Gold
SELECT 
  '3. Corrélation Scores vs XP/Gold' as check_name,
  p.id as user_id,
  p.username,
  p.xp as current_xp,
  p.gold as current_gold,
  p.level as current_level,
  COUNT(DISTINCT gs.difficulty) as difficulties_played,
  MAX(CASE WHEN gs.difficulty = 'easy' THEN gs.score ELSE 0 END) as best_easy,
  MAX(CASE WHEN gs.difficulty = 'medium' THEN gs.score ELSE 0 END) as best_medium,
  MAX(CASE WHEN gs.difficulty = 'hard' THEN gs.score ELSE 0 END) as best_hard,
  COUNT(gs.id) as total_scores_saved
FROM public.profiles p
LEFT JOIN public.game_scores gs ON gs.user_id = p.id
  AND gs.game_id = (SELECT id FROM public.games WHERE slug = 'speed-verb-challenge')
WHERE p.xp > 0 OR p.gold > 0 OR gs.id IS NOT NULL
GROUP BY p.id, p.username, p.xp, p.gold, p.level
ORDER BY p.xp DESC
LIMIT 20;

-- 4. Vérifier les scores récents et calculer les récompenses attendues
-- Cette requête calcule ce que devrait être l'XP/gold basé sur les scores
WITH game_info AS (
  SELECT id FROM public.games WHERE slug = 'speed-verb-challenge'
),
score_rewards AS (
  SELECT 
    gs.user_id,
    gs.difficulty,
    gs.score,
    gs.created_at,
    -- Calcul XP attendu selon la formule : correctCount × XP_per_difficulty
    CASE 
      WHEN gs.difficulty = 'easy' THEN gs.score * 1
      WHEN gs.difficulty = 'medium' THEN gs.score * 2
      WHEN gs.difficulty = 'hard' THEN gs.score * 3
    END as expected_base_xp,
    -- Vérifier si c'est un meilleur score global (approximation)
    CASE 
      WHEN gs.score = (
        SELECT MAX(score) 
        FROM public.game_scores gs2 
        WHERE gs2.game_id = gs.game_id 
          AND gs2.difficulty = gs.difficulty
          AND gs2.created_at <= gs.created_at
      )
      THEN 80
      ELSE 0
    END as bonus_xp_if_global_best,
    -- XP total attendu
    CASE 
      WHEN gs.difficulty = 'easy' THEN gs.score * 1
      WHEN gs.difficulty = 'medium' THEN gs.score * 2
      WHEN gs.difficulty = 'hard' THEN gs.score * 3
    END + 
    CASE 
      WHEN gs.score = (
        SELECT MAX(score) 
        FROM public.game_scores gs2 
        WHERE gs2.game_id = gs.game_id 
          AND gs2.difficulty = gs.difficulty
          AND gs2.created_at <= gs.created_at
      )
      THEN 80
      ELSE 0
    END as expected_total_xp,
    -- Gold attendu = floor(XP / 8)
    FLOOR((
      CASE 
        WHEN gs.difficulty = 'easy' THEN gs.score * 1
        WHEN gs.difficulty = 'medium' THEN gs.score * 2
        WHEN gs.difficulty = 'hard' THEN gs.score * 3
      END + 
      CASE 
        WHEN gs.score = (
          SELECT MAX(score) 
          FROM public.game_scores gs2 
          WHERE gs2.game_id = gs.game_id 
            AND gs2.difficulty = gs.difficulty
            AND gs2.created_at <= gs.created_at
        )
        THEN 80
        ELSE 0
      END
    ) / 8.0) as expected_gold
  FROM public.game_scores gs
  CROSS JOIN game_info gi
  WHERE gs.game_id = gi.id
)
SELECT 
  '4. Récompenses attendues vs actuelles' as check_name,
  p.username,
  p.xp as current_xp,
  p.gold as current_gold,
  COALESCE(SUM(sr.expected_total_xp), 0) as total_expected_xp,
  COALESCE(SUM(sr.expected_gold), 0) as total_expected_gold,
  CASE 
    WHEN p.xp >= COALESCE(SUM(sr.expected_total_xp), 0) * 0.9 
      THEN '✅ XP semble correct'
    ELSE '⚠️ XP pourrait être incorrect'
  END as xp_status,
  CASE 
    WHEN p.gold >= COALESCE(SUM(sr.expected_gold), 0) * 0.9 
      THEN '✅ Gold semble correct'
    ELSE '⚠️ Gold pourrait être incorrect'
  END as gold_status
FROM public.profiles p
LEFT JOIN score_rewards sr ON sr.user_id = p.id
WHERE p.xp > 0 OR p.gold > 0 OR EXISTS (
  SELECT 1 FROM public.game_scores gs 
  WHERE gs.user_id = p.id 
    AND gs.game_id = (SELECT id FROM public.games WHERE slug = 'speed-verb-challenge')
)
GROUP BY p.id, p.username, p.xp, p.gold
ORDER BY p.xp DESC
LIMIT 10;

-- 5. Vérifier les scores récents (dernières 24h)
SELECT 
  '5. Scores récents (24h)' as check_name,
  gs.user_id,
  p.username,
  gs.difficulty,
  gs.score,
  gs.created_at,
  p.xp as user_xp_after,
  p.gold as user_gold_after,
  p.level as user_level_after
FROM public.game_scores gs
JOIN public.profiles p ON p.id = gs.user_id
WHERE gs.game_id = (SELECT id FROM public.games WHERE slug = 'speed-verb-challenge')
  AND gs.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY gs.created_at DESC
LIMIT 20;

-- 6. Statistiques par difficulté
SELECT 
  '6. Statistiques par difficulté' as check_name,
  gs.difficulty,
  COUNT(*) as total_scores,
  COUNT(DISTINCT gs.user_id) as unique_players,
  MAX(gs.score) as best_score,
  AVG(gs.score) as avg_score,
  -- XP moyen attendu
  CASE 
    WHEN gs.difficulty = 'easy' THEN AVG(gs.score) * 1
    WHEN gs.difficulty = 'medium' THEN AVG(gs.score) * 2
    WHEN gs.difficulty = 'hard' THEN AVG(gs.score) * 3
  END as avg_expected_xp
FROM public.game_scores gs
WHERE gs.game_id = (SELECT id FROM public.games WHERE slug = 'speed-verb-challenge')
GROUP BY gs.difficulty
ORDER BY 
  CASE gs.difficulty
    WHEN 'easy' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'hard' THEN 3
  END;

-- 7. Vérifier si les profils sont mis à jour après les scores
-- Compare les timestamps updated_at des profils avec created_at des scores
SELECT 
  '7. Synchronisation Profils/Scores' as check_name,
  p.username,
  p.xp,
  p.gold,
  p.updated_at as profile_updated,
  MAX(gs.created_at) as last_score_created,
  CASE 
    WHEN MAX(gs.created_at) > p.updated_at 
      THEN '⚠️ Score plus récent que profil (peut être normal si pas de nouveau record)'
    WHEN MAX(gs.created_at) <= p.updated_at 
      THEN '✅ Profil mis à jour après score'
    ELSE 'ℹ️ Pas de scores'
  END as sync_status
FROM public.profiles p
LEFT JOIN public.game_scores gs ON gs.user_id = p.id
  AND gs.game_id = (SELECT id FROM public.games WHERE slug = 'speed-verb-challenge')
WHERE p.xp > 0 OR p.gold > 0
GROUP BY p.id, p.username, p.xp, p.gold, p.updated_at
HAVING MAX(gs.created_at) IS NOT NULL
ORDER BY MAX(gs.created_at) DESC
LIMIT 10;

-- ============================================================================
-- RÉSUMÉ
-- ============================================================================
-- Si vous voyez des ⚠️ dans la section 4, cela peut signifier :
-- 1. Les récompenses ne sont pas calculées correctement
-- 2. L'utilisateur a joué plusieurs fois (seuls les top scores sont sauvegardés)
-- 3. Les récompenses sont données même si le score n'est pas sauvegardé (comportement attendu)
--
-- Note : Les récompenses sont TOUJOURS données, même si le score n'est pas
-- sauvegardé (car ce n'est pas un nouveau record personnel).
-- ============================================================================

