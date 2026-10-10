# Diagnostic - Erreur "Database error saving new user"

## 🔍 Étapes de Diagnostic

### 1. Vérifier que le script SQL a été exécuté

1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor**
3. Exécutez cette requête pour vérifier que la table existe :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
```

**Résultat attendu :** Vous devriez voir une ligne avec `profiles`

### 2. Vérifier que le trigger existe

Exécutez cette requête :

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Résultat attendu :** Vous devriez voir le trigger `on_auth_user_created`

### 3. Vérifier que les politiques RLS sont actives

Exécutez cette requête :

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles';
```

**Résultat attendu :** Vous devriez voir au moins 4 politiques :
- Users can view own profile
- Users can update own profile
- Users can insert own profile
- Admins can list all profiles

### 4. Vérifier si le username existe déjà

Si vous essayez de créer un compte avec "ShadowFox", vérifiez si ce username existe déjà :

```sql
SELECT id, username, email, created_at
FROM public.profiles
WHERE username = 'shadowfox';
```

**Si vous voyez un résultat :** Le username est déjà pris. Essayez avec un autre username.

### 5. Vérifier les logs d'erreur dans Supabase

1. Allez dans **Logs** → **Postgres Logs**
2. Regardez les erreurs récentes
3. Cherchez des erreurs liées à :
   - `profiles` table
   - `handle_new_user` function
   - Constraint violations (23505, 23503)

### 6. Vérifier les variables d'environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

**Important :** Redémarrez votre serveur Next.js après avoir modifié `.env.local`

### 7. Tester la création manuelle d'un profil

Exécutez cette requête dans Supabase (remplacez les valeurs) :

```sql
-- Remplacez USER_ID par un ID d'utilisateur existant de auth.users
INSERT INTO public.profiles (id, username, email, role, xp, gold, level)
VALUES (
  'USER_ID_ICI',
  'testuser',
  'test@example.com',
  'student',
  0,
  0,
  1
);
```

**Si cela échoue :** Il y a un problème avec les politiques RLS ou la structure de la table.

## 🛠️ Solutions Courantes

### Problème : Username déjà pris

**Solution :** Utilisez un username différent. Le système vérifie maintenant automatiquement et affiche un message clair.

### Problème : Le trigger ne fonctionne pas

**Solution :** Ré-exécutez le script SQL complet depuis `supabase/profiles.sql`

### Problème : Erreur de permissions

**Solution :** Vérifiez que :
1. Les politiques RLS sont actives
2. La clé `SUPABASE_SERVICE_ROLE_KEY` est correcte
3. Le client admin est utilisé pour les opérations privilégiées

### Problème : Table profiles n'existe pas

**Solution :** Exécutez le script SQL complet depuis `supabase/profiles.sql`

## 📝 Prochaines Actions

1. **Exécutez le script SQL** si vous ne l'avez pas encore fait
2. **Vérifiez les logs** dans Supabase pour voir l'erreur exacte
3. **Essayez avec un username différent** (ex: "ShadowFox2")
4. **Vérifiez la console du navigateur** pour voir les erreurs côté client
5. **Vérifiez les logs du serveur Next.js** pour voir les erreurs côté serveur

## 🔧 Si le problème persiste

1. Copiez l'erreur exacte que vous voyez
2. Vérifiez les logs Postgres dans Supabase
3. Vérifiez les logs de votre serveur Next.js
4. Partagez ces informations pour un diagnostic plus approfondi



