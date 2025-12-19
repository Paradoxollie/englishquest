# 🔴 URGENT : Réparer l'accès des joueurs à la boutique

## Problème
Les joueurs ne voient plus leurs items (avatars, titres, backgrounds, skins) dans la boutique et ne peuvent plus voir leurs items équipés.

## Solution immédiate

### Étape 1 : Exécuter le script de réparation

**Ouvrez le SQL Editor dans Supabase** et exécutez le contenu de :
**`supabase/fix_public_shop_access.sql`**

Ce script :
- ✅ Supprime et recrée la policy publique pour les items actifs
- ✅ S'assure que TOUT LE MONDE peut voir les items actifs
- ✅ Ne touche pas aux données

### Étape 2 : Vérifier que la policy fonctionne

Après avoir exécuté le script, testez avec cette requête (simule ce qu'un joueur verrait) :

```sql
-- Simuler ce qu'un joueur verrait (sans être connecté)
SELECT 
  id,
  item_type,
  name,
  is_active,
  price_gold
FROM public.shop_items
WHERE is_active = true
ORDER BY item_type, display_order;
```

**Vous devriez voir tous vos items actifs.**

### Étape 3 : Si ça ne fonctionne toujours pas

Si les joueurs ne voient toujours rien, vérifiez :

1. **Que la policy existe** :
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'shop_items' 
AND policyname = 'Shop items are viewable by everyone';
```

2. **Que les items sont bien actifs** :
```sql
SELECT item_type, COUNT(*) 
FROM shop_items 
WHERE is_active = true 
GROUP BY item_type;
```

3. **Testez en tant que joueur** :
   - Déconnectez-vous
   - Reconnectez-vous avec un compte joueur (non-admin)
   - Allez sur `/profile` → Boutique
   - Vous devriez voir tous les items actifs

## Cause du problème

La policy RLS "Shop items are viewable by everyone" peut avoir été modifiée ou supprimée lors des migrations. Le script la recrée correctement pour que tous les joueurs puissent voir les items actifs.

## Après la réparation

Une fois le script exécuté, les joueurs devraient pouvoir :
- ✅ Voir tous les items actifs dans la boutique
- ✅ Voir leurs items équipés (avatar, titre, background, skin de vaisseau)
- ✅ Acheter et équiper des items
- ✅ Voir leurs items possédés





