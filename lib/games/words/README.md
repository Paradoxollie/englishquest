# Enigma Scroll - Word Lists Management

Ce dossier contient les listes de mots pour le jeu Enigma Scroll.

## ⚡ Mise à jour automatique

**Les listes de mots sont maintenant générées automatiquement depuis des sources libres de droits !**

Pour mettre à jour les listes :

```bash
npm run update-word-lists
```

Ce script télécharge automatiquement des listes depuis :
- **dwyl/english-words** (Public Domain) - Grande liste de mots
- **google-10000-english** (MIT) - Mots communs
- **SCOWL** (Public Domain) - Listes de mots pour correcteur orthographique

Voir `scripts/README.md` pour plus de détails.

## Structure

- `enigma-scroll-words.json` : Fichier JSON généré automatiquement (ne pas éditer manuellement)
- `inappropriate-words.txt` : Liste de mots inappropriés à filtrer (un mot par ligne, en majuscules)

## Format du JSON

```json
{
  "targetWords": {
    "4": ["WORD1", "WORD2", ...],
    "5": ["WORD1", "WORD2", ...],
    "6": ["WORD1", "WORD2", ...]
  },
  "validGuesses": {
    "4": ["WORD1", "WORD2", ...],
    "5": ["WORD1", "WORD2", ...],
    "6": ["WORD1", "WORD2", ...]
  }
}
```

### Explications

- **targetWords** : Mots qui peuvent être sélectionnés comme mot secret à deviner (liste restreinte, mots communs)
- **validGuesses** : Mots qui peuvent être utilisés comme tentatives (liste plus large, peut inclure plus de mots)
  - Si vide, utilise automatiquement `targetWords`
  - Permet d'avoir plus de mots acceptables pour les tentatives (comme Wordle avec ~13,000 mots valides vs ~2,300 mots cibles)

## Ajouter des mots

### ⚠️ Ne pas éditer manuellement le JSON

Le fichier `enigma-scroll-words.json` est généré automatiquement. Pour ajouter des mots :

### Option 1 : Ajouter une nouvelle source (recommandé)

Éditez `scripts/update-word-lists.js` et ajoutez une source dans `WORD_LIST_SOURCES` :

```javascript
{
  name: 'ma-source',
  url: 'https://example.com/words.txt',
  description: 'Description'
}
```

Puis exécutez `npm run update-word-lists`.

### Option 2 : Ajouter manuellement (non recommandé)

Si vous devez absolument ajouter des mots manuellement, éditez le JSON, mais sachez qu'ils seront écrasés à la prochaine mise à jour automatique.

## Filtrer les mots inappropriés

### Option 1 : Modifier directement le code

Éditez `lib/games/enigma-scroll-words.ts` et ajoutez des mots dans le `Set` :

```typescript
const INAPPROPRIATE_WORDS = new Set<string>([
  "WORD1",
  "WORD2",
  // ...
]);
```

### Option 2 : Charger depuis un fichier (à implémenter)

Vous pouvez modifier `filterInappropriateWords` pour charger depuis un fichier texte :

```typescript
// Exemple (à adapter)
import fs from 'fs';
const inappropriateWords = fs.readFileSync('lib/games/words/inappropriate-words.txt', 'utf-8')
  .split('\n')
  .map(w => w.trim().toUpperCase())
  .filter(w => w.length > 0);
```

## Charger de grandes listes

Pour charger de très grandes listes de mots :

1. **Depuis un fichier texte** : Créez un script pour convertir un fichier `.txt` en JSON
2. **Depuis une API** : Modifiez `app/play/enigma-scroll/page.tsx` pour charger depuis une API
3. **Depuis plusieurs fichiers** : Divisez les listes en plusieurs fichiers JSON et chargez-les séparément

### Exemple : Charger depuis un fichier texte

```typescript
// Dans un script de build ou dans le composant
const words = fs.readFileSync('path/to/words.txt', 'utf-8')
  .split('\n')
  .map(w => w.trim().toUpperCase())
  .filter(w => w.length >= 4 && w.length <= 6 && /^[A-Z]+$/.test(w));

// Organiser par longueur
const wordsByLength = {
  4: words.filter(w => w.length === 4),
  5: words.filter(w => w.length === 5),
  6: words.filter(w => w.length === 6),
};
```

## Validation

Le système valide automatiquement les listes au chargement :
- Vérifie que chaque longueur a des mots
- Vérifie que tous les `targetWords` sont dans `validGuesses`
- Filtre les mots inappropriés

Les erreurs sont loggées dans la console mais n'empêchent pas le jeu de fonctionner (utilise les listes par défaut en fallback).

## Notes

- Tous les mots sont normalisés en MAJUSCULES
- Seuls les mots de 4, 5 ou 6 lettres sont acceptés
- Seuls les mots contenant uniquement des lettres (A-Z) sont acceptés
- Les mots sont filtrés automatiquement pour retirer les doublons et les mots inappropriés

