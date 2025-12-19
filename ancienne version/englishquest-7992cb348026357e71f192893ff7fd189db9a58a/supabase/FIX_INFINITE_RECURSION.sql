-- ============================================================================
-- 🔴 URGENT : Corriger la récursion infinie dans les policies RLS
-- ============================================================================
-- Le problème : Les policies admin sur shop_items vérifient profiles.role,
-- mais profiles a des policies RLS qui créent une récursion infinie.
-- ============================================================================

BEGIN;

-- ============================================================================
-- ÉTAPE 1: Créer une fonction sécurisée pour vérifier le rôle admin
-- ============================================================================
-- Cette fonction bypass RLS pour éviter la récursion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- IMPORTANT: Bypass RLS pour éviter la récursion
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
$$;

-- ============================================================================
-- ÉTAPE 2: Supprimer TOUTES les policies existantes sur shop_items
-- ============================================================================

DROP POLICY IF EXISTS "Shop items are viewable by everyone" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can view all shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can insert shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can update shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can delete shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;

-- ============================================================================
-- ÉTAPE 3: Recréer les policies en utilisant la fonction sécurisée
-- ============================================================================

-- Policy 1: TOUT LE MONDE peut voir les items ACTIFS
CREATE POLICY "Shop items are viewable by everyone"
  ON public.shop_items
  FOR SELECT
  USING (is_active = true);

-- Policy 2: Les ADMINS peuvent voir TOUS les items (actifs ET inactifs)
-- Utilise la fonction sécurisée pour éviter la récursion
CREATE POLICY "Admins can view all shop items"
  ON public.shop_items
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy 3: Les ADMINS peuvent insérer
CREATE POLICY "Admins can insert shop items"
  ON public.shop_items
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy 4: Les ADMINS peuvent modifier
CREATE POLICY "Admins can update shop items"
  ON public.shop_items
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy 5: Les ADMINS peuvent supprimer
CREATE POLICY "Admins can delete shop items"
  ON public.shop_items
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- ÉTAPE 4: Vérifier les policies sur user_equipped_items
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own equipped items" ON public.user_equipped_items;
DROP POLICY IF EXISTS "Users can update their own equipped items" ON public.user_equipped_items;
DROP POLICY IF EXISTS "Users can insert their own equipped items" ON public.user_equipped_items;

CREATE POLICY "Users can view their own equipped items"
  ON public.user_equipped_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipped items"
  ON public.user_equipped_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own equipped items"
  ON public.user_equipped_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ÉTAPE 5: Vérifier les policies sur user_items
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own items" ON public.user_items;
DROP POLICY IF EXISTS "Users can insert their own items" ON public.user_items;

CREATE POLICY "Users can view their own items"
  ON public.user_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON public.user_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- TESTS: Vérifier que tout fonctionne
-- ============================================================================

-- Test 1: Vérifier que la fonction existe
SELECT 
  proname,
  prosecdef,
  proisstrict
FROM pg_proc
WHERE proname = 'is_admin';

-- Test 2: Vérifier que la policy publique existe
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'shop_items'
AND policyname = 'Shop items are viewable by everyone';

-- Test 3: Compter les items visibles par type
SELECT 
  item_type,
  COUNT(*) as total_actifs
FROM public.shop_items
WHERE is_active = true
GROUP BY item_type
ORDER BY item_type;

-- Test 4: Vérifier les policies sur user_equipped_items
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'user_equipped_items';

-- Test 5: Vérifier les policies sur user_items
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'user_items';





