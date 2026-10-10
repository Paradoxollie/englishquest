# Configuration de l'Upload d'Images Personnalisées

Ce guide explique comment configurer le système d'upload d'images pour les avatars et backgrounds personnalisés.

## 📋 Checklist de configuration

### Étape 1 : Créer le bucket Storage dans Supabase

1. Ouvrez le **SQL Editor** dans votre dashboard Supabase
2. Exécutez le script `supabase/storage_setup.sql`
3. Ce script crée :
   - Le bucket `custom-images` pour stocker les images
   - Les politiques RLS pour permettre l'upload et la lecture des images

### Étape 2 : Vérifier la configuration

Après avoir exécuté le script, vérifiez dans Supabase :

1. Allez dans **Storage** dans le menu de gauche
2. Vérifiez que le bucket `custom-images` existe
3. Vérifiez qu'il est marqué comme **Public**

### Étape 3 : Tester l'upload

1. Connectez-vous à votre application
2. Allez sur `/profile`
3. Dans la section "Personnalisation", vous devriez voir des boutons "📤 Upload" pour :
   - Avatar
   - Background
4. Cliquez sur un bouton et sélectionnez une image (JPG, PNG, WebP ou GIF, max 5MB)
5. L'image devrait être uploadée et automatiquement équipée

## 🎨 Fonctionnalités

### Formats supportés
- JPEG / JPG
- PNG
- WebP
- GIF

### Limitations
- Taille maximum : 5MB par image
- Les images sont automatiquement ajoutées à votre collection
- Les images personnalisées sont automatiquement équipées après upload

### Organisation
- Les images sont stockées dans `custom/{user_id}/{type}_{timestamp}.{ext}`
- Chaque utilisateur a son propre dossier
- Les images sont publiques et accessibles à tous

## 🔧 Dépannage

### L'upload échoue
- Vérifiez que le bucket `custom-images` existe dans Supabase Storage
- Vérifiez que les politiques RLS sont correctement configurées
- Vérifiez la taille de l'image (max 5MB)
- Vérifiez le format de l'image (JPG, PNG, WebP, GIF uniquement)

### L'image ne s'affiche pas
- Vérifiez que le bucket est public
- Vérifiez que l'URL de l'image est correcte dans la console
- Vérifiez les permissions RLS sur le bucket

### L'image n'est pas équipée automatiquement
- Vérifiez les logs de la console pour les erreurs
- Vérifiez que l'item a bien été créé dans `shop_items`
- Vérifiez que l'item a bien été ajouté à `user_items`

## 📝 Notes

- Les images personnalisées sont créées comme des items de boutique gratuits
- Elles sont automatiquement ajoutées à votre collection
- Vous pouvez les équiper/déséquiper comme n'importe quel autre item
- Les images sont stockées de manière permanente dans Supabase Storage

