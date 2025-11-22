# Wordfall - Dictionnaire avec Traductions

Ce dossier contient le dictionnaire pour le jeu Wordfall avec traductions français-anglais.

## ⚡ Mise à jour automatique

**Le dictionnaire est généré automatiquement depuis des sources libres de droits !**

Le script télécharge automatiquement des traductions depuis :
- **FreeDict** (Public Domain) - Dictionnaire anglais-français avec des milliers de traductions
- **google-10000-english** (MIT) - Mots anglais communs pour filtrer

Pour mettre à jour le dictionnaire :

```bash
npm run update-wordfall-dictionary
```

ou

```bash
node scripts/update-wordfall-dictionary.js
```

Le script génère automatiquement `wordfall-words.json` avec **plus de 3000 mots** ayant des traductions françaises !

## Structure

- `wordfall-words.json` : Fichier JSON généré automatiquement (ne pas éditer manuellement)
  - Contient uniquement les mots qui ont une traduction française
  - Format: `{ translations: { "WORD": "traduction" }, wordsByLength: { 4: [...], 5: [...], 6: [...] } }`

## Format du JSON

```json
{
  "translations": {
    "ABLE": "capable",
    "ACID": "acide",
    ...
  },
  "wordsByLength": {
    "4": ["ABLE", "ACID", ...],
    "5": ["ABOUT", "ABOVE", ...],
    "6": ["ABROAD", "ABSENT", ...]
  },
  "_metadata": {
    "lastUpdated": "2025-01-20T...",
    "sources": [...],
    "counts": {
      "total": 500,
      "byLength": { "4": 200, "5": 200, "6": 100 }
    }
  }
}
```

## Différence avec Enigma Scroll

- **Enigma Scroll** : Utilise `enigma-scroll-words.json` avec tous les mots anglais (sans traduction)
- **Wordfall** : Utilise `wordfall-words.json` avec uniquement les mots qui ont une traduction française

## Étendre le dictionnaire

### Option 1 : Modifier le script (recommandé)

Éditez `scripts/update-wordfall-dictionary.js` et ajoutez des mots dans la fonction `createFallbackDictionary()` :

```javascript
function createFallbackDictionary() {
  return {
    "WORD": "traduction",
    "ANOTHER": "autre",
    ...
  };
}
```

Puis relancez le script.

### Option 2 : Ajouter une source en ligne

Modifiez `DICTIONARY_SOURCES` dans le script pour ajouter une nouvelle source de traductions.

## Notes

- Le jeu Wordfall n'utilise QUE les mots qui ont une traduction
- Si un mot n'a pas de traduction, il ne sera pas proposé dans le jeu
- Le dictionnaire peut être étendu manuellement ou via des sources en ligne

