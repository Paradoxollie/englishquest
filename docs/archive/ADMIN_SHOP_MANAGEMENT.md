# Guide de Gestion de la Boutique (Admin)

**Archive, repère au 23 novembre 2026.** La gestion en service se trouve dans `/dashboard/shop`. Le vestiaire utilise les albums illustrés, les titres et l’inventaire des propriétaires. [État des albums](../../supabase/README.md)

Ce guide explique comment gérer les avatars, titres et backgrounds depuis le dashboard admin.

## 📍 Accès

1. Connectez-vous en tant qu'admin
2. Allez sur `/dashboard`
3. Cliquez sur "Gérer la Boutique"

## 🎨 Gérer les Avatars

### Créer un nouvel avatar

1. Cliquez sur l'onglet "Avatars"
2. Cliquez sur "+ Créer un Avatar"
3. Remplissez le formulaire :
   - **Nom** : Le nom de l'avatar (ex: "Guerrier")
   - **Description** : Description optionnelle
   - **Prix (or)** : Prix en or (0 pour gratuit)
   - **Niveau requis** : Niveau minimum pour acheter
4. Cliquez sur "Créer"

### Uploader une image pour un avatar

1. Trouvez l'avatar dans la liste
2. Cliquez sur "📤 Upload Image"
3. Sélectionnez une image (JPG, PNG, WebP, GIF, max 5MB)
4. L'image sera automatiquement uploadée et associée à l'avatar

**Note** : Les images sont stockées dans Supabase Storage et accessibles publiquement.

### Modifier un avatar

1. Cliquez sur "Modifier" sous l'avatar
2. Modifiez les informations souhaitées
3. Cliquez sur "Enregistrer"

## 🏷️ Gérer les Titres

Même processus que pour les avatars, mais les titres n'ont pas besoin d'images (juste du texte).

## 🖼️ Gérer les Backgrounds

Même processus que pour les avatars, avec upload d'images pour les backgrounds.

## 📝 Exemple : Créer l'avatar "Guerrier"

1. Créez un nouvel avatar avec :
   - Nom : "Guerrier"
   - Description : "Un guerrier courageux"
   - Prix : 50 or
   - Niveau requis : 5

2. Cliquez sur "📤 Upload Image" et uploadez l'image du guerrier

3. L'avatar sera maintenant disponible dans la boutique pour les joueurs de niveau 5+

## 🔧 Organisation

- Les items sont organisés par type (avatar, titre, background)
- L'ordre d'affichage peut être modifié via le champ "Ordre d'affichage"
- Les items peuvent être activés/désactivés (via la base de données directement)

## 💡 Conseils

- Utilisez des images de bonne qualité (mais pas trop lourdes, max 5MB)
- Organisez les items par ordre d'affichage pour une meilleure expérience utilisateur
- Les items gratuits (prix = 0) sont automatiquement disponibles pour tous les joueurs

