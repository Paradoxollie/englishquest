/**
 * Enigma Scroll - Clean Game Engine
 * 
 * Pure TypeScript implementation of the word-guessing game logic.
 * NO DOM, NO CSS, NO database, NO API calls - just gameplay.
 * 
 * This engine implements:
 * - Wordle-style feedback (correct/present/absent)
 * - Scoring with combos and bonuses
 * - Multiple difficulty levels (4/5/6 letter words)
 * - Session scoring with streaks
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LetterStatus = "correct" | "present" | "absent" | "empty";

export type Cell = {
  letter: string;        // single uppercase letter or ""
  status: LetterStatus; // feedback for this cell
};

export type Row = {
  cells: Cell[];
  isSubmitted: boolean;
};

export type GameConfig = {
  maxAttempts: number;
  wordLength: number;
  basePointsPerWin: number;
  streakBonusMultiplier: number; // e.g. 1.0, 1.5, 2.0... (capped at 2.5)
};

export type GameState = {
  targetWord: string;    // the secret word, uppercase
  rows: Row[];           // grid of attempts
  currentAttemptIndex: number;
  isFinished: boolean;
  isWin: boolean;
  totalScore: number;    // session score
  currentStreak: number; // consecutive wins
  bestStreak: number;    // best streak in session
  wordsFound: number;    // total words found in session
  config: GameConfig;
};

export type GuessResult = {
  isValid: boolean;
  isWin: boolean;
  isGameOver: boolean;
  pointsEarned: number;
  newStreak: number;
  errorMessage?: string;
};

/**
 * Word Lists Configuration
 * Contains target words (for secret words) and valid guesses (for player guesses)
 */
export type WordLists = {
  targetWords: Record<number, string[]>;  // Words that can be selected as secret words
  validGuesses: Record<number, string[]>; // Words that can be used as guesses
};

// ============================================================================
// WORD LISTS (injected from outside)
// ============================================================================

/*
 * The target words (with translations and levels) live in
 * lib/games/enigma-scroll-targets.ts; the valid guesses are loaded on demand
 * from public/data/enigma-guesses-<length>.json. Nothing is bundled here.
 */
let globalWordLists: WordLists = { targetWords: {}, validGuesses: {} };
let guessSets: Record<number, Set<string>> = {};
let targetSets: Record<number, Set<string>> = {};

/**
 * Initialize word lists (call this before using the engine)
 */
export function initializeWordLists(wordLists: WordLists): void {
  globalWordLists = wordLists;
  guessSets = {};
  targetSets = {};
  for (const [length, words] of Object.entries(wordLists.validGuesses)) {
    guessSets[Number(length)] = new Set(words);
  }
  for (const [length, words] of Object.entries(wordLists.targetWords)) {
    targetSets[Number(length)] = new Set(words);
  }
}

/**
 * Get current word lists
 */
function getWordLists(): WordLists {
  return globalWordLists;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeWord(word: string): string {
  return word.trim().toUpperCase();
}

function isValidWord(word: string, wordLength: number): boolean {
  const normalized = normalizeWord(word);
  
  if (normalized.length !== wordLength) {
    return false;
  }
  
  if (!/^[A-Z]+$/.test(normalized)) {
    return false;
  }
  
  return guessSets[wordLength]?.has(normalized) ?? false;
}

function isTargetWord(word: string, wordLength: number): boolean {
  const normalized = normalizeWord(word);
  
  if (normalized.length !== wordLength) {
    return false;
  }
  
  if (!/^[A-Z]+$/.test(normalized)) {
    return false;
  }
  
  return targetSets[wordLength]?.has(normalized) ?? false;
}

function getRandomWord(wordLength: number, excludeWords: Set<string> = new Set()): string {
  const wordLists = getWordLists();
  const targetWords = wordLists.targetWords[wordLength];
  
  if (!targetWords || targetWords.length === 0) {
    throw new Error(`No words available for length ${wordLength}`);
  }
  
  const availableWords = targetWords.filter(word => !excludeWords.has(word));
  
  if (availableWords.length === 0) {
    const randomIndex = Math.floor(Math.random() * targetWords.length);
    return targetWords[randomIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
}

function calculateFeedback(guess: string, targetWord: string): LetterStatus[] {
  const normalizedGuess = normalizeWord(guess);
  const normalizedTarget = normalizeWord(targetWord);
  
  if (normalizedGuess.length !== normalizedTarget.length) {
    throw new Error('Guess and target must have same length');
  }
  
  const targetLetters = normalizedTarget.split('');
  const guessLetters = normalizedGuess.split('');
  const feedback: LetterStatus[] = new Array(normalizedGuess.length).fill('absent');
  
  const letterCounts: Record<string, number> = {};
  targetLetters.forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  });
  
  // First pass: mark exact matches
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      feedback[i] = 'correct';
      letterCounts[guessLetters[i]]--;
    }
  }
  
  // Second pass: mark letters that exist but in wrong position
  for (let i = 0; i < guessLetters.length; i++) {
    if (feedback[i] === 'absent') {
      const letter = guessLetters[i];
      if (letterCounts[letter] > 0) {
        feedback[i] = 'present';
        letterCounts[letter]--;
      }
    }
  }
  
  return feedback;
}

function createEmptyRow(wordLength: number): Row {
  return {
    cells: Array(wordLength).fill(null).map(() => ({
      letter: "",
      status: "empty"
    })),
    isSubmitted: false
  };
}

function createInitialGrid(maxAttempts: number, wordLength: number): Row[] {
  return Array(maxAttempts).fill(null).map(() => createEmptyRow(wordLength));
}

function calculateScore(
  config: GameConfig,
  attemptsUsed: number,
  timeRemaining: number,
  currentStreak: number
): number {
  const basePoints = config.basePointsPerWin;
  const attemptBonus = Math.max(0, (config.maxAttempts - attemptsUsed) * 2);
  const timeBonus = Math.max(0, Math.min(Math.floor(timeRemaining / 6), 15));
  const rawScore = basePoints + attemptBonus + timeBonus;
  const streakMultiplier = 1 + Math.min(currentStreak, 1.5) * 0.1;
  return Math.floor(rawScore * streakMultiplier);
}

// ============================================================================
// DEFAULT CONFIGS
// ============================================================================

export const DEFAULT_CONFIGS: Record<number, GameConfig> = {
  4: {
    maxAttempts: 5,
    wordLength: 4,
    basePointsPerWin: 10,
    streakBonusMultiplier: 2.5
  },
  5: {
    maxAttempts: 6,
    wordLength: 5,
    basePointsPerWin: 15,
    streakBonusMultiplier: 2.5
  },
  6: {
    maxAttempts: 7,
    wordLength: 6,
    basePointsPerWin: 20,
    streakBonusMultiplier: 2.5
  }
};

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

export function createInitialGameState(
  targetWord: string,
  config?: Partial<GameConfig>
): GameState {
  const normalizedTarget = normalizeWord(targetWord);
  const wordLength = normalizedTarget.length;
  
  // Vérifier que le mot est dans targetWords (liste de base), pas dans validGuesses
  if (!isTargetWord(normalizedTarget, wordLength)) {
    throw new Error(`Word "${normalizedTarget}" is not in the target words list for length ${wordLength}`);
  }
  
  const defaultConfig = DEFAULT_CONFIGS[wordLength];
  if (!defaultConfig) {
    throw new Error(`No default config for word length ${wordLength}`);
  }
  
  const finalConfig: GameConfig = {
    ...defaultConfig,
    ...config,
    wordLength
  };
  
  return {
    targetWord: normalizedTarget,
    rows: createInitialGrid(finalConfig.maxAttempts, finalConfig.wordLength),
    currentAttemptIndex: 0,
    isFinished: false,
    isWin: false,
    totalScore: 0,
    currentStreak: 0,
    bestStreak: 0,
    wordsFound: 0,
    config: finalConfig
  };
}

export function createRandomGameState(
  wordLength: 4 | 5 | 6,
  config?: Partial<GameConfig>,
  excludeWords: Set<string> = new Set()
): GameState {
  const targetWord = getRandomWord(wordLength, excludeWords);
  return createInitialGameState(targetWord, config);
}

export function submitGuess(
  state: GameState,
  guess: string,
  timeRemaining: number = 0
): { state: GameState; result: GuessResult } {
  if (state.isFinished) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: true,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: "Game is already finished"
      }
    };
  }
  
  const normalizedGuess = normalizeWord(guess);
  
  if (normalizedGuess.length !== state.config.wordLength) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: false,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: `Guess must be ${state.config.wordLength} letters long`
      }
    };
  }
  
  if (!isValidWord(normalizedGuess, state.config.wordLength)) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: false,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: "Word not found in dictionary"
      }
    };
  }
  
  if (state.currentAttemptIndex >= state.config.maxAttempts) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: true,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: "No attempts remaining"
      }
    };
  }
  
  const feedback = calculateFeedback(normalizedGuess, state.targetWord);
  const isWin = normalizedGuess === state.targetWord;
  const attemptsUsed = state.currentAttemptIndex + 1;
  
  const cells: Cell[] = normalizedGuess.split('').map((letter, index) => ({
    letter,
    status: feedback[index]
  }));
  
  const updatedRows = [...state.rows];
  updatedRows[state.currentAttemptIndex] = {
    cells,
    isSubmitted: true
  };
  
  let pointsEarned = 0;
  let newStreak = state.currentStreak;
  let newBestStreak = state.bestStreak;
  
  if (isWin) {
    pointsEarned = calculateScore(
      state.config,
      attemptsUsed,
      timeRemaining,
      state.currentStreak
    );
    newStreak = state.currentStreak + 1;
    newBestStreak = Math.max(state.bestStreak, newStreak);
  } else if (attemptsUsed >= state.config.maxAttempts) {
    newStreak = 0;
  }
  
  const isGameOver = isWin || (attemptsUsed >= state.config.maxAttempts);
  
  const newState: GameState = {
    ...state,
    rows: updatedRows,
    currentAttemptIndex: state.currentAttemptIndex + 1,
    isFinished: isGameOver,
    isWin: isWin,
    totalScore: state.totalScore + pointsEarned,
    currentStreak: newStreak,
    bestStreak: newBestStreak,
    wordsFound: isWin ? state.wordsFound + 1 : state.wordsFound
  };
  
  return {
    state: newState,
    result: {
      isValid: true,
      isWin: isWin,
      isGameOver: isGameOver,
      pointsEarned: pointsEarned,
      newStreak: newStreak
    }
  };
}

export function resetForNewWord(
  state: GameState,
  newTargetWord: string
): GameState {
  const normalizedTarget = normalizeWord(newTargetWord);
  const wordLength = normalizedTarget.length;
  
  if (!isValidWord(normalizedTarget, wordLength)) {
    throw new Error(`Word "${normalizedTarget}" is not in the word list for length ${wordLength}`);
  }
  
  const config: GameConfig = {
    ...state.config,
    wordLength
  };
  
  return {
    ...state,
    targetWord: normalizedTarget,
    rows: createInitialGrid(config.maxAttempts, config.wordLength),
    currentAttemptIndex: 0,
    isFinished: false,
    isWin: false,
    config
  };
}

export function resetForNewRandomWord(
  state: GameState,
  excludeWords: Set<string> = new Set()
): GameState {
  const newTargetWord = getRandomWord(state.config.wordLength, excludeWords);
  return resetForNewWord(state, newTargetWord);
}

export function addLetterToCurrentGuess(
  state: GameState,
  letter: string
): GameState {
  if (state.isFinished) {
    return state;
  }
  
  const normalizedLetter = normalizeWord(letter);
  
  if (normalizedLetter.length !== 1 || !/^[A-Z]$/.test(normalizedLetter)) {
    return state;
  }
  
  const currentRow = state.rows[state.currentAttemptIndex];
  if (currentRow.isSubmitted) {
    return state;
  }
  
  const emptyIndex = currentRow.cells.findIndex(cell => cell.letter === "");
  if (emptyIndex === -1) {
    return state;
  }
  
  const updatedRows = [...state.rows];
  const updatedCells = [...currentRow.cells];
  updatedCells[emptyIndex] = {
    letter: normalizedLetter,
    status: "empty"
  };
  
  updatedRows[state.currentAttemptIndex] = {
    ...currentRow,
    cells: updatedCells
  };
  
  return {
    ...state,
    rows: updatedRows
  };
}

export function removeLetterFromCurrentGuess(state: GameState): GameState {
  if (state.isFinished) {
    return state;
  }
  
  const currentRow = state.rows[state.currentAttemptIndex];
  if (currentRow.isSubmitted) {
    return state;
  }
  
  let lastIndex = -1;
  for (let i = currentRow.cells.length - 1; i >= 0; i--) {
    if (currentRow.cells[i].letter !== "") {
      lastIndex = i;
      break;
    }
  }
  
  if (lastIndex === -1) {
    return state;
  }
  
  const updatedRows = [...state.rows];
  const updatedCells = [...currentRow.cells];
  updatedCells[lastIndex] = {
    letter: "",
    status: "empty"
  };
  
  updatedRows[state.currentAttemptIndex] = {
    ...currentRow,
    cells: updatedCells
  };
  
  return {
    ...state,
    rows: updatedRows
  };
}

export function getCurrentGuess(state: GameState): string {
  if (state.isFinished || state.currentAttemptIndex >= state.rows.length) {
    return "";
  }
  
  const currentRow = state.rows[state.currentAttemptIndex];
  return currentRow.cells.map(cell => cell.letter).join("");
}

export function validateWord(word: string, wordLength: number): boolean {
  return isValidWord(word, wordLength);
}

