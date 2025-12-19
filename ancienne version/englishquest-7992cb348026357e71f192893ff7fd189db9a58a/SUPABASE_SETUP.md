# Guide de Configuration Supabase pour EnglishQuest

Ce guide vous explique comment configurer Supabase pour que l'authentification et les profils fonctionnent correctement.

## 📋 Étapes de Configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Notez votre **Project URL** et vos **API Keys**

### 2. Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine de votre projet avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Où trouver ces clés :**
- Allez dans votre projet Supabase
- Cliquez sur **Settings** → **API**
- **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** = `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **NE JAMAIS** exposer cette clé côté client !)

### 3. Exécuter le Script SQL

Vous devez exécuter le script SQL pour créer la table `profiles` et les politiques de sécurité.

#### Option A : Via l'éditeur SQL de Supabase (Recommandé)

1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **New Query**
4. Copiez-collez le contenu du fichier `supabase/profiles.sql`
5. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

#### Option B : Via la CLI Supabase

```bash
# Si vous avez la CLI Supabase installée
supabase db push --file supabase/profiles.sql
```

### 4. Configurer l'Authentification dans Supabase

#### Désactiver la Vérification d'Email (pour le développement)

1. Allez dans **Authentication** → **Settings**
2. Dans la section **Email Auth**, décochez **Enable email confirmations**
   - ⚠️ **Important** : Activez-la en production pour la sécurité !

#### Autoriser les Emails Fantômes (optionnel)

Si vous voulez permettre les comptes sans email réel :

1. Allez dans **Authentication** → **Settings**
2. Dans **Email Auth**, vous pouvez laisser les paramètres par défaut
3. Le code utilise l'API Admin pour créer des utilisateurs avec des emails fantômes si nécessaire

### 5. Vérifier les Politiques RLS (Row Level Security)

Les politiques RLS sont créées automatiquement par le script SQL. Vérifiez qu'elles sont actives :

1. Allez dans **Table Editor** → **profiles**
2. Cliquez sur l'onglet **Policies**
3. Vous devriez voir ces politiques :
   - ✅ **Users can view own profile** (SELECT)
   - ✅ **Users can update own profile** (UPDATE)
   - ✅ **Users can insert own profile** (INSERT)
   - ✅ **Admins can list all profiles** (SELECT)

### 6. Tester l'Authentification

1. Démarrez votre serveur de développement :
   ```bash
   npm run dev
   ```

2. Allez sur `http://localhost:3000/auth/signup`
3. Créez un compte avec :
   - Un username (ex: "testuser")
   - Un email optionnel
   - Un mot de passe (minimum 8 caractères)

4. Vérifiez dans Supabase :
   - **Authentication** → **Users** : Vous devriez voir votre utilisateur
   - **Table Editor** → **profiles** : Vous devriez voir un profil créé automatiquement

5. Connectez-vous avec votre username ou email sur `http://localhost:3000/auth/login`

6. Accédez à la page profile : `http://localhost:3000/profile`

## 🔧 Dépannage

### Le profil n'est pas créé automatiquement

**Solution :**
1. Vérifiez que le trigger `on_auth_user_created` existe :
   - Allez dans **Database** → **Functions**
   - Cherchez `handle_new_user`
2. Vérifiez les logs dans **Logs** → **Postgres Logs**
3. Le code crée automatiquement le profil si le trigger échoue, mais vérifiez les erreurs dans la console

### Erreur "Invalid login credentials"

**Causes possibles :**
1. L'utilisateur n'existe pas dans `auth.users`
2. Le mot de passe est incorrect
3. L'email fantôme ne correspond pas

**Solution :**
- Essayez de vous connecter avec l'email complet (même si c'est un email fantôme)
- Vérifiez dans **Authentication** → **Users** que l'utilisateur existe

### Erreur "permission denied for table profiles"

**Solution :**
1. Vérifiez que les politiques RLS sont actives
2. Vérifiez que vous utilisez le bon client (admin pour les opérations privilégiées)
3. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correctement configuré

### La page profile ne s'affiche pas

**Vérifications :**
1. Vérifiez que vous êtes bien connecté (cookies de session)
2. Vérifiez les logs du serveur pour voir les erreurs
3. Vérifiez que le profil existe dans la table `profiles`
4. Vérifiez que les politiques RLS permettent la lecture

### Le username contient des caractères invalides

**Solution :**
Le code normalise automatiquement les usernames :
- Convertit en minuscules
- Remplace les caractères invalides par `_`
- Limite à 50 caractères

Si vous avez des usernames existants avec des caractères invalides, vous pouvez les nettoyer avec :

```sql
UPDATE profiles 
SET username = lower(regexp_replace(username, '[^a-z0-9_]', '_', 'g'))
WHERE username ~ '[^a-z0-9_]';
```

## 📝 Notes Importantes

1. **Service Role Key** : Cette clé contourne toutes les politiques RLS. Ne l'exposez JAMAIS côté client. Elle est utilisée uniquement dans les server actions.

2. **Emails Fantômes** : Le système génère des emails comme `username-xxxxx@noreply.englishquest.local` pour les utilisateurs sans email. Ces emails sont uniques et permettent l'authentification.

3. **Trigger SQL** : Le trigger `handle_new_user` crée automatiquement un profil quand un utilisateur est créé. Si le trigger échoue, le code crée le profil manuellement.

4. **Normalisation des Usernames** : Les usernames sont normalisés pour éviter les problèmes :
   - Minuscules uniquement
   - Caractères alphanumériques et `_` uniquement
   - Maximum 50 caractères

## ✅ Checklist de Vérification

Avant de considérer que tout fonctionne :

- [ ] Le fichier `.env.local` contient toutes les variables nécessaires
- [ ] Le script SQL a été exécuté sans erreur
- [ ] La table `profiles` existe et contient les bonnes colonnes
- [ ] Les politiques RLS sont actives sur la table `profiles`
- [ ] Le trigger `on_auth_user_created` existe
- [ ] La fonction `handle_new_user` existe
- [ ] Vous pouvez créer un compte via `/auth/signup`
- [ ] Un profil est créé automatiquement après l'inscription
- [ ] Vous pouvez vous connecter via `/auth/login`
- [ ] Vous pouvez accéder à `/profile` après connexion
- [ ] Les données du profil s'affichent correctement

## 🚀 Prochaines Étapes

Une fois que tout fonctionne :

1. Activez la vérification d'email en production
2. Configurez les emails de réinitialisation de mot de passe
3. Ajoutez des fonctionnalités supplémentaires (avatar, préférences, etc.)
4. Configurez les analytics et monitoring

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans Supabase : **Logs** → **Postgres Logs**
2. Vérifiez les logs de votre application Next.js
3. Vérifiez la console du navigateur pour les erreurs client
4. Vérifiez que toutes les variables d'environnement sont correctes




