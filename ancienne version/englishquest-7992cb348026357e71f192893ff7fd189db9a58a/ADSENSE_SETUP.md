# Configuration Google AdSense - Guide de Résolution

## 🔍 Problème : "Introuvable" dans AdSense

L'erreur "Introuvable" signifie que Google AdSense ne peut pas trouver le code publicitaire sur votre site. Voici les étapes pour résoudre ce problème.

## ✅ Vérifications à faire

### 1. Vérifier que le code AdSense est présent dans le HTML source

1. Allez sur votre site en production : `https://englishquest-omega.vercel.app`
2. Faites un clic droit → **Afficher le code source de la page** (ou `Ctrl+U`)
3. Recherchez `adsbygoogle` dans le code source
4. Vous devriez voir :
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6094969027977372"></script>
   ```
   et
   ```html
   <ins class="adsbygoogle" data-ad-client="ca-pub-6094969027977372" data-ad-slot="1844574488"></ins>
   ```

**Si vous ne voyez pas ces éléments**, le problème vient du déploiement. Vérifiez que le code a bien été déployé.

### 2. Vérifier le fichier ads.txt

1. Allez sur : `https://englishquest-omega.vercel.app/ads.txt`
2. Vous devriez voir :
   ```
   google.com, pub-6094969027977372, DIRECT, f08c47fec0942fa0
   ```

**Si le fichier n'est pas accessible**, vérifiez qu'il est bien dans le dossier `public/` et redéployez.

### 3. Vérifier dans Google Search Console

**IMPORTANT** : AdSense nécessite que votre site soit vérifié dans Google Search Console.

1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre propriété : `https://englishquest-omega.vercel.app`
3. Vérifiez la propriété (via fichier HTML, balise meta, ou DNS)
4. Attendez que Google indexe votre site (peut prendre quelques jours)

### 4. Vérifier dans Google AdSense

1. Allez sur [Google AdSense](https://www.google.com/adsense)
2. Dans **Sites**, vérifiez que votre domaine est bien ajouté :
   - `englishquest-omega.vercel.app`
   - Ou votre domaine principal si vous en avez un
3. Si le site n'est pas listé, ajoutez-le :
   - Cliquez sur **Ajouter un site**
   - Entrez votre URL
   - Suivez les instructions

### 5. Vérifier que le site est accessible aux robots Google

1. Vérifiez votre fichier `robots.txt` :
   - Allez sur : `https://englishquest-omega.vercel.app/robots.txt`
   - Il ne doit pas bloquer Googlebot

2. Vérifiez que votre site n'est pas en mode maintenance ou protégé par mot de passe

## 🛠️ Solutions

### Solution 1 : Attendre l'indexation Google

Après avoir ajouté le code AdSense et vérifié le site dans Search Console, Google peut prendre **24 à 48 heures** pour :
- Indexer votre site
- Détecter le code AdSense
- Mettre à jour le statut dans AdSense

**Action** : Attendez 24-48h après avoir fait toutes les vérifications ci-dessus.

### Solution 2 : Forcer la réindexation

1. Dans Google Search Console :
   - Allez dans **URL Inspection**
   - Entrez votre URL principale
   - Cliquez sur **Demander l'indexation**

2. Dans Google AdSense :
   - Allez dans **Sites**
   - Cliquez sur votre site
   - Cliquez sur **Vérifier à nouveau** ou **Re-vérifier**

### Solution 3 : Vérifier le domaine dans AdSense

Si vous avez plusieurs domaines (ex: `englishquest.fr` et `englishquest-omega.vercel.app`), assurez-vous que :
- Le domaine principal est ajouté dans AdSense
- Le domaine de prévisualisation Vercel est également ajouté (si nécessaire)
- Ou utilisez uniquement votre domaine principal

### Solution 4 : Vérifier les erreurs de console

1. Ouvrez votre site en production
2. Ouvrez la console du navigateur (F12)
3. Cherchez les erreurs liées à AdSense
4. Vérifiez que le script se charge correctement :
   ```javascript
   // Dans la console, tapez :
   console.log(window.adsbygoogle);
   // Devrait afficher un tableau, pas undefined
   ```

## 📋 Checklist de vérification

- [ ] Le code AdSense est visible dans le HTML source de la page
- [ ] Le fichier `ads.txt` est accessible à `/ads.txt`
- [ ] Le site est vérifié dans Google Search Console
- [ ] Le site est ajouté dans Google AdSense
- [ ] Le site est indexé par Google (vérifier dans Search Console)
- [ ] Aucune erreur dans la console du navigateur
- [ ] Le script AdSense se charge correctement
- [ ] Attendu 24-48h après toutes les vérifications

## 🔗 Liens utiles

- [Google AdSense](https://www.google.com/adsense)
- [Google Search Console](https://search.google.com/search-console)
- [Documentation AdSense](https://support.google.com/adsense)

## ⚠️ Notes importantes

1. **Temps d'attente** : Google peut prendre 24-48h pour détecter le code AdSense après l'ajout
2. **Domaine principal** : Si vous avez un domaine personnalisé (`englishquest.fr`), utilisez-le plutôt que le domaine Vercel
3. **Indexation** : Le site doit être indexé par Google avant qu'AdSense puisse le vérifier
4. **Contenu** : Assurez-vous que votre site a suffisamment de contenu (AdSense nécessite du contenu de qualité)

## 🐛 Debug

Si le problème persiste après 48h :

1. Vérifiez les logs de déploiement Vercel
2. Vérifiez que le code est bien déployé en production
3. Testez avec l'outil [Google Rich Results Test](https://search.google.com/test/rich-results)
4. Contactez le support AdSense avec :
   - L'URL de votre site
   - Une capture d'écran du code source montrant le code AdSense
   - Une capture d'écran de l'erreur dans AdSense



