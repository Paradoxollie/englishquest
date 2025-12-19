-- ============================================================================
-- DIAGNOSTIC ET RÉCUPÉRATION DES ITEMS DU SHOP
-- ============================================================================
-- Ce script vérifie si vos items existent toujours et les restaure si nécessaire
-- ============================================================================

-- ÉTAPE 1: Vérifier si vos items existent toujours
-- ============================================================================
SELECT 
  item_type,
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_active THEN 1 END) as active_items,
  COUNT(CASE WHEN NOT is_active THEN 1 END) as inactive_items
FROM public.shop_items
GROUP BY item_type
ORDER BY item_type;

-- Afficher tous les items par type
SELECT 
  id,
  item_type,
  name,
  item_key,
  is_active,
  created_at
FROM public.shop_items
ORDER BY item_type, display_order;

-- ÉTAPE 2: Vérifier les policies RLS
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'shop_items'
ORDER BY policyname;

-- ÉTAPE 3: Si les items existent mais ne sont pas visibles, vérifier les policies
-- ============================================================================

-- Vérifier si la policy "Shop items are viewable by everyone" existe et fonctionne
SELECT * FROM pg_policies 
WHERE tablename = 'shop_items' 
AND policyname = 'Shop items are viewable by everyone';

-- ÉTAPE 4: Si les items n'existent PAS, vous pouvez les recréer depuis les backups
-- ============================================================================
-- Si vous avez des backups Supabase, vous pouvez les restaurer
-- Sinon, vous devrez les recréer manuellement

-- ÉTAPE 5: Réparer les policies pour que tout soit visible
-- ============================================================================
-- IMPORTANT: On utilise DROP IF EXISTS pour éviter les erreurs si les policies n'existent pas

-- Supprimer UNIQUEMENT la policy problématique "FOR ALL"
DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;

-- S'assurer que les bonnes policies existent (sans erreur si elles existent déjà)
-- On utilise des blocs DO pour créer seulement si elles n'existent pas
-- Créer les policies seulement si elles n'existent pas déjà
DO $$
BEGIN
  -- Policy 1: Tout le monde peut lire les items ACTIFS
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_items' 
    AND policyname = 'Shop items are viewable by everyone'
  ) THEN
    CREATE POLICY "Shop items are viewable by everyone"
      ON public.shop_items
      FOR SELECT
      USING (is_active = true);
  END IF;

  -- Policy 2: Les admins peuvent voir TOUS les items (actifs et inactifs)
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

  -- Policy 3: Les admins peuvent insérer
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_items' 
    AND policyname = 'Admins can insert shop items'
  ) THEN
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
  END IF;

  -- Policy 4: Les admins peuvent modifier
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_items' 
    AND policyname = 'Admins can update shop items'
  ) THEN
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
  END IF;

  -- Policy 5: Les admins peuvent supprimer
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_items' 
    AND policyname = 'Admins can delete shop items'
  ) THEN
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
  END IF;
END $$;

-- ÉTAPE 6: Vérifier que tout fonctionne maintenant
-- ============================================================================
-- Testez cette requête - elle devrait retourner tous vos items actifs
SELECT * FROM public.shop_items WHERE is_active = true ORDER BY item_type, display_order;

