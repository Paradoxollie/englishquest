# Instructions de Migration pour les Skins de Vaisseau

## ⚠️ IMPORTANT : Exécuter le script de migration

Pour que les skins de vaisseau fonctionnent, vous devez exécuter le script de migration SQL dans Supabase.

## 📋 Étapes

1. **Ouvrez le SQL Editor dans Supabase**
   - Allez sur votre dashboard Supabase
   - Cliquez sur "SQL Editor" dans le menu de gauche

2. **Exécutez le script de migration**
   - Copiez le contenu du fichier `supabase/migration_add_ship_skin.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" ou appuyez sur `Ctrl+Enter`

3. **Vérifiez que la migration a réussi**
   - Exécutez cette requête pour vérifier :
   ```sql
   -- Vérifier que ship_skin est dans les types autorisés
   SELECT constraint_name, check_clause 
   FROM information_schema.check_constraints 
   WHERE constraint_name LIKE '%item_type%';
   
   -- Vérifier que la colonne equipped_ship_skin_id existe
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'user_equipped_items' 
   AND column_name = 'equipped_ship_skin_id';
   
   -- Vérifier que le skin par défaut existe
   SELECT * FROM shop_items WHERE item_type = 'ship_skin';
   ```

## 🔧 Si vous avez une erreur 500

Si vous obtenez une erreur 500 lors de la création d'un skin de vaisseau :

1. **Vérifiez que la contrainte a été mise à jour** :
   ```sql
   -- Vérifier la contrainte actuelle
   SELECT constraint_name, check_clause 
   FROM information_schema.check_constraints 
   WHERE constraint_name = 'shop_items_item_type_check';
   ```
   
   Elle doit contenir : `item_type in ('avatar', 'title', 'background', 'ship_skin')`

2. **Si la contrainte n'est pas à jour, exécutez manuellement** :
   ```sql
   ALTER TABLE public.shop_items
   DROP CONSTRAINT IF EXISTS shop_items_item_type_check;
   
   ALTER TABLE public.shop_items
   ADD CONSTRAINT shop_items_item_type_check 
   CHECK (item_type IN ('avatar', 'title', 'background', 'ship_skin'));
   ```

3. **Vérifiez que la policy RLS pour les admins existe** :
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'shop_items' 
   AND policyname = 'Admins can manage shop items';
   ```

4. **Si la policy n'existe pas, créez-la** :
   ```sql
   CREATE POLICY "Admins can manage shop items"
   ON public.shop_items
   FOR ALL
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
   ```

## ✅ Après la migration

Une fois la migration réussie, vous pouvez :
- Aller sur `/dashboard/shop`
- Cliquer sur l'onglet "Skins de Vaisseau"
- Créer et uploader des skins de vaisseau





