-- ============================================================================
-- FIX SÉCURISÉ : Réparer les policies RLS sans toucher aux données
-- ============================================================================
-- Ce script vérifie et corrige uniquement les policies nécessaires
-- NE SUPPRIME AUCUNE DONNÉE
-- ============================================================================

begin;

-- ÉTAPE 1: Vérifier quelles policies existent déjà
-- (Ne pas exécuter, juste pour information)
-- SELECT policyname FROM pg_policies WHERE tablename = 'shop_items';

-- ÉTAPE 2: Supprimer UNIQUEMENT les policies problématiques si elles existent
-- On utilise DROP IF EXISTS pour éviter les erreurs

DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;

-- ÉTAPE 3: S'assurer que la policy de lecture publique existe
-- Si elle existe déjà, on la laisse, sinon on la crée
DO $$
BEGIN
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
END $$;

-- ÉTAPE 4: S'assurer que les policies admin existent (sans erreur si elles existent déjà)
DO $$
BEGIN
  -- Policy pour que les admins voient tous les items
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

  -- Policy pour que les admins puissent insérer
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

  -- Policy pour que les admins puissent modifier
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

  -- Policy pour que les admins puissent supprimer
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

-- ÉTAPE 5: Vérifier que la contrainte item_type est correcte
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'shop_items_item_type_check'
    AND check_clause LIKE '%ship_skin%'
  ) THEN
    ALTER TABLE public.shop_items
    DROP CONSTRAINT IF EXISTS shop_items_item_type_check;
    
    ALTER TABLE public.shop_items
    ADD CONSTRAINT shop_items_item_type_check 
    CHECK (item_type IN ('avatar', 'title', 'background', 'ship_skin'));
  END IF;
END $$;

-- ÉTAPE 6: Vérifier que la colonne equipped_ship_skin_id existe
ALTER TABLE public.user_equipped_items
ADD COLUMN IF NOT EXISTS equipped_ship_skin_id uuid REFERENCES public.shop_items(id) ON DELETE SET NULL;

commit;

-- ============================================================================
-- VÉRIFICATIONS FINALES
-- ============================================================================

-- Vérifier que tous vos items sont toujours là
SELECT 
  item_type,
  COUNT(*) as total,
  COUNT(CASE WHEN is_active THEN 1 END) as actifs
FROM public.shop_items
GROUP BY item_type
ORDER BY item_type;

-- Vérifier les policies créées
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'shop_items'
ORDER BY policyname;





