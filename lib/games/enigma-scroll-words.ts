/**
 * Enigma Scroll - Word Lists Loader & Filter
 * 
 * Handles loading word lists from JSON files and filtering inappropriate content.
 */

import type { WordLists } from "./enigma-scroll";

/**
 * List of inappropriate words to filter out
 * This is a basic list - can be expanded or loaded from a file
 */
const INAPPROPRIATE_WORDS = new Set<string>([
  // Mots exclus des cibles et des propositions (public scolaire)
  "ANAL",
  "ARSE",
  "ASSES",
  "BASTARD",
  "BITCH",
  "BOMB",
  "BOMBS",
  "BOOBS",
  "COCAINE",
  "COCK",
  "CORPSE",
  "CRACK",
  "CRAP",
  "CUNT",
  "DAMN",
  "DICK",
  "DRUG",
  "DRUGS",
  "DYKE",
  "FAG",
  "FAGGOT",
  "FUCK",
  "FUCKED",
  "FUCKS",
  "GUN",
  "GUNS",
  "HELL",
  "HEROIN",
  "HORNY",
  "KILL",
  "KILLED",
  "KILLS",
  "MURDER",
  "NAKED",
  "NAZI",
  "NAZIS",
  "NEGRO",
  "NIGGER",
  "NUDE",
  "ORAL",
  "ORGY",
  "PENIS",
  "PISS",
  "PISSED",
  "PORN",
  "PUSSY",
  "RAPE",
  "RAPED",
  "RAPIST",
  "RETARD",
  "RIFLE",
  "SEXY",
  "SHIT",
  "SHITS",
  "SLUT",
  "SMACK",
  "SUICIDE",
  "TITS",
  "TWAT",
  "VAGINA",
  "WANK",
  "WANKER",
  "WEED",
  "WHORE"
]);

/**
 * Filters out inappropriate words from a word list
 */
export function filterInappropriateWords(words: string[]): string[] {
  return words.filter(word => {
    const normalized = word.trim().toUpperCase();
    return !INAPPROPRIATE_WORDS.has(normalized);
  });
}

/**
 * Loads word lists from JSON files and filters them
 * 
 * @param targetWordsData - Raw word lists for target words (from JSON)
 * @param validGuessesData - Raw word lists for valid guesses (from JSON, optional - defaults to targetWords)
 * @returns Filtered and validated WordLists
 */
export function loadAndFilterWordLists(
  targetWordsData: Record<string, string[]>,
  validGuessesData?: Record<string, string[]>
): WordLists {
  const targetWords: Record<number, string[]> = {};
  const validGuesses: Record<number, string[]> = {};
  const wordsOfLength = (words: string[], length: number) => Array.from(new Set(
    filterInappropriateWords(words)
      .map(word => word.trim().toUpperCase())
      .filter(word => word.length === length && /^[A-Z]+$/.test(word))
  ));

  // Process target words
  for (const [lengthStr, words] of Object.entries(targetWordsData)) {
    const length = parseInt(lengthStr, 10);
    if (length >= 4 && length <= 6 && Array.isArray(words)) {
      targetWords[length] = wordsOfLength(words, length);
    }
  }

  // Process valid guesses (use targetWords if not provided)
  const guessesData = validGuessesData || targetWordsData;
  for (const [lengthStr, words] of Object.entries(guessesData)) {
    const length = parseInt(lengthStr, 10);
    if (length >= 4 && length <= 6 && Array.isArray(words)) {
      validGuesses[length] = wordsOfLength(words, length);
    }
  }

  for (const [length, targets] of Object.entries(targetWords)) {
    const wordLength = Number(length);
    validGuesses[wordLength] = Array.from(
      new Set([...(validGuesses[wordLength] ?? []), ...targets])
    );
  }

  return {
    targetWords,
    validGuesses
  };
}

/**
 * Validates word lists structure
 */
export function validateWordLists(wordLists: WordLists): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const length of [4, 5, 6]) {
    const targets = wordLists.targetWords[length];
    const guesses = wordLists.validGuesses[length];

    if (!targets || targets.length === 0) {
      errors.push(`No target words for length ${length}`);
    }

    if (!guesses || guesses.length === 0) {
      errors.push(`No valid guesses for length ${length}`);
    }

    if (targets && guesses) {
      if ([...targets, ...guesses].some(word => word.length !== length || !/^[A-Z]+$/.test(word))) {
        errors.push(`Invalid words for length ${length}`);
      }
      // Valid guesses should include all target words
      const missingTargets = targets.filter(t => !guesses.includes(t));
      if (missingTargets.length > 0) {
        errors.push(`Some target words are missing from valid guesses for length ${length}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
