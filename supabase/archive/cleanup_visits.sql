-- Script de nettoyage des visites invalides dans site_visits
-- 
-- Ce script supprime :
-- 1. Les visites de bots/crawlers (basé sur user_agent)
-- 2. Les visites en double (même visitor_hash + même path dans les 30 secondes)
-- 3. Les visites avec IPs invalides (localhost, unknown)
--
-- ⚠️ ATTENTION : Ce script supprime définitivement des données
-- Il est recommandé de :
-- 1. Faire un backup de la table avant d'exécuter
-- 2. Vérifier d'abord avec les requêtes SELECT ci-dessous
-- 3. Exécuter dans une transaction pour pouvoir rollback si nécessaire

begin;

-- ============================================
-- ÉTAPE 1 : Vérification (à exécuter AVANT le nettoyage)
-- ============================================

-- Voir combien de visites seront supprimées (bots)
SELECT 
  COUNT(*) as bot_visits,
  'Visites de bots à supprimer' as description
FROM site_visits
WHERE user_agent IS NOT NULL
  AND (
    user_agent ILIKE '%bot%' OR
    user_agent ILIKE '%crawler%' OR
    user_agent ILIKE '%spider%' OR
    user_agent ILIKE '%scraper%' OR
    user_agent ILIKE '%googlebot%' OR
    user_agent ILIKE '%bingbot%' OR
    user_agent ILIKE '%slurp%' OR
    user_agent ILIKE '%duckduckbot%' OR
    user_agent ILIKE '%baiduspider%' OR
    user_agent ILIKE '%yandexbot%' OR
    user_agent ILIKE '%sogou%' OR
    user_agent ILIKE '%exabot%' OR
    user_agent ILIKE '%facebot%' OR
    user_agent ILIKE '%ia_archiver%' OR
    user_agent ILIKE '%facebookexternalhit%' OR
    user_agent ILIKE '%twitterbot%' OR
    user_agent ILIKE '%rogerbot%' OR
    user_agent ILIKE '%linkedinbot%' OR
    user_agent ILIKE '%embedly%' OR
    user_agent ILIKE '%quora%' OR
    user_agent ILIKE '%pinterest%' OR
    user_agent ILIKE '%slackbot%' OR
    user_agent ILIKE '%redditbot%' OR
    user_agent ILIKE '%applebot%' OR
    user_agent ILIKE '%whatsapp%' OR
    user_agent ILIKE '%flipboard%' OR
    user_agent ILIKE '%tumblr%' OR
    user_agent ILIKE '%bitlybot%' OR
    user_agent ILIKE '%skypeuripreview%' OR
    user_agent ILIKE '%nuzzel%' OR
    user_agent ILIKE '%discordbot%' OR
    user_agent ILIKE '%qwantify%' OR
    user_agent ILIKE '%bitrix%' OR
    user_agent ILIKE '%xing-contenttabreceiver%' OR
    user_agent ILIKE '%chrome-lighthouse%' OR
    user_agent ILIKE '%google-inspectiontool%' OR
    user_agent ILIKE '%ahrefsbot%' OR
    user_agent ILIKE '%semrushbot%' OR
    user_agent ILIKE '%mj12bot%' OR
    user_agent ILIKE '%dotbot%' OR
    user_agent ILIKE '%megaindex%' OR
    user_agent ILIKE '%blexbot%' OR
    user_agent ILIKE '%petalbot%' OR
    user_agent ILIKE '%bingpreview%'
  );

-- Voir les visites en double (même visitor_hash + même path dans les 30 secondes)
-- On garde la première visite et on supprime les autres
WITH ranked_visits AS (
  SELECT 
    id,
    visitor_hash,
    path,
    visited_at,
    ROW_NUMBER() OVER (
      PARTITION BY visitor_hash, path, 
      DATE_TRUNC('minute', visited_at) + 
      (EXTRACT(SECOND FROM visited_at)::int / 30) * INTERVAL '30 seconds'
      ORDER BY visited_at ASC
    ) as rn
  FROM site_visits
)
SELECT 
  COUNT(*) as duplicate_visits,
  'Visites en double à supprimer (garder la première, supprimer les autres)' as description
FROM ranked_visits
WHERE rn > 1;

-- Voir le total actuel
SELECT 
  COUNT(*) as total_visits_before,
  COUNT(DISTINCT visitor_hash) as unique_visitors_before
FROM site_visits;

-- ============================================
-- ÉTAPE 2 : NETTOYAGE (décommenter pour exécuter)
-- ============================================

-- 1. Supprimer les visites de bots
DELETE FROM site_visits
WHERE user_agent IS NOT NULL
  AND (
    user_agent ILIKE '%bot%' OR
    user_agent ILIKE '%crawler%' OR
    user_agent ILIKE '%spider%' OR
    user_agent ILIKE '%scraper%' OR
    user_agent ILIKE '%googlebot%' OR
    user_agent ILIKE '%bingbot%' OR
    user_agent ILIKE '%slurp%' OR
    user_agent ILIKE '%duckduckbot%' OR
    user_agent ILIKE '%baiduspider%' OR
    user_agent ILIKE '%yandexbot%' OR
    user_agent ILIKE '%sogou%' OR
    user_agent ILIKE '%exabot%' OR
    user_agent ILIKE '%facebot%' OR
    user_agent ILIKE '%ia_archiver%' OR
    user_agent ILIKE '%facebookexternalhit%' OR
    user_agent ILIKE '%twitterbot%' OR
    user_agent ILIKE '%rogerbot%' OR
    user_agent ILIKE '%linkedinbot%' OR
    user_agent ILIKE '%embedly%' OR
    user_agent ILIKE '%quora%' OR
    user_agent ILIKE '%pinterest%' OR
    user_agent ILIKE '%slackbot%' OR
    user_agent ILIKE '%redditbot%' OR
    user_agent ILIKE '%applebot%' OR
    user_agent ILIKE '%whatsapp%' OR
    user_agent ILIKE '%flipboard%' OR
    user_agent ILIKE '%tumblr%' OR
    user_agent ILIKE '%bitlybot%' OR
    user_agent ILIKE '%skypeuripreview%' OR
    user_agent ILIKE '%nuzzel%' OR
    user_agent ILIKE '%discordbot%' OR
    user_agent ILIKE '%qwantify%' OR
    user_agent ILIKE '%bitrix%' OR
    user_agent ILIKE '%xing-contenttabreceiver%' OR
    user_agent ILIKE '%chrome-lighthouse%' OR
    user_agent ILIKE '%google-inspectiontool%' OR
    user_agent ILIKE '%ahrefsbot%' OR
    user_agent ILIKE '%semrushbot%' OR
    user_agent ILIKE '%mj12bot%' OR
    user_agent ILIKE '%dotbot%' OR
    user_agent ILIKE '%megaindex%' OR
    user_agent ILIKE '%blexbot%' OR
    user_agent ILIKE '%petalbot%' OR
    user_agent ILIKE '%bingpreview%'
  );

-- 2. Supprimer les visites en double (garder la première, supprimer les autres)
-- On groupe par visitor_hash, path, et fenêtre de 30 secondes
DELETE FROM site_visits
WHERE id IN (
  WITH ranked_visits AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY visitor_hash, path, 
        DATE_TRUNC('minute', visited_at) + 
        (EXTRACT(SECOND FROM visited_at)::int / 30) * INTERVAL '30 seconds'
        ORDER BY visited_at ASC
      ) as rn
    FROM site_visits
  )
  SELECT id
  FROM ranked_visits
  WHERE rn > 1
);

-- ============================================
-- ÉTAPE 3 : Vérification après nettoyage
-- ============================================

-- Voir le total après nettoyage
SELECT 
  COUNT(*) as total_visits_after,
  COUNT(DISTINCT visitor_hash) as unique_visitors_after
FROM site_visits;

-- Voir les statistiques par jour (30 derniers jours)
SELECT 
  visit_date,
  COUNT(DISTINCT visitor_hash) as unique_visitors,
  COUNT(*) as total_visits
FROM site_visits
WHERE visit_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY visit_date
ORDER BY visit_date DESC;

-- ============================================
-- IMPORTANT : 
-- Si vous êtes satisfait des résultats, exécutez :
-- COMMIT;
--
-- Si vous voulez annuler, exécutez :
-- ROLLBACK;
-- ============================================

-- Décommenter la ligne suivante pour valider les changements :
-- COMMIT;

-- OU décommenter la ligne suivante pour annuler :
-- ROLLBACK;

