/**
 * Wordfall - Core Game Logic
 * 
 * Pure, deterministic game logic for the Wordfall game.
 * A Tetris-style word typing game with two modes:
 * - Exact Word Mode: Type the exact falling word
 * - Free Word Mode: Type any valid word starting with the displayed letter
 */

export type WordfallMode = "exact" | "free";

export interface FallingWord {
  id: string;
  text: string;        // full word (for exact mode) or underlying word for free mode
  displayText: string; // what is shown on the block: translation (FR) OR first letter
  translation?: string; // French translation (optional, for vocabulary learning mode)
  y: number;           // vertical position, 0 = top, 100 = bottom
  speed: number;       // current falling speed (units per second)
}

export interface WordfallState {
  mode: WordfallMode;
  isRunning: boolean;
  lives: number;
  score: number;
  level: number;
  activeWord: FallingWord | null;
  usedWords: string[]; // for free mode
  wordsCompleted: number;
  gameOver: boolean;
  // New gameplay mechanics
  streak: number; // Consecutive successful words
  combo: number; // Combo multiplier (increases with streak)
  highestStreak: number; // Best streak achieved
  perfectCatches: number; // Words caught high up (y < 20)
  wordStartTime?: number; // When current word appeared (for speed bonus)
}

export interface WordfallConfig {
  mode: WordfallMode;
  initialLives?: number;
  initialSpeed?: number;
  speedIncreasePerLevel?: number;
  wordsPerLevel?: number;
  rng?: () => number; // optional PRNG for deterministic tests
}

// Word lists (will be injected from outside)
// For Wordfall, we only use words that have translations
let globalWordLists: {
  allWords: string[]; // All valid words for free mode validation (only words with translations)
  wordsByLength: Record<number, string[]>; // Words grouped by length (only words with translations)
  allManualWords?: string[]; // All manual words including expressions (with spaces)
} | null = null;

// Dictionary for translations (will be injected from outside)
let globalDictionary: Record<string, string> | null = null;

// Complete English words dictionary for free mode validation (all valid English words)
let englishWordsSet: Set<string> | null = null;

/**
 * Initialize dictionary for translations (call this before using the engine)
 */
export function initializeDictionary(dictionary: Record<string, string>): void {
  globalDictionary = dictionary;
  console.log("Wordfall: Initialized dictionary with", Object.keys(dictionary).length, "translations");
}

/**
 * Clean translation: remove parentheses, slashes, and take first part
 */
function cleanTranslationForDisplay(translation: string): string {
  if (!translation || typeof translation !== 'string') return '';
  
  let cleaned = translation.trim();
  
  // Remove everything in parentheses (including nested parentheses)
  cleaned = cleaned.replace(/\([^()]*\)/g, '');
  cleaned = cleaned.replace(/\([^()]*\)/g, ''); // Second pass for nested
  
  // Take first part before "/"
  if (cleaned.includes('/')) {
    cleaned = cleaned.split('/')[0].trim();
  }
  
  // Take first part before ","
  if (cleaned.includes(',')) {
    cleaned = cleaned.split(',')[0].trim();
  }
  
  // Clean up spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Get translation for a word (already cleaned in JSON, but clean again for safety)
 */
function getTranslation(word: string): string | undefined {
  if (!globalDictionary) return undefined;
  const translation = globalDictionary[word.toUpperCase()];
  if (!translation) return undefined;
  // Clean translation to ensure no parentheses, slashes, or commas
  return cleanTranslationForDisplay(translation);
}

/**
 * Initialize word lists for Wordfall (only words with translations)
 * This function expects wordfall-words.json format with translations
 */
export function initializeWordLists(wordLists: {
  translations: Record<string, string>; // word -> translation mapping
  wordsByLength: Record<number, string[]>; // words grouped by length (only words with translations)
  expressions?: string[]; // Optional: expressions with spaces
}): void {
  // Only use words that have translations
  const allWords = new Set<string>();
  const wordsByLength: Record<number, string[]> = {};
  const allManualWords: string[] = [];
  
  // Initialize dictionary first
  if (wordLists.translations) {
    globalDictionary = wordLists.translations;
  }
  
  // Build word lists from wordsByLength (which only contains words with translations)
  for (const [lengthStr, words] of Object.entries(wordLists.wordsByLength || {})) {
    const length = parseInt(lengthStr, 10);
    if (!isNaN(length) && Array.isArray(words) && words.length > 0) {
      // Filter: only keep words that have translations
      const wordsWithTranslations = words
        .filter(w => w && typeof w === 'string' && w.trim().length > 0)
        .map(w => w.toUpperCase().trim())
        .filter(w => globalDictionary && globalDictionary[w]); // Only words with translations
      
      if (wordsWithTranslations.length > 0) {
        wordsByLength[length] = wordsWithTranslations;
        // Add to allWords for free mode validation
        for (const word of wordsWithTranslations) {
          allWords.add(word);
          allManualWords.push(word);
        }
      }
    }
  }
  
  // Add expressions (words with spaces) if available
  if (wordLists.expressions && Array.isArray(wordLists.expressions)) {
    for (const expression of wordLists.expressions) {
      const upperExpr = expression.toUpperCase().trim();
      if (upperExpr && globalDictionary && globalDictionary[upperExpr]) {
        allManualWords.push(upperExpr);
      }
    }
  }
  
  // Also add all words from translations that aren't in wordsByLength
  // This ensures ALL words from the dictionary are available for free mode
  if (wordLists.translations) {
    for (const word of Object.keys(wordLists.translations)) {
      const upperWord = word.toUpperCase().trim();
      if (upperWord) {
        // Add to allWords for free mode validation (all words, not just 4-6 letters)
        allWords.add(upperWord);
        if (!allManualWords.includes(upperWord)) {
          allManualWords.push(upperWord);
        }
      }
    }
  }

  globalWordLists = {
    allWords: Array.from(allWords), // Now contains ALL words from dictionary (2-20+ letters)
    wordsByLength, // Only words with translations
    allManualWords: allManualWords, // All manual words including expressions
  };
  
  // Debug: log word counts
  console.log("Wordfall: Initialized word lists", {
    totalWords: allWords.size,
    wordsWithTranslations: globalDictionary ? Object.keys(globalDictionary).length : 0,
    allManualWords: allManualWords.length,
    wordsByLength: Object.keys(wordsByLength).map(len => ({
      length: len,
      count: wordsByLength[parseInt(len, 10)]?.length || 0,
      sampleFirstLetters: Array.from(new Set(
        wordsByLength[parseInt(len, 10)]?.slice(0, 100).map((w: string) => w[0]) || []
      )).sort()
    })),
    freeModeWords: allWords.size, // Total words available for free mode (all lengths)
  });
}

/**
 * Get current word lists (fallback to empty if not initialized)
 */
function getWordLists() {
  if (globalWordLists) {
    return globalWordLists;
  }
  return {
    allWords: [],
    wordsByLength: {},
  };
}

const DEFAULT_CONFIG: Required<Omit<WordfallConfig, "mode" | "rng">> = {
  initialLives: 3,
  initialSpeed: 5, // units per second (0-100 range) - very slow at start for learning
  speedIncreasePerLevel: 1, // very small speed increase per level (reduced from 2)
  wordsPerLevel: 5, // Words needed to level up
};

function defaultRng(): number {
  return Math.random();
}

/**
 * Create initial game state
 */
export function createGameState(config: WordfallConfig): WordfallState {
  const fullConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return {
    mode: config.mode,
    isRunning: false,
    lives: fullConfig.initialLives,
    score: 0,
    level: 1,
    activeWord: null,
    usedWords: [],
    wordsCompleted: 0,
    gameOver: false,
    streak: 0,
    combo: 1,
    highestStreak: 0,
    perfectCatches: 0,
    wordStartTime: undefined,
  };
}

/**
 * Get a random word for exact mode
 * Now uses all manual words (including expressions with spaces)
 * Uses proper randomization to avoid patterns
 */
function getRandomWordForExactMode(
  minLength: number = 4,
  maxLength: number = 6,
  rng: () => number = defaultRng
): string | null {
  const wordLists = getWordLists();
  
  // If we have allManualWords (from manual list), use those
  if (wordLists.allManualWords && wordLists.allManualWords.length > 0) {
    const allWords = wordLists.allManualWords;
    const randomIndex = Math.floor(rng() * allWords.length);
    const selectedWord = allWords[randomIndex];
    
    if (selectedWord && typeof selectedWord === 'string') {
      return selectedWord;
    }
  }
  
  // Fallback to wordsByLength (for compatibility)
  const availableLengths: number[] = [];
  
  // Collect all available lengths
  for (let len = minLength; len <= maxLength; len++) {
    const words = wordLists.wordsByLength[len];
    if (words && Array.isArray(words) && words.length > 0) {
      availableLengths.push(len);
    }
  }

  if (availableLengths.length === 0) {
    console.warn("No words available for lengths", minLength, "to", maxLength);
    return null;
  }

  // Randomly select a length
  const randomLength = availableLengths[Math.floor(rng() * availableLengths.length)];
  const words = wordLists.wordsByLength[randomLength];
  
  if (!words || !Array.isArray(words) || words.length === 0) {
    console.warn("No words available for length", randomLength);
    return null;
  }

  // Use proper random selection with better distribution
  const randomValue = rng();
  const randomIndex = Math.floor(randomValue * words.length);
  
  // Ensure index is valid (should always be, but safety check)
  const finalIndex = Math.max(0, Math.min(randomIndex, words.length - 1));
  const selectedWord = words[finalIndex];
  
  if (!selectedWord || typeof selectedWord !== 'string') {
    console.error("Wordfall: Invalid word selected", {
      index: finalIndex,
      length: randomLength,
      totalWords: words.length,
      word: selectedWord
    });
    // Fallback: try a different random index
    const fallbackIndex = Math.floor(rng() * words.length);
    const fallbackWord = words[fallbackIndex];
    if (fallbackWord && typeof fallbackWord === 'string') {
      return fallbackWord;
    }
    // Last resort: return first valid word
    for (const word of words) {
      if (word && typeof word === 'string') {
        return word;
      }
    }
    return null;
  }
  
  return selectedWord;
}

/**
 * Get a random letter for free mode
 */
function getRandomLetter(rng: () => number = defaultRng): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(rng() * letters.length)];
}

/**
 * Spawn a new falling word
 */
export function spawnFallingWord(
  state: WordfallState,
  config: WordfallConfig,
  rng: () => number = defaultRng
): FallingWord | null {
  const fullConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const currentSpeed = fullConfig.initialSpeed + (state.level - 1) * fullConfig.speedIncreasePerLevel;

  if (state.mode === "exact") {
    // Try up to 10 times to find a word with translation
    let word: string | null = null;
    let translation: string | undefined = undefined;
    
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = getRandomWordForExactMode(4, 6, rng);
      if (!candidate) break;
      
      const candidateTranslation = getTranslation(candidate);
      if (candidateTranslation) {
        word = candidate;
        translation = candidateTranslation;
        break;
      }
    }
    
    // Only spawn words that have translations
    if (!word || !translation) {
      console.warn(`Could not find a word with translation after multiple attempts`);
      return null;
    }
    
    return {
      id: `word-${Date.now()}-${Math.random()}`,
      text: word, // English word (what player must type)
      displayText: word, // English word (what is displayed and falls)
      translation: translation, // French translation (for information only)
      y: 0,
      speed: currentSpeed,
    };
  } else {
    // Free mode: show only the first letter
    const letter = getRandomLetter(rng);
    // We still need a "text" for internal tracking, but it's not shown
    // The actual word will be determined by what the player types
    return {
      id: `word-${Date.now()}-${Math.random()}`,
      text: letter, // Store the letter as text
      displayText: letter,
      y: 0,
      speed: currentSpeed,
    };
  }
}

/**
 * Update falling word position
 */
export function updateFallingWord(
  word: FallingWord,
  deltaTimeMs: number
): FallingWord {
  const deltaSeconds = deltaTimeMs / 1000;
  const newY = word.y + word.speed * deltaSeconds;
  
  return {
    ...word,
    y: Math.min(100, newY), // Cap at 100 (bottom)
  };
}

/**
 * Check if word has reached bottom
 */
export function hasReachedBottom(word: FallingWord): boolean {
  return word.y >= 100;
}

/**
 * Validate word input for exact mode
 * Now requires both English word and French translation
 * Format: "ENGLISH FRENCH" (space-separated, no slash needed)
 */
export function validateExactWord(
  input: string,
  targetWord: string,
  targetTranslation: string
): { valid: boolean; reason?: string } {
  const trimmed = input.trim();
  
  // Split by spaces - take first word as English, rest as French
  const parts = trimmed.split(/\s+/).filter(p => p.trim().length > 0);
  
  if (parts.length < 2) {
    return { valid: false, reason: "Tapez le mot anglais puis sa traduction française (séparés par un espace)" };
  }
  
  // First part is English word
  const englishInput = parts[0];
  // Rest is French translation (join in case it has spaces)
  const frenchInput = parts.slice(1).join(' ');
  
  const normalizedEnglish = englishInput.toUpperCase();
  const normalizedFrench = frenchInput.toLowerCase().trim();
  const normalizedTargetTranslation = targetTranslation.toLowerCase().trim();
  
  // Check English word
  if (normalizedEnglish !== targetWord.toUpperCase()) {
    return { valid: false, reason: "Le mot anglais ne correspond pas" };
  }
  
  // Check French translation (allow for slight variations like accents, case)
  // Normalize both for comparison (remove extra spaces, normalize accents)
  const normalizeForComparison = (str: string) => 
    str.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Clean the target translation (remove parentheses, slashes, take first part)
  const cleanedTargetFr = cleanTranslationForDisplay(targetTranslation);
  const normalizedInputFr = normalizeForComparison(normalizedFrench);
  const normalizedTargetFr = normalizeForComparison(cleanedTargetFr);
  
  if (normalizedInputFr !== normalizedTargetFr) {
    return { valid: false, reason: `La traduction ne correspond pas. Attendu: "${cleanedTargetFr}"` };
  }
  
  return { valid: true };
}

/**
 * Initialize English words dictionary for free mode validation
 * This loads the complete list of valid English words (370k+ words)
 */
export function initializeEnglishWords(englishWords: string[]): void {
  englishWordsSet = new Set(englishWords.map(w => w.toUpperCase().trim()));
  console.log(`Wordfall: Initialized English words dictionary with ${englishWordsSet.size} words`);
}

/**
 * Validate word input for free mode
 * Accepts all valid English words from the complete dictionary (2-20 letters)
 */
export function validateFreeWord(
  input: string,
  requiredLetter: string,
  usedWords: string[]
): { valid: boolean; reason?: string } {
  const normalized = input.trim().toUpperCase();
  
  // Accept words from 2 to 20 letters
  if (normalized.length < 2) {
    return { valid: false, reason: "Mot trop court (minimum 2 lettres)" };
  }
  
  if (normalized.length > 20) {
    return { valid: false, reason: "Mot trop long (maximum 20 lettres)" };
  }

  // Check if word contains only letters (no spaces, no special chars)
  if (!/^[A-Z]+$/.test(normalized)) {
    return { valid: false, reason: "Le mot ne doit contenir que des lettres" };
  }

  if (!normalized.startsWith(requiredLetter.toUpperCase())) {
    return { valid: false, reason: `Le mot doit commencer par "${requiredLetter.toUpperCase()}"` };
  }

  if (usedWords.includes(normalized)) {
    return { valid: false, reason: "Mot déjà utilisé" };
  }

  // Check if word exists in the complete English words dictionary
  // This uses the full dictionary of 370k+ valid English words
  if (!englishWordsSet || !englishWordsSet.has(normalized)) {
    return { valid: false, reason: "Ce mot n'existe pas dans le dictionnaire anglais" };
  }

  return { valid: true };
}

/**
 * Process word input
 */
export function processWordInput(
  state: WordfallState,
  input: string
): { 
  success: boolean; 
  newState: WordfallState; 
  reason?: string;
  pointsBreakdown?: {
    base: number;
    length: number;
    speed: number;
    level: number;
    combo: number;
    milestone: number;
    total: number;
    isPerfect: boolean;
    newStreak: number;
  };
} {
  if (!state.activeWord || state.gameOver || !state.isRunning) {
    return { success: false, newState: state, reason: "No active word" };
  }

  let isValid = false;
  let reason: string | undefined;

  if (state.mode === "exact") {
    if (!state.activeWord.translation) {
      return { success: false, newState: state, reason: "Translation missing" };
    }
    const validation = validateExactWord(input, state.activeWord.text, state.activeWord.translation);
    isValid = validation.valid;
    reason = validation.reason;
  } else {
    const validation = validateFreeWord(input, state.activeWord.displayText, state.usedWords);
    isValid = validation.valid;
    reason = validation.reason;
  }

  if (!isValid) {
    // Reset streak on error
    const newStateWithStreakReset: WordfallState = {
      ...state,
      streak: 0,
      combo: 1,
    };
    return { success: false, newState: newStateWithStreakReset, reason };
  }

  // Word is valid - update state
  // For free mode: keep only the last 5 words (FIFO - First In First Out)
  const newUsedWords = state.mode === "free" 
    ? [...state.usedWords, input.trim().toUpperCase()].slice(-5) // Keep only last 5 words
    : state.usedWords;

  const newWordsCompleted = state.wordsCompleted + 1;
  const newLevel = Math.floor(newWordsCompleted / DEFAULT_CONFIG.wordsPerLevel) + 1;
  
  // Calculate timing for speed bonus
  const currentTime = Date.now();
  const wordAge = state.wordStartTime ? currentTime - state.wordStartTime : 0;
  const wordPosition = state.activeWord?.y || 0;
  
  // Base points calculation (reduced)
  const wordLength = input.trim().length;
  let basePoints = state.mode === "exact" ? 5 : 8; // Reduced from 10/15
  
  // Length bonus: longer words = more points (reduced)
  const lengthBonus = Math.floor(wordLength * 0.5); // 0.5 points per letter (reduced from 2)
  
  // Speed bonus: faster = more points (based on word position, not time) (reduced)
  // Catch word high up (y < 30) = perfect catch bonus
  let speedBonus = 0;
  let isPerfect = false;
  if (wordPosition < 20) {
    speedBonus = 5; // Perfect catch bonus (reduced from 20)
    isPerfect = true;
  } else if (wordPosition < 40) {
    speedBonus = 3; // Good catch bonus (reduced from 10)
  } else if (wordPosition < 60) {
    speedBonus = 1; // Decent catch bonus (reduced from 5)
  }
  
  // Streak system: increase streak, calculate combo
  const newStreak = state.streak + 1;
  // Combo multiplier: increases with streak (1x, 1.5x at 5, 2x at 10, 2.5x at 20, 3x at 50) (reduced)
  let newCombo = 1;
  if (newStreak >= 50) newCombo = 3;
  else if (newStreak >= 20) newCombo = 2.5;
  else if (newStreak >= 10) newCombo = 2;
  else if (newStreak >= 5) newCombo = 1.5;
  
  // Level bonus (reduced)
  const levelBonus = (newLevel - 1) * 1; // Reduced from 3
  
  // Milestone bonuses (every 10 words) (reduced)
  let milestoneBonus = 0;
  if (newWordsCompleted % 10 === 0) {
    milestoneBonus = 10 * newCombo; // Bonus points for milestones (reduced from 50)
  }
  
  // Calculate total points
  const totalBase = basePoints + lengthBonus + speedBonus + levelBonus;
  const totalPoints = Math.floor(totalBase * newCombo) + Math.floor(milestoneBonus);
  
  const newScore = state.score + totalPoints;
  const newHighestStreak = Math.max(state.highestStreak, newStreak);
  const newPerfectCatches = isPerfect ? state.perfectCatches + 1 : state.perfectCatches;

  const newState: WordfallState = {
    ...state,
    activeWord: null, // Word cleared
    usedWords: newUsedWords,
    wordsCompleted: newWordsCompleted,
    level: newLevel,
    score: newScore,
    streak: newStreak,
    combo: newCombo,
    highestStreak: newHighestStreak,
    perfectCatches: newPerfectCatches,
    wordStartTime: undefined, // Reset for next word
  };

  return { 
    success: true, 
    newState,
    // Return additional info for UI feedback
    pointsBreakdown: {
      base: basePoints,
      length: lengthBonus,
      speed: speedBonus,
      level: levelBonus,
      combo: newCombo,
      milestone: milestoneBonus,
      total: totalPoints,
      isPerfect,
      newStreak,
    }
  };
}

/**
 * Process word reaching bottom (lose a life)
 */
export function processWordMissed(state: WordfallState): WordfallState {
  if (state.gameOver) {
    return state;
  }

  const newLives = state.lives - 1;
  const gameOver = newLives <= 0;

  // Reset streak when word is missed
  return {
    ...state,
    lives: newLives,
    activeWord: null,
    gameOver,
    isRunning: !gameOver,
    streak: 0,
    combo: 1,
    wordStartTime: undefined,
  };
}

/**
 * Start the game
 */
export function startGame(state: WordfallState): WordfallState {
  if (state.gameOver) {
    // Reset game
    return createGameState({ mode: state.mode });
  }

  return {
    ...state,
    isRunning: true,
    gameOver: false,
  };
}

/**
 * Pause the game
 */
export function pauseGame(state: WordfallState): WordfallState {
  return {
    ...state,
    isRunning: false,
  };
}

/**
 * Resume the game
 */
export function resumeGame(state: WordfallState): WordfallState {
  if (state.gameOver) {
    return state;
  }

  return {
    ...state,
    isRunning: true,
  };
}
