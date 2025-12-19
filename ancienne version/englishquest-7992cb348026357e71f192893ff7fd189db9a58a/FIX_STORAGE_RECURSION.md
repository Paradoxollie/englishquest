# Fix - Récursion infinie dans les politiques Storage

## 🔴 Problème

Erreur : `infinite recursion detected in policy for relation "profiles"`

Cette erreur se produit quand une politique RLS sur `storage.objects` essaie de vérifier si l'utilisateur est admin en interrogeant `profiles`, ce qui déclenche une autre vérification RLS, créant une boucle infinie.

## ✅ Solution

### Étape 1 : Exécuter le script SQL corrigé

Exécutez `supabase/storage_admin_policies.sql` dans le SQL Editor de Supabase.

Ce script :
1. Crée une fonction `is_admin_user()` avec `SECURITY DEFINER` qui évite la récursion
2. Configure les politiques RLS pour utiliser cette fonction
3. Permet aux admins d'uploader dans le dossier `shop-items/`

### Étape 2 : Vérifier la fonction

```sql
-- Vérifier que la fonction existe
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'is_admin_user';

-- Tester la fonction
SELECT public.is_admin_user();
```

### Étape 3 : Vérifier les politiques

```sql
-- Vérifier les politiques sur storage.objects
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%admin%';
```

## 🔧 Détails techniques

### Fonction `is_admin_user()`

- Utilise `SECURITY DEFINER` : s'exécute avec les privilèges du créateur
- Contourne RLS en utilisant les privilèges du super-utilisateur
- Marqué comme `STABLE` pour optimisation
- Permissions accordées à `authenticated` et `anon`

### Politiques RLS

Les politiques vérifient :
1. Si l'utilisateur est admin via `is_admin_user()` (pas de récursion)
2. OU si l'utilisateur upload dans son propre dossier (`custom/`)

## 📝 Structure des dossiers

- `shop-items/` : Réservé aux admins (avatars de la boutique)
- `custom/` : Pour les utilisateurs (images personnalisées, si activé)

## ⚠️ Important

Après avoir exécuté le script, **rechargez la page** du dashboard shop et réessayez l'upload.

Si l'erreur persiste :
1. Vérifiez que la fonction `is_admin_user()` existe
2. Vérifiez que vous êtes bien connecté en tant qu'admin
3. Vérifiez les logs de la console pour plus de détails

