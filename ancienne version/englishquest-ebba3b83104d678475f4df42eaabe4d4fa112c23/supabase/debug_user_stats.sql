-- Script de diagnostic pour vérifier les statistiques utilisateur
-- Remplacez 'USER_ID' par l'ID de l'utilisateur à vérifier

-- 1. Vérifier les valeurs actuelles dans la table profiles
SELECT 
  id,
  username,
  role,
  xp,
  gold,
  level,
  updated_at,
  created_at
FROM public.profiles
WHERE id = '9afd68bb-9940-4c07-bd56-ee91a2e8dd28'::uuid;

-- 2. Vérifier les triggers sur la table profiles
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 3. Vérifier les contraintes sur les colonnes xp, gold, level
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND (
    conname LIKE '%xp%' OR
    conname LIKE '%gold%' OR
    conname LIKE '%level%'
  );

-- 4. Tester une mise à jour manuelle (à exécuter avec prudence)
-- UPDATE public.profiles
-- SET xp = 100, gold = 50, level = 2, updated_at = timezone('utc', now())
-- WHERE id = '9afd68bb-9940-4c07-bd56-ee91a2e8dd28'::uuid;

-- 5. Vérifier les politiques RLS sur la table profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

