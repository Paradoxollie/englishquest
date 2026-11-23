# Guide - Système de Crop d'Avatars

**Archive, repère au 23 novembre 2026.** Les personnages officiels possèdent maintenant un portrait et une silhouette. Le cadrage des nouveaux visuels et la reprise des anciens achats sont décrits dans le [point de reprise](../../REPRISE.md).

## 🎨 Fonctionnalités

### Crop d'image (style WhatsApp)
- Lors de l'upload d'une image pour un avatar ou background, un éditeur de crop s'ouvre
- Vous pouvez zoomer et déplacer l'image pour choisir la zone à afficher
- Format portrait obligatoire (ratio 2:3) pour tous les avatars et backgrounds

### Format uniforme
- Tous les avatars et backgrounds sont affichés en format portrait (2:3)
- Affichage cohérent dans :
  - La boutique (`/profile` → Boutique)
  - La gestion admin (`/dashboard/shop`)
  - La section personnalisation (`/profile` → Personnalisation)
  - Le header du profil

## 📐 Spécifications techniques

### Format d'image
- **Ratio** : 2:3 (largeur:hauteur)
- **Taille de sortie** : 400x600 pixels
- **Format** : JPEG (qualité 95%)
- **Taille max** : 5MB

### Validation
- L'image doit être en format portrait (hauteur > largeur)
- Si l'image est en paysage, un message d'erreur s'affiche

## 🎯 Utilisation

### Pour les admins (Dashboard)

1. Allez sur `/dashboard/shop`
2. Sélectionnez l'onglet "Avatars" ou "Backgrounds"
3. Cliquez sur "📤 Upload Image" sur un item
4. Sélectionnez une image en format portrait
5. L'éditeur de crop s'ouvre automatiquement
6. Ajustez la zone à afficher :
   - Utilisez le slider de zoom
   - Déplacez l'image avec la souris
7. Cliquez sur "✓ Valider"
8. L'image est automatiquement uploadée et associée à l'item

### Affichage

Les avatars s'affichent partout avec :
- Format portrait (ratio 2:3)
- Bordure noire
- Image centrée et recadrée automatiquement
- Background visible derrière l'avatar (dans la section personnalisation)

## 🔧 Détails techniques

### Composant ImageCropper
- Utilise `react-easy-crop` pour le crop
- Modal plein écran avec fond sombre
- Contrôles de zoom et positionnement
- Export en JPEG 400x600px

### Uniformisation
- Tous les previews utilisent `aspectRatio: "2/3"`
- Les images sont affichées avec `object-cover` pour un remplissage optimal
- Format cohérent dans tous les composants

## ⚠️ Notes importantes

- Les images sont automatiquement recadrées en 400x600px
- Le format portrait est obligatoire
- Les images en paysage seront rejetées avec un message d'erreur
- Le crop permet de choisir quelle partie de l'image sera visible

