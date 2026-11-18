/**
 * Echo Lex (Flashback) - Core Game Logic
 *
 * A memory game where players must decide if they've seen a word before.
 * The French meaning is revealed after classification. Recognised repeats
 * earn one point only after their meaning is recalled. Words come from the player's level
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
    phase: "idle" | "playing" | "meaning" | "result" | "gameOver";
    meaningChoices: string[];
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
        meaningChoices: [],
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
            nextWord = fallbackPool[Math.floor(rng() * fallbackPool.length)] ?? state.currentWord;
            isNew = !state.seenWords.some(s => s.english === nextWord.english);
        } else {
            nextWord = pickNewWord(candidates, state.level, rng);
            isNew = true;
        }
    }

    return {
        ...state,
        currentWord: nextWord,
        meaningChoices: [],
        isNew,
        phase: "playing",
        lastDecisionCorrect: null,
    };
}

function finishRound(state: GameState, correct: boolean): GameState {
    const strikes = state.strikes + (correct ? 0 : 1);
    const seenWords = state.seenWords.some(word => word.english === state.currentWord.english)
        ? state.seenWords : [...state.seenWords, state.currentWord];
    return {
        ...state, seenWords, strikes, score: state.score + (correct ? 1 : 0),
        phase: strikes >= 3 ? "gameOver" : "result", lastDecisionCorrect: correct,
    };
}

function meaningChoices(state: GameState, rng: () => number): string[] {
    const correct = state.currentWord.french;
    const candidates = [...new Set(state.pool.filter(word => word.english !== state.currentWord.english)
        .map(word => word.french))].filter(meaning => meaning !== correct);
    // A tiny custom pool may have fewer than two distinct distractors.
    if (candidates.length < 2) {
        for (const word of FLASHBACK_WORDS) {
            if (word.english !== state.currentWord.english && word.french !== correct && !candidates.includes(word.french)) {
                candidates.push(word.french);
            }
            if (candidates.length === 2) break;
        }
    }
    const entry = VOCABULARY.find(word => word.english === state.currentWord.english && word.french === correct);
    const related = entry?.distractors
        .map(english => FLASHBACK_WORDS.find(word => word.english === english)?.french)
        .filter((meaning): meaning is string => Boolean(meaning && candidates.includes(meaning))) ?? [];
    const learned = state.seenWords.map(word => word.french).filter(meaning => candidates.includes(meaning));
    const preferred = [...new Set([...related, ...learned])];
    const choices: string[] = [];
    while (preferred.length && choices.length < 2) {
        const [choice] = preferred.splice(Math.floor(rng() * preferred.length), 1);
        choices.push(choice);
        candidates.splice(candidates.indexOf(choice), 1);
    }
    while (choices.length < 2 && candidates.length) {
        choices.push(candidates.splice(Math.floor(rng() * candidates.length), 1)[0]);
    }
    choices.splice(Math.floor(rng() * (choices.length + 1)), 0, correct);
    return choices;
}

export function submitDecision(state: GameState, saysIsSeen: boolean, rng: () => number = Math.random): GameState {
    if (state.phase !== "playing") return state;
    if (saysIsSeen && !state.isNew) return { ...state, phase: "meaning", meaningChoices: meaningChoices(state, rng) };
    return finishRound(state, !saysIsSeen && state.isNew);
}

export function submitMeaning(state: GameState, choice: string): GameState {
    if (state.phase !== "meaning" || !state.meaningChoices.includes(choice)) return state;
    return finishRound(state, choice === state.currentWord.french);
}

export function submitTimeout(state: GameState): GameState {
    return state.phase === "playing" || state.phase === "meaning" ? finishRound(state, false) : state;
}
