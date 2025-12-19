# 🔴 URGENT : Réparer le Shop

## Problème
Les policies RLS causent des erreurs 500 et empêchent l'accès aux shop_items.

## Solution immédiate

### Étape 1 : Exécuter le script de réparation

1. **Ouvrez le SQL Editor dans Supabase**
2. **Copiez et exécutez le contenu de `supabase/fix_shop_items_rls.sql`**

Ce script :
- ✅ Supprime les policies problématiques
- ✅ Recrée des policies séparées et fonctionnelles
- ✅ Vérifie que la contrainte item_type est correcte
- ✅ **NE SUPPRIME AUCUNE DONNÉE** - tous vos items sont toujours là !

### Étape 2 : Vérifier que vos données sont toujours là

Après avoir exécuté le script, vérifiez avec cette requête :

```sql
-- Vérifier que tous vos items existent toujours
SELECT item_type, COUNT(*) as total
FROM public.shop_items
GROUP BY item_type
ORDER BY item_type;
```

Si vous voyez vos items, tout va bien ! Le problème était juste les policies RLS.

### Étape 3 : Si des items manquent (peu probable)

Si vraiment des items ont été supprimés (ce qui ne devrait pas arriver), vous pouvez les restaurer depuis :
- Les backups Supabase (si activés)
- L'historique des requêtes SQL dans Supabase

## Pourquoi ça s'est passé ?

Le problème venait de la policy RLS "Admins can manage shop items" qui utilisait `FOR ALL`. Cette syntaxe peut causer des problèmes de performance et des erreurs 500. La solution est d'utiliser des policies séparées pour chaque opération (SELECT, INSERT, UPDATE, DELETE).

## Après la réparation

Une fois le script exécuté, tout devrait fonctionner normalement :
- ✅ Vous pouvez voir tous vos items
- ✅ Vous pouvez créer de nouveaux items
- ✅ Les skins de vaisseau fonctionnent
- ✅ Toutes vos données sont préservées





