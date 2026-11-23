# Comment ajouter des mots manuellement au dictionnaire Wordfall

**Archive, repère au 23 novembre 2026.** Pour Wordfall, éditer le [fichier de mots actuel](../../lib/games/words/wordfall-words.json), puis contrôler les traductions, le niveau et les essais des jeux de chute. [Essais](../../scripts/README.md)

Vous pouvez ajouter des mots manuellement de deux façons :

## Méthode 1 : Ajouter dans le script (recommandé)

1. Ouvrez le fichier `scripts/update-wordfall-dictionary.js`
2. Trouvez la fonction `createFallbackDictionary()` (lignes 342-397)
3. Ajoutez vos mots juste avant la fermeture de l'objet `return`, par exemple avant la ligne 396 :

```javascript
function createFallbackDictionary() {
  return {
    "ABLE": "capable",
    "ACID": "acide",
    // ... tous les mots existants ...
    "DEAL": "affaire",
    
    // 👇 Ajoutez vos mots ici (avant la ligne avec };) :
    "YOUR": "votre",
    "WORD": "mot",
    "HERE": "ici",
    "TEACH": "enseigner",
    "LEARN": "apprendre",
    // etc.
  };
}
```

**Important** : N'oubliez pas d'ajouter une virgule après le dernier mot existant ("DEAL": "affaire",) avant d'ajouter vos nouveaux mots !

4. Relancez le script :
```bash
npm run update-wordfall-dictionary
```

Le script va :
- Ajouter vos mots au dictionnaire
- Les filtrer pour ne garder que ceux de 4-6 lettres
- Les intégrer avec les traductions téléchargées depuis FreeDict
- Générer le fichier `wordfall-words.json` mis à jour

## Méthode 2 : Modifier directement le JSON (temporaire)

⚠️ **Attention** : Cette méthode est temporaire car le fichier sera écrasé lors de la prochaine exécution du script.

1. Ouvrez `lib/games/words/wordfall-words.json`
2. Ajoutez vos mots dans la section `translations` :

```json
{
  "translations": {
    "ABLE": "capable",
    // ... mots existants ...
    "YOUR": "votre",
    "WORD": "mot"
  },
  "wordsByLength": {
    "4": ["ABLE", ...],
    "5": ["ABOUT", ...],
    "6": ["ABROAD", ...]
  }
}
```

3. Ajoutez aussi les mots dans `wordsByLength` selon leur longueur :
   - Mots de 4 lettres → `wordsByLength["4"]`
   - Mots de 5 lettres → `wordsByLength["5"]`
   - Mots de 6 lettres → `wordsByLength["6"]`

⚠️ **Important** : Si vous utilisez cette méthode, vos modifications seront perdues lors de la prochaine exécution de `npm run update-wordfall-dictionary`.

## Recommandation

**Utilisez la Méthode 1** (modifier le script) pour que vos mots soient conservés lors des mises à jour automatiques.

## Format des traductions

- **Mot anglais** : en MAJUSCULES, 4-6 lettres uniquement
- **Traduction française** : en minuscules avec accents si nécessaire
- Exemple : `"BOOK": "livre"`

## Exemple complet

```javascript
function createFallbackDictionary() {
  return {
    // Mots existants...
    "ABLE": "capable",
    "ACID": "acide",
    
    // Vos nouveaux mots :
    "TEACH": "enseigner",
    "LEARN": "apprendre",
    "STUDY": "étudier",
    "SCHOOL": "école",
    "CLASS": "classe",
    "PUPIL": "élève",
    "TEACHER": "professeur" // ⚠️ 7 lettres - sera ignoré (max 6)
  };
}
```

