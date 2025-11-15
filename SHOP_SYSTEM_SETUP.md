# Configuration du Système de Boutique

Ce guide explique comment configurer le système de boutique pour les avatars, titres et backgrounds.

## 📋 Checklist de configuration

### Étape 1 : Exécuter le script SQL dans Supabase

1. Ouvrez le **SQL Editor** dans votre dashboard Supabase
2. Exécutez le script `supabase/shop_system.sql`
3. Ce script crée :
   - La table `shop_items` (items disponibles à l'achat)
   - La table `user_items` (items possédés par les utilisateurs)
   - La table `user_equipped_items` (items actuellement équipés)
   - Les politiques RLS (Row Level Security)
   - Des exemples d'items (avatars, titres, backgrounds)

### Étape 2 : Vérifier la configuration

Après avoir exécuté le script, vérifiez que tout est bien créé :

```sql
-- Vérifier les items créés
SELECT item_type, name, price_gold, required_level, display_order
FROM public.shop_items
ORDER BY item_type, display_order;

-- Compter les items par type
SELECT item_type, count(*) as total
FROM public.shop_items
GROUP BY item_type;
```

## 🎮 Fonctionnalités

### Types d'items

1. **Avatars** : Personnalisation de l'apparence du joueur
2. **Titres** : Titres affichés sous le nom d'utilisateur
3. **Backgrounds** : Arrière-plans pour l'avatar

### Système d'achat

- **Prix en or** : Chaque item a un prix fixe en or
- **Niveau requis** : Certains items nécessitent un niveau minimum
- **Achat unique** : Un item ne peut être acheté qu'une seule fois par utilisateur
- **Déduction automatique** : L'or est automatiquement déduit lors de l'achat

### Système d'équipement

- Les joueurs peuvent équiper/déséquiper leurs items achetés
- Un seul item de chaque type peut être équipé à la fois
- Les changements sont sauvegardés immédiatement

## 📊 Structure des tables

### `shop_items`
- Contient tous les items disponibles
- Chaque item a un `item_type`, un `price_gold`, un `required_level`
- Les items peuvent être activés/désactivés avec `is_active`

### `user_items`
- Contient les items possédés par chaque utilisateur
- Enregistre la date d'achat et le prix payé

### `user_equipped_items`
- Contient les items actuellement équipés
- Un utilisateur peut avoir un avatar, un titre et un background équipés

## 🎨 Personnalisation des items

Vous pouvez ajouter/modifier des items dans Supabase :

```sql
-- Ajouter un nouvel avatar
INSERT INTO public.shop_items (item_type, name, description, item_key, price_gold, required_level, display_order, color_theme)
VALUES ('avatar', 'Nouvel Avatar', 'Description', 'avatar_new', 100, 10, 15, 'purple');

-- Ajouter un nouveau titre
INSERT INTO public.shop_items (item_type, name, description, item_key, price_gold, required_level, display_order)
VALUES ('title', 'Nouveau Titre', 'Description', 'title_new', 50, 5, 10);

-- Ajouter un nouveau background
INSERT INTO public.shop_items (item_type, name, description, item_key, price_gold, required_level, display_order, color_theme)
VALUES ('background', 'Nouveau Background', 'Description', 'bg_new', 75, 8, 12, 'cyan');
```

## 🔧 Personnalisation

### Modifier les prix
```sql
UPDATE public.shop_items
SET price_gold = 200
WHERE item_key = 'avatar_dragon_lord';
```

### Modifier les niveaux requis
```sql
UPDATE public.shop_items
SET required_level = 20
WHERE item_key = 'title_immortal';
```

### Désactiver un item
```sql
UPDATE public.shop_items
SET is_active = false
WHERE item_key = 'avatar_old';
```

## ✅ Test

1. Connectez-vous à votre application
2. Allez sur `/profile`
3. Vérifiez que :
   - La section "Personnalisation" s'affiche
   - La section "Boutique" s'affiche
   - Vous pouvez acheter des items (si vous avez assez d'or et le niveau requis)
   - Vous pouvez équiper/déséquiper vos items
   - L'or est bien déduit après un achat

## 🐛 Dépannage

### Les items ne s'affichent pas
- Vérifiez que `is_active = true` dans `shop_items`
- Vérifiez les politiques RLS

### L'achat échoue
- Vérifiez que l'utilisateur a assez d'or
- Vérifiez que l'utilisateur a le niveau requis
- Vérifiez que l'item n'est pas déjà possédé

### L'équipement ne fonctionne pas
- Vérifiez que l'utilisateur possède l'item dans `user_items`
- Vérifiez les politiques RLS sur `user_equipped_items`

