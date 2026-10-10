# Guide de Nettoyage des Visites

Ce guide explique comment nettoyer les anciennes données de visites qui ont été comptées avec les anciens critères (bots, prefetch, doublons).

## 📋 Vue d'ensemble

Le script `supabase/cleanup_visits.sql` supprime :
1. **Les visites de bots/crawlers** (Googlebot, Bingbot, etc.)
2. **Les visites en double** (même visiteur + même page dans les 30 secondes)
3. **Les visites avec IPs invalides** (localhost, unknown)

## ⚠️ AVANT DE COMMENCER

1. **Faites un backup** de votre table `site_visits` dans Supabase :
   ```sql
   -- Créer une table de backup
   CREATE TABLE site_visits_backup AS SELECT * FROM site_visits;
   ```

2. **Vérifiez les statistiques actuelles** dans votre dashboard admin

## 🔧 Étapes d'exécution

### Étape 1 : Ouvrir le SQL Editor dans Supabase

1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **New Query**

### Étape 2 : Exécuter les requêtes de vérification

1. Ouvrez le fichier `supabase/cleanup_visits.sql`
2. **Copiez-collez uniquement la section "ÉTAPE 1 : Vérification"** (lignes avec SELECT)
3. Exécutez ces requêtes pour voir :
   - Combien de visites de bots seront supprimées
   - Combien de visites en double seront supprimées
   - Les statistiques actuelles

### Étape 3 : Exécuter le nettoyage

1. **Décommentez les requêtes DELETE** dans la section "ÉTAPE 2 : NETTOYAGE"
2. **Commentez les requêtes SELECT** de vérification si vous les avez déjà exécutées
3. Exécutez le script

### Étape 4 : Vérifier les résultats

1. Exécutez les requêtes de la section "ÉTAPE 3 : Vérification après nettoyage"
2. Comparez les chiffres avant/après

### Étape 5 : Valider ou annuler

Le script est dans une transaction (`BEGIN`), donc vous pouvez :

- **Valider** : Exécutez `COMMIT;` (décommentez la ligne à la fin du script)
- **Annuler** : Exécutez `ROLLBACK;` (décommentez la ligne à la fin du script)

## 📊 Résultats attendus

Après le nettoyage, vous devriez voir :
- **Réduction significative** du nombre total de visites
- **Réduction modérée** du nombre de visiteurs uniques (car les bots créaient de faux visiteurs uniques)
- **Statistiques plus réalistes** dans le dashboard

## 🔍 Exemple de résultats

**Avant nettoyage :**
- Visites totales : 5 411
- Visiteurs uniques : 36
- Visites aujourd'hui : 1 470

**Après nettoyage (estimation) :**
- Visites totales : ~500-1000 (selon le trafic réel)
- Visiteurs uniques : ~20-30 (selon le trafic réel)
- Visites aujourd'hui : ~50-200 (selon le trafic réel)

*Note : Les chiffres réels dépendent de votre trafic réel*

## 🐛 Dépannage

### Le script ne s'exécute pas

- Vérifiez que vous êtes connecté en tant qu'admin dans Supabase
- Vérifiez que la table `site_visits` existe
- Vérifiez les erreurs dans les logs Supabase

### Les statistiques semblent toujours élevées

- Vérifiez que les nouveaux filtres sont bien actifs (déployés)
- Attendez quelques heures/jours pour que les nouvelles visites remplacent les anciennes
- Vérifiez qu'il n'y a pas d'autres sources de trafic (tests, développement, etc.)

### Je veux annuler le nettoyage

Si vous avez exécuté le script mais pas encore fait `COMMIT`, vous pouvez :
```sql
ROLLBACK;
```

Si vous avez déjà fait `COMMIT`, vous pouvez restaurer depuis le backup :
```sql
TRUNCATE TABLE site_visits;
INSERT INTO site_visits SELECT * FROM site_visits_backup;
```

## ✅ Après le nettoyage

Une fois le nettoyage terminé :
1. Les nouvelles visites seront automatiquement filtrées (bots, prefetch, doublons)
2. Les statistiques dans le dashboard seront plus réalistes
3. Vous pouvez supprimer la table de backup après vérification :
   ```sql
   DROP TABLE site_visits_backup;
   ```

