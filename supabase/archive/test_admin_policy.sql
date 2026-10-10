-- ============================================================================
-- TEST: Vérifier que la policy admin fonctionne
-- ============================================================================
-- Exécutez cette requête pour tester si vous pouvez voir les items en tant qu'admin
-- ============================================================================

-- Test 1: Vérifier votre rôle actuel
SELECT 
  id,
  role,
  username
FROM public.profiles
WHERE id = auth.uid();

-- Test 2: Vérifier si vous pouvez voir les items (devrait retourner tous les items si vous êtes admin)
SELECT 
  id,
  item_type,
  name,
  is_active
FROM public.shop_items
ORDER BY item_type, display_order;

-- Test 3: Vérifier les policies actives
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'shop_items'
ORDER BY policyname;

-- Test 4: Vérifier si la policy admin fonctionne en testant la condition
SELECT 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) as is_admin_check;





