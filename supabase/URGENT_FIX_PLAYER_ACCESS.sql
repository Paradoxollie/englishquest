-- ============================================================================
-- 🔴 URGENT : Réparer l'accès des joueurs à la boutique
-- ============================================================================
-- Ce script répare TOUTES les policies RLS pour que les joueurs puissent
-- voir leurs items, leurs items équipés, et les items de la boutique
-- ============================================================================

BEGIN;

-- ============================================================================
-- ÉTAPE 1: Supprimer TOUTES les policies existantes sur shop_items
-- ============================================================================
-- On repart de zéro pour éviter les conflits

DROP POLICY IF EXISTS "Shop items are viewable by everyone" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can view all shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can insert shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can update shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can delete shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;

-- ============================================================================
-- ÉTAPE 2: Recréer les policies dans le BON ordre
-- ============================================================================
-- IMPORTANT: La policy publique DOIT être créée en premier
-- Les policies admin sont plus permissives et ne bloquent pas la publique

-- Policy 1: TOUT LE MONDE peut voir les items ACTIFS (joueurs + admins)
CREATE POLICY "Shop items are viewable by everyone"
  ON public.shop_items
  FOR SELECT
  USING (is_active = true);

-- Policy 2: Les ADMINS peuvent voir TOUS les items (actifs ET inactifs)
-- Cette policy est plus permissive, elle ne bloque pas la publique
CREATE POLICY "Admins can view all shop items"
  ON public.shop_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy 3: Les ADMINS peuvent insérer
CREATE POLICY "Admins can insert shop items"
  ON public.shop_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy 4: Les ADMINS peuvent modifier
CREATE POLICY "Admins can update shop items"
  ON public.shop_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy 5: Les ADMINS peuvent supprimer
CREATE POLICY "Admins can delete shop items"
  ON public.shop_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- ÉTAPE 3: Vérifier les policies sur user_equipped_items
-- ============================================================================
-- Les joueurs doivent pouvoir voir LEURS PROPRES items équipés

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view their own equipped items" ON public.user_equipped_items;
DROP POLICY IF EXISTS "Users can update their own equipped items" ON public.user_equipped_items;
DROP POLICY IF EXISTS "Users can insert their own equipped items" ON public.user_equipped_items;

-- Policy: Les joueurs peuvent voir LEURS PROPRES items équipés
CREATE POLICY "Users can view their own equipped items"
  ON public.user_equipped_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les joueurs peuvent modifier LEURS PROPRES items équipés
CREATE POLICY "Users can update their own equipped items"
  ON public.user_equipped_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les joueurs peuvent créer LEURS PROPRES items équipés
CREATE POLICY "Users can insert their own equipped items"
  ON public.user_equipped_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ÉTAPE 4: Vérifier les policies sur user_items
-- ============================================================================
-- Les joueurs doivent pouvoir voir LEURS PROPRES items possédés

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view their own items" ON public.user_items;
DROP POLICY IF EXISTS "Users can insert their own items" ON public.user_items;

-- Policy: Les joueurs peuvent voir LEURS PROPRES items possédés
CREATE POLICY "Users can view their own items"
  ON public.user_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les joueurs peuvent créer LEURS PROPRES items possédés
-- (généralement fait via server action, mais on la met pour sécurité)
CREATE POLICY "Users can insert their own items"
  ON public.user_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- TESTS: Vérifier que tout fonctionne
-- ============================================================================

-- Test 1: Vérifier que la policy publique existe
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'shop_items'
AND policyname = 'Shop items are viewable by everyone';

-- Test 2: Compter les items visibles par type (devrait montrer tous les actifs)
SELECT 
  item_type,
  COUNT(*) as total_actifs
FROM public.shop_items
WHERE is_active = true
GROUP BY item_type
ORDER BY item_type;

-- Test 3: Vérifier les policies sur user_equipped_items
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'user_equipped_items';

-- Test 4: Vérifier les policies sur user_items
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'user_items';





