# Configuration du Tracking des Visiteurs

**Archive, repère au 23 novembre 2026.** Le suivi actuel filtre notamment les préchargements reconnus et les écrans en direct. Les parties invitées restent invisibles dans les scores. Le [bilan de novembre](../FREQUENTATION-2026-11-23.md) contient les définitions et une requête reproductible.

Ce document explique comment configurer le système de tracking des visiteurs pour EnglishQuest.

## 📋 Vue d'ensemble

Le système de tracking enregistre automatiquement toutes les visites sur le site pour permettre l'analyse des statistiques de trafic :
- **Visiteurs uniques** : Nombre de visiteurs distincts (basé sur un hash de l'IP)
- **Visites totales** : Nombre total de pages visitées
- **Statistiques par jour** : Visiteurs uniques et visites totales pour chaque jour

## 🔧 Étapes de Configuration

### 1. Créer la table dans Supabase

1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **New Query**
4. Copiez-collez le contenu du fichier `supabase/site_visits.sql`
5. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

Cette étape crée :
- La table `site_visits` pour stocker les visites
- Les index pour optimiser les performances
- Les politiques RLS (Row Level Security) pour la sécurité
- Les fonctions SQL pour les statistiques

### 2. Configuration des Variables d'Environnement (Optionnel)

Pour plus de sécurité, vous pouvez définir un salt personnalisé pour le hash des IPs :

```env
VISITOR_HASH_SALT=votre-salt-secret-ici
```

Si cette variable n'est pas définie, un salt par défaut sera utilisé.

**Note** : Cette variable est optionnelle. Le système fonctionnera sans elle.

### 3. Déploiement

Le système est maintenant prêt ! Une fois déployé sur Vercel :

1. Le **middleware** (`middleware.ts`) intercepte automatiquement toutes les requêtes
2. Chaque visite est enregistrée via l'API route `/api/track-visit`
3. Les statistiques sont disponibles dans le dashboard admin

## 📊 Accéder aux Statistiques

1. Connectez-vous en tant qu'admin
2. Allez sur votre profil
3. Cliquez sur le bouton **Dashboard Admin**
4. Les statistiques de visiteurs apparaissent dans la section "Statistiques de visiteurs"

## 🔍 Fonctionnalités

### Statistiques Disponibles

- **Visiteurs uniques (total)** : Nombre total de visiteurs distincts depuis le début
- **Visites totales** : Nombre total de pages visitées
- **Visiteurs uniques (aujourd'hui)** : Nombre de visiteurs distincts aujourd'hui
- **Visites (aujourd'hui)** : Nombre de pages visitées aujourd'hui
- **Visiteurs par jour** : Détails des 30 derniers jours avec visiteurs uniques et visites totales

### Privacy

- Les IPs sont **hashées** avant d'être stockées (SHA-256)
- Aucune IP réelle n'est stockée en clair
- Conforme aux réglementations de protection des données

### Performance

- Le tracking est **asynchrone** et **non-bloquant**
- Les visites sont enregistrées sans ralentir le chargement des pages
- Les index optimisent les requêtes de statistiques

## 🐛 Dépannage

### Les statistiques ne s'affichent pas

1. Vérifiez que la table `site_visits` existe dans Supabase :
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'site_visits';
   ```

2. Vérifiez que les politiques RLS sont actives :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'site_visits';
   ```

3. Vérifiez les logs dans Supabase pour voir si des visites sont enregistrées :
   ```sql
   SELECT COUNT(*) FROM site_visits;
   ```

### Les visites ne sont pas enregistrées

1. Vérifiez que le middleware est bien déployé (fichier `middleware.ts` à la racine)
2. Vérifiez les logs Vercel pour voir si l'API route `/api/track-visit` est appelée
3. Vérifiez que l'API route a accès à `SUPABASE_SERVICE_ROLE_KEY`

### Erreurs de permissions

Si vous voyez des erreurs de permissions, vérifiez que :
- La politique "Anyone can insert site visits" est active
- La politique "Admins can view site visits" est active
- Votre utilisateur a bien le rôle "admin" dans la table `profiles`

## 📝 Notes Techniques

- Le middleware ignore automatiquement les fichiers statiques (images, CSS, JS, etc.)
- Les visites sont enregistrées avec la date normalisée à minuit UTC
- Le hash des IPs utilise SHA-256 avec un salt pour la sécurité
- Les statistiques sont calculées en temps réel à chaque chargement du dashboard

## 🔐 Sécurité

- Seuls les admins peuvent voir les statistiques (RLS)
- Les IPs sont hashées (pas stockées en clair)
- Le tracking utilise le client admin de Supabase (bypass RLS pour l'insertion)
- Les erreurs de tracking ne bloquent pas le fonctionnement du site

