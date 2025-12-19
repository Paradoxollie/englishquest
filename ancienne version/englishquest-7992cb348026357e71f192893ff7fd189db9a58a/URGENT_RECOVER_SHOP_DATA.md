# 🔴 URGENT : Récupérer les données du Shop

## ⚠️ IMPORTANT : Vos données ne sont probablement PAS supprimées !

Les items du shop sont probablement toujours dans la base de données, mais les policies RLS les cachent. Suivez ces étapes pour les récupérer.

## 📋 Étapes de récupération

### Étape 1 : Vérifier si vos données existent

1. **Ouvrez le SQL Editor dans Supabase**
2. **Exécutez cette requête** :

```sql
-- Vérifier combien d'items vous avez par type
SELECT 
  item_type,
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_active THEN 1 END) as active_items
FROM public.shop_items
GROUP BY item_type
ORDER BY item_type;
```

**Si vous voyez des nombres > 0, vos données existent toujours !** Le problème est juste les policies RLS.

### Étape 2 : Voir tous vos items

Exécutez cette requête pour voir tous vos items :

```sql
SELECT 
  id,
  item_type,
  name,
  item_key,
  is_active,
  image_url,
  created_at
FROM public.shop_items
ORDER BY item_type, display_order;
```

### Étape 3 : Réparer les policies RLS

**Exécutez le script complet** : `supabase/check_and_recover_shop_items.sql`

Ce script :
- ✅ Vérifie que vos données existent
- ✅ Répare les policies RLS
- ✅ Rend tous vos items visibles

### Étape 4 : Si vos items sont marqués comme inactifs

Si vos items existent mais `is_active = false`, activez-les :

```sql
-- Activer tous les items
UPDATE public.shop_items
SET is_active = true
WHERE is_active = false;
```

### Étape 5 : Si vraiment des items ont été supprimés

Si la requête de l'étape 1 retourne 0 items, alors ils ont été supprimés. Dans ce cas :

1. **Vérifiez les backups Supabase** :
   - Allez dans votre dashboard Supabase
   - Section "Database" → "Backups"
   - Vérifiez s'il y a des backups récents

2. **Restaurez depuis un backup** si disponible

3. **Sinon, vous devrez recréer les items manuellement**

## 🔍 Diagnostic rapide

Exécutez cette requête pour un diagnostic complet :

```sql
-- Diagnostic complet
SELECT 
  'Total items' as info,
  COUNT(*)::text as value
FROM public.shop_items
UNION ALL
SELECT 
  'Items actifs',
  COUNT(*)::text
FROM public.shop_items
WHERE is_active = true
UNION ALL
SELECT 
  'Items inactifs',
  COUNT(*)::text
FROM public.shop_items
WHERE is_active = false
UNION ALL
SELECT 
  'Avatars',
  COUNT(*)::text
FROM public.shop_items
WHERE item_type = 'avatar'
UNION ALL
SELECT 
  'Titres',
  COUNT(*)::text
FROM public.shop_items
WHERE item_type = 'title'
UNION ALL
SELECT 
  'Backgrounds',
  COUNT(*)::text
FROM public.shop_items
WHERE item_type = 'background'
UNION ALL
SELECT 
  'Ship Skins',
  COUNT(*)::text
FROM public.shop_items
WHERE item_type = 'ship_skin';
```

## ✅ Après la réparation

Une fois les policies réparées, vos items devraient réapparaître immédiatement dans :
- `/dashboard/shop`
- `/profile` (boutique)

**Les données ne sont probablement PAS supprimées - c'est juste un problème de visibilité !**





