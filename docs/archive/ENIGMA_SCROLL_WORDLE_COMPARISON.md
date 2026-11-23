# Enigma Scroll vs Wordle - Comparaison des systèmes de validation

**Archive, repère au 23 novembre 2026.** La banque actuelle distingue les [cibles traduites et graduées](../../lib/games/enigma-scroll-targets.ts) et les [dictionnaires de propositions](../../public/data). La comparaison ci-dessous explique l’ancienne organisation.

## 🔍 Différence principale

### Wordle (NYTimes)
Wordle utilise **deux listes distinctes** :

1. **Liste des mots secrets (Target Words)** : ~2,300 mots
   - Mots courants et bien connus
   - Utilisés uniquement comme mots secrets à deviner
   - Exemples : "APPLE", "HOUSE", "MUSIC"

2. **Liste des mots acceptables (Valid Guesses)** : ~13,000 mots
   - Liste beaucoup plus large
   - **Inclut** tous les mots secrets
   - Permet de deviner des mots qui ne sont pas dans la liste des secrets
   - Exemples : "XYLOPHONE", "QUARTZ", "JAZZY" (peuvent être devinés mais ne seront jamais le mot secret)

### Enigma Scroll (actuel)
Notre implémentation utilise **une seule liste** :
- `TARGET_WORDS_4`, `TARGET_WORDS_5`, `TARGET_WORDS_6`
- Cette liste sert à la fois pour :
  - Sélectionner le mot secret
  - Valider les tentatives

**Conséquence** : Un joueur ne peut deviner que des mots présents dans la liste des secrets, ce qui est plus restrictif que Wordle.

## ✅ Solution recommandée

Séparer les listes comme Wordle :

```typescript
// Liste des mots secrets (restreinte, mots courants)
const TARGET_WORDS_4: string[] = [
  "ABLE", "ACHE", "ACID", "AGED", "AIDE", ...
];

// Liste des mots acceptables (plus large, inclut TARGET_WORDS)
const VALID_GUESSES_4: string[] = [
  // D'abord tous les mots secrets
  ...TARGET_WORDS_4,
  // Puis des mots supplémentaires acceptables
  "ABED", "ABET", "ABLY", "ACES", "ACHE", "ACTS", ...
];
```

### Fonctions à modifier

1. **`isValidWord()`** : Vérifier dans `VALID_GUESSES` (liste large)
2. **`getRandomWord()`** : Sélectionner dans `TARGET_WORDS` (liste restreinte)

## 📊 Avantages de cette approche

✅ **Plus flexible** : Les joueurs peuvent deviner plus de mots  
✅ **Comme Wordle** : Expérience de jeu identique  
✅ **Meilleure UX** : Moins de "mot invalide" frustrants  
✅ **Stratégie** : Permet d'utiliser des mots rares pour tester des lettres

## 🔧 Implémentation

Modifier `lib/games/enigma-scroll.ts` pour :

1. Créer `VALID_GUESSES_4`, `VALID_GUESSES_5`, `VALID_GUESSES_6` (listes larges)
2. Garder `TARGET_WORDS_4`, `TARGET_WORDS_5`, `TARGET_WORDS_6` (listes restreintes)
3. Modifier `isValidWord()` pour utiliser `VALID_GUESSES`
4. Modifier `getRandomWord()` pour utiliser `TARGET_WORDS`

## 📝 Exemple de code

```typescript
// Liste des mots secrets (restreinte)
const TARGET_WORDS_4: string[] = ["ABLE", "ACHE", "ACID", ...];

// Liste des mots acceptables (large, inclut TARGET_WORDS)
const VALID_GUESSES_4: string[] = [
  ...TARGET_WORDS_4,  // Tous les mots secrets
  "ABED", "ABET", "ABLY", "ACES", "ACTS", ...  // Mots supplémentaires
];

function isValidWord(word: string, wordLength: number): boolean {
  const normalized = normalizeWord(word);
  const validGuesses = VALID_GUESSES[wordLength];  // Utilise la liste large
  return validGuesses ? validGuesses.includes(normalized) : false;
}

function getRandomWord(wordLength: number, excludeWords: Set<string> = new Set()): string {
  const targetWords = TARGET_WORDS[wordLength];  // Utilise la liste restreinte
  // ... reste du code
}
```

## 🎯 Conclusion

Pour avoir le même comportement que Wordle, il faut séparer les listes de mots secrets et de mots acceptables. Cela rend le jeu plus flexible et plus proche de l'expérience Wordle originale.

