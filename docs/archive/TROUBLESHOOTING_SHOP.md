# Dépannage - Gestion de la Boutique

**Archive, repère au 23 novembre 2026.** Pour un achat ou un portrait manquant, vérifier le catalogue actif, le reçu et l’article équipé avec les [essais des albums](../../scripts/tests/collection-shop-postgres.cjs) et de la [reprise des personnages](../../scripts/tests/character-roster-postgres.cjs).

## 🔍 Vérifications à faire

### 1. Vérifier le bucket Storage

1. Allez dans Supabase Dashboard → **Storage**
2. Vérifiez que le bucket `custom-images` existe
3. Vérifiez qu'il est marqué comme **Public**
4. Si le bucket n'existe pas, exécutez `supabase/storage_setup.sql`

### 2. Vérifier les politiques RLS

1. Allez dans Supabase Dashboard → **Storage** → **Policies**
2. Vérifiez que les politiques suivantes existent pour le bucket `custom-images`:
   - "Admins can upload any image" (INSERT)
   - "Admins can delete any image" (DELETE)
   - "Admins can update any image" (UPDATE)
   - "Public images are viewable by everyone" (SELECT)
3. Si les politiques n'existent pas, exécutez `supabase/storage_admin_policies.sql`

### 3. Vérifier les logs de la console

Ouvrez la console du navigateur (F12) et vérifiez :
- Quand vous cliquez sur "Modifier", vous devriez voir : `"Edit button clicked for item: [id]"`
- Quand vous sélectionnez un fichier, vous devriez voir : `"File selected: [nom] [taille] [type]"`
- Quand l'upload démarre, vous devriez voir : `"Starting image upload for item: [id]"`

### 4. Vérifier les erreurs serveur

Ouvrez la console du serveur (terminal où Next.js tourne) et vérifiez :
- Les logs d'upload avec les détails du fichier
- Les erreurs éventuelles de Supabase

## 🐛 Problèmes courants

### Le bouton "Modifier" ne fait rien

**Solution** :
1. Vérifiez la console du navigateur pour voir si le clic est détecté
2. Vérifiez que `editingItem` est bien défini dans le state
3. Le formulaire devrait apparaître en bas de la page avec une bordure cyan

### L'upload ne fonctionne pas

**Vérifications** :
1. Le bucket `custom-images` existe-t-il ?
2. Les politiques RLS sont-elles correctement configurées ?
3. Êtes-vous connecté en tant qu'admin ?
4. Le fichier fait-il moins de 5MB ?
5. Le format est-il supporté (JPG, PNG, WebP, GIF) ?

**Solution** :
1. Exécutez `supabase/storage_setup.sql` si le bucket n'existe pas
2. Exécutez `supabase/storage_admin_policies.sql` pour les permissions admin
3. Vérifiez les logs dans la console pour voir l'erreur exacte

### Le formulaire de modification ne s'affiche pas

**Solution** :
1. Vérifiez que `editingItem` n'est pas `null` dans le state
2. Le formulaire apparaît en bas de la page, faites défiler
3. Vérifiez la console pour les erreurs JavaScript

### Les images ne s'affichent pas après upload

**Vérifications** :
1. L'URL de l'image est-elle correcte dans la base de données ?
2. Le bucket est-il public ?
3. L'image est-elle accessible via l'URL publique ?

**Solution** :
1. Vérifiez dans Supabase que `image_url` est bien rempli dans `shop_items`
2. Testez l'URL directement dans le navigateur
3. Vérifiez les permissions du bucket

## 📝 Checklist de configuration

- [ ] Bucket `custom-images` créé et public
- [ ] Politiques RLS configurées pour les admins
- [ ] Connecté en tant qu'admin
- [ ] Console du navigateur ouverte pour voir les logs
- [ ] Console serveur ouverte pour voir les erreurs

## 🔧 Commandes SQL à exécuter

1. **Créer le bucket** :
   ```sql
   -- Exécutez supabase/storage_setup.sql
   ```

2. **Configurer les permissions admin** :
   ```sql
   -- Exécutez supabase/storage_admin_policies.sql
   ```

3. **Vérifier le bucket** :
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'custom-images';
   ```

4. **Vérifier les politiques** :
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'objects' 
   AND schemaname = 'storage';
   ```

