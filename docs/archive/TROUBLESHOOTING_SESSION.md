# Dépannage - Problème de Session après Login

**Archive, repère au 23 novembre 2026.** Pour une difficulté de connexion actuelle, distinguer la session du compte et la session d’une partie. Vérifier le trajet de retour après connexion et les [contrôles de régression](../../scripts/README.md).

## 🔍 Diagnostic

Si vous êtes redirigé vers `/auth/login` après vous être connecté, cela signifie que la session n'est pas correctement reconnue par le serveur.

## ✅ Vérifications à faire

### 1. Vérifier les logs du serveur

Après avoir essayé de vous connecter, regardez les logs de votre serveur Next.js. Vous devriez voir :
- `Session created successfully after login: [user-id]`
- `Session in ProtectedLayout: Found (user: [user-id])`

Si vous voyez `Session in ProtectedLayout: Not found`, les cookies ne sont pas correctement synchronisés.

### 2. Vérifier les cookies dans le navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Application** (Chrome) ou **Stockage** (Firefox)
3. Regardez les **Cookies** pour votre domaine
4. Cherchez des cookies commençant par `sb-` (Supabase)

**Cookies attendus :**
- `sb-[project-ref]-auth-token`
- `sb-[project-ref]-auth-token-code-verifier`

Si ces cookies n'existent pas, le problème vient de la création de la session.

### 3. Vérifier les variables d'environnement

Assurez-vous que votre `.env.local` contient :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

**Important :** Redémarrez votre serveur Next.js après avoir modifié `.env.local`

### 4. Vérifier que vous êtes bien connecté

1. Après le login, vérifiez dans Supabase :
   - Allez dans **Authentication** → **Users**
   - Votre utilisateur devrait apparaître avec une dernière connexion récente

2. Vérifiez dans la console du navigateur :
   - Ouvrez la console (F12)
   - Regardez les messages de log
   - Vous devriez voir des messages sur la session

## 🛠️ Solutions

### Solution 1 : Vider les cookies et réessayer

1. Ouvrez les outils de développement (F12)
2. Allez dans **Application** → **Cookies**
3. Supprimez tous les cookies pour votre domaine
4. Rafraîchissez la page
5. Essayez de vous connecter à nouveau

### Solution 2 : Vérifier la configuration Supabase

1. Allez dans votre projet Supabase
2. Allez dans **Settings** → **API**
3. Vérifiez que l'URL et les clés correspondent à votre `.env.local`

### Solution 3 : Redémarrer le serveur

Parfois, les changements de configuration nécessitent un redémarrage complet :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez
npm run dev
```

### Solution 4 : Vérifier la configuration des cookies

Le problème peut venir de la configuration des cookies dans Supabase. Vérifiez :

1. Allez dans **Settings** → **Authentication** → **URL Configuration**
2. Assurez-vous que **Site URL** est correctement configuré
3. Vérifiez les **Redirect URLs** autorisées

## 🔧 Debug Avancé

### Activer les logs détaillés

Dans `lib/supabase/server.ts`, les logs sont déjà activés. Vérifiez la console du serveur pour voir :
- Les cookies disponibles
- Les erreurs de session
- Les erreurs de lecture des cookies

### Tester manuellement la session

Après le login, ouvrez la console du navigateur et exécutez :

```javascript
// Vérifier la session côté client
const supabase = createBrowserClient();
const { data: { session } } = await supabase.auth.getSession();
console.log("Session:", session);
```

Si la session existe côté client mais pas côté serveur, c'est un problème de synchronisation des cookies.

## 📝 Prochaines Étapes

1. **Vérifiez les logs** du serveur après avoir essayé de vous connecter
2. **Vérifiez les cookies** dans le navigateur
3. **Essayez de vider les cookies** et de vous reconnecter
4. **Redémarrez le serveur** si nécessaire

Si le problème persiste, partagez :
- Les logs du serveur
- Les messages d'erreur dans la console du navigateur
- Les cookies présents dans le navigateur


