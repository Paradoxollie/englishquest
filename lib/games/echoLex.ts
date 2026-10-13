/**
 * Echo Lex - Core Game Logic
 * 
 * A memory game where players must decide if they've seen a word before.
 * English + French translation displayed for learning.
 */

export interface WordPair {
    english: string;
    french: string;
}

export interface GameState {
    score: number;
    strikes: number;
    seenWords: WordPair[];
    currentWord: WordPair;
    isNew: boolean; // Whether the current word is actually new
    phase: "idle" | "playing" | "result" | "gameOver";
    lastDecisionCorrect: boolean | null;
}

// Reuse vocabulary from flash translation or generic source
import { VOCABULARY } from "./flashTranslation";

export function createGameState(rng: () => number = Math.random): GameState {
    // Pick a random starting word
    const startIndex = Math.floor(rng() * VOCABULARY.length);
    const firstWord = VOCABULARY[startIndex];

    return {
        score: 0,
        strikes: 0,
        seenWords: [],
        currentWord: firstWord,
        isNew: true,
        phase: "idle",
        lastDecisionCorrect: null,
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
        // Pick a new word from VOCABULARY that isn't in seenWords
        const candidates = VOCABULARY.filter(
            v => !state.seenWords.some(s => s.english === v.english)
        );

        if (candidates.length === 0) {
            // Pool exhausted? Just pick ANY word that isn't the current one
            const fallbackPool = VOCABULARY.filter(v => v.english !== state.currentWord.english);
            nextWord = fallbackPool[Math.floor(rng() * fallbackPool.length)];
            // Technically it's "seen" now if it was in seenWords, but if we exhausted candidates, 
            // we should probably check if it's in seenWords.
            isNew = !state.seenWords.some(s => s.english === nextWord.english);
        } else {
            nextWord = candidates[Math.floor(rng() * candidates.length)];
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
