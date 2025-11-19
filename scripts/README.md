# Scripts

## update-word-lists.js

Script pour télécharger et mettre à jour automatiquement les listes de mots depuis des sources libres de droits.

### Sources utilisées (toutes libres de droits)

1. **dwyl/english-words** (Public Domain)
   - Grande liste de mots anglais
   - URL: https://github.com/dwyl/english-words

2. **google-10000-english** (MIT License)
   - Top 10,000 mots anglais les plus communs
   - Déjà filtré pour exclure les gros mots
   - URL: https://github.com/first20hours/google-10000-english

3. **SCOWL** (Public Domain)
   - Listes de mots orientées correcteur orthographique
   - URL: https://github.com/en-wl/wordlist

### Utilisation

```bash
npm run update-word-lists
```

ou

```bash
node scripts/update-word-lists.js
```

### Fonctionnement

1. **Télécharge** les listes depuis les sources GitHub (fichiers texte bruts)
2. **Filtre** les mots :
   - Longueur entre 4 et 6 lettres
   - Uniquement des lettres (A-Z)
   - Exclut les mots inappropriés (depuis `inappropriate-words.txt`)
3. **Génère** deux listes :
   - **targetWords** : Mots communs (basés sur google-10000) - utilisés comme mots secrets
   - **validGuesses** : Tous les mots valides - utilisés pour valider les tentatives
4. **Écrit** le résultat dans `lib/games/words/enigma-scroll-words.json`

### Personnalisation

#### Ajouter des sources

Éditez `scripts/update-word-lists.js` et ajoutez dans `WORD_LIST_SOURCES` :

```javascript
{
  name: 'ma-source',
  url: 'https://example.com/words.txt',
  description: 'Description de la source'
}
```

#### Filtrer des mots inappropriés

Éditez `lib/games/words/inappropriate-words.txt` et ajoutez un mot par ligne :

```
WORD1
WORD2
...
```

#### Changer les longueurs de mots

Modifiez les paramètres `minLength` et `maxLength` dans les fonctions `processWords()`.

### Mise à jour automatique

Pour automatiser les mises à jour, vous pouvez :

1. **Ajouter un cron job** (Linux/Mac) :
   ```bash
   # Mettre à jour tous les lundis à 2h du matin
   0 2 * * 1 cd /path/to/project && npm run update-word-lists
   ```

2. **GitHub Actions** : Créer un workflow qui met à jour les listes périodiquement

3. **Script de build** : Intégrer dans votre processus de déploiement

### Notes

- Les listes sont téléchargées depuis GitHub (fichiers bruts)
- Tous les mots sont normalisés en MAJUSCULES
- Les doublons sont automatiquement supprimés
- Les mots sont triés alphabétiquement
- Les métadonnées (date de mise à jour, sources, comptes) sont incluses dans le JSON

