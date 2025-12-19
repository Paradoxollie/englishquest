-- ============================================================================
-- FIX: Réparer l'accès public aux items du shop
-- ============================================================================
-- Ce script s'assure que les joueurs peuvent voir les items actifs
-- ============================================================================

begin;

-- ÉTAPE 1: Vérifier les policies existantes
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'shop_items'
ORDER BY policyname;

-- ÉTAPE 2: S'assurer que la policy publique existe et fonctionne correctement
-- Supprimer la policy publique si elle existe (pour la recréer proprement)
DROP POLICY IF EXISTS "Shop items are viewable by everyone" ON public.shop_items;

-- Recréer la policy publique - TOUT LE MONDE peut voir les items ACTIFS
CREATE POLICY "Shop items are viewable by everyone"
  ON public.shop_items
  FOR SELECT
  USING (is_active = true);

-- ÉTAPE 3: S'assurer que les policies admin existent (sans conflit)
-- Les policies admin permettent de voir TOUS les items (actifs et inactifs)
-- Mais elles ne doivent PAS bloquer la policy publique

-- Vérifier que les policies admin existent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_items' 
    AND policyname = 'Admins can view all shop items'
  ) THEN
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
  END IF;
END $$;

commit;

-- ============================================================================
-- TEST: Vérifier que les policies fonctionnent
-- ============================================================================

-- Test 1: Vérifier que la policy publique existe
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'shop_items'
AND policyname = 'Shop items are viewable by everyone';

-- Test 2: Simuler une requête publique (devrait retourner tous les items actifs)
-- Note: Cette requête simule ce qu'un joueur verrait
SELECT 
  id,
  item_type,
  name,
  is_active,
  price_gold,
  required_level
FROM public.shop_items
WHERE is_active = true
ORDER BY item_type, display_order;

-- Test 3: Compter les items visibles par type
SELECT 
  item_type,
  COUNT(*) as total_actifs
FROM public.shop_items
WHERE is_active = true
GROUP BY item_type
ORDER BY item_type;





