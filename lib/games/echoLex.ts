/**
 * Echo Lex (Flashback) - Core Game Logic
 *
 * A memory game where players must decide if they've seen a word before.
 * The English word is always shown with its French translation, so every
 * round is also a vocabulary round. Words come from the player's level
 * (about 70 %) and the level below (30 %), from the Flash Translation list.
 */

import { VOCABULARY } from "./flashTranslation";
import { pickOneByLevel, type GameLevel } from "./levels";

export interface WordPair {
    english: string;
    french: string;
    level?: GameLevel;
}

export interface GameState {
    score: number;
    strikes: number;
    seenWords: WordPair[];
    currentWord: WordPair;
    isNew: boolean; // Whether the current word is actually new
    phase: "idle" | "playing" | "result" | "gameOver";
    lastDecisionCorrect: boolean | null;
    /** Mots disponibles pour la partie. */
    pool: WordPair[];
    /** Niveau du joueur : pondère le tirage des mots nouveaux. */
    level: GameLevel | null;
}

/** Tout le vocabulaire, sans les distracteurs de Flash Translation. */
export const FLASHBACK_WORDS: WordPair[] = VOCABULARY.map(({ english, french, level }) => ({ english, french, level }));

/** Mots du niveau du joueur et du niveau inférieur. */
export function flashbackWordsForLevel(level: GameLevel): WordPair[] {
    return FLASHBACK_WORDS.filter((word) => word.level === level || word.level === level - 1);
}

function pickNewWord(candidates: WordPair[], level: GameLevel | null, rng: () => number): WordPair {
    if (level) {
        const levelled = candidates.filter((word): word is WordPair & { level: GameLevel } => word.level !== undefined);
        const picked = pickOneByLevel(levelled, level, rng);
        if (picked) return picked;
    }
    return candidates[Math.floor(rng() * candidates.length)];
}

export function createGameState(
    rng: () => number = Math.random,
    words: WordPair[] = FLASHBACK_WORDS,
    level: GameLevel | null = null
): GameState {
    const pool = words.length > 0 ? words : FLASHBACK_WORDS;
    const firstWord = pickNewWord(pool, level, rng);

    return {
        score: 0,
        strikes: 0,
        seenWords: [],
        currentWord: firstWord,
        isNew: true,
        phase: "idle",
        lastDecisionCorrect: null,
        pool,
        level,
    };
}

export function startGame(state: GameState): GameState {
    if (state.phase !== "idle") return state;
    return {
        ...state,
        phase: "playing",
        seenWords: [],
        isNew: true,
    };
}

export function nextRound(state: GameState, rng: () => number = Math.random): GameState {
    if (state.phase !== "result") return state;

    // Decision: Show a "seen" word or a "new" word?
    // 50/50 chance, but only if we HAVE seen words.
    const shouldShowSeen = state.seenWords.length > 1 && rng() > 0.5;

    let nextWord: WordPair;
    let isNew: boolean;

    if (shouldShowSeen) {
        // Pick a random word from seenWords (excluding the current one to avoid immediate repeats if possible)
        const candidates = state.seenWords.filter(w => w.english !== state.currentWord.english);
        const pool = candidates.length > 0 ? candidates : state.seenWords;
        nextWord = pool[Math.floor(rng() * pool.length)];
        isNew = false;
    } else {
        // Pick a new word from the pool that isn't in seenWords
        const candidates = state.pool.filter(
            v => !state.seenWords.some(s => s.english === v.english)
        );

        if (candidates.length === 0) {
            // Pool exhausted: pick any word that isn't the current one; it is then a word already seen.
            const fallbackPool = state.pool.filter(v => v.english !== state.currentWord.english);
            nextWord = fallbackPool[Math.floor(rng() * fallbackPool.length)];
            isNew = !state.seenWords.some(s => s.english === nextWord.english);
        } else {
            nextWord = pickNewWord(candidates, state.level, rng);
            isNew = true;
        }
    }

    return {
        ...state,
        currentWord: nextWord,
        isNew,
        phase: "playing",
        lastDecisionCorrect: null,
    };
}

export function submitDecision(state: GameState, saysIsSeen: boolean): GameState {
    if (state.phase !== "playing") return state;
    const isCorrect = saysIsSeen === !state.isNew;

    let newScore = state.score;
    let newStrikes = state.strikes;
    let newPhase: GameState["phase"] = "result";
    // A word has been seen even when the player misclassified it.
    const newSeenWords = state.seenWords.some(word => word.english === state.currentWord.english)
        ? state.seenWords
        : [...state.seenWords, state.currentWord];

    if (isCorrect) {
        newScore += 1;
    } else {
        newStrikes += 1;
        if (newStrikes >= 3) {
            newPhase = "gameOver";
        }
    }

    return {
        ...state,
        score: newScore,
        strikes: newStrikes,
        phase: newPhase,
        lastDecisionCorrect: isCorrect,
        seenWords: newSeenWords,
    };
}
