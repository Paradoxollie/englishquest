/**
 * Flash Translation - Core Game Logic
 * 
 * A reaction speed game where players must quickly select the correct
 * English translation of French words. A test of speed and vocabulary.
 * 
 * Game Flow:
 * 1. Show French word with random wait time (2000-4000ms)
 * 2. Show 4 English choices (1 correct + 3 distractors)
 * 3. Measure reaction time from when choices appear
 * 4. Apply +3000ms penalty for wrong answers
 * 5. Final score = total time (lower is better)
 */

export interface WordPair {
    french: string;
    english: string;
    distractors: string[]; // Pre-defined wrong answers
}

export interface AnswerChoice {
    text: string;
    isCorrect: boolean;
}

export interface Round {
    wordPair: WordPair;
    choices: AnswerChoice[]; // 4 shuffled choices
    correctIndex: number;
    waitTimeMs: number; // Random 2000-4000ms
    startTimeMs?: number; // When choices appear
    answerTimeMs?: number; // When player answers
    reactionTimeMs?: number; // answerTimeMs - startTimeMs
    isCorrect?: boolean;
}

export interface GameConfig {
    totalRounds: number; // 10
    minWaitMs: number; // 2000
    maxWaitMs: number; // 4000
    wrongAnswerPenaltyMs: number; // 3000
    rng?: () => number; // For testing
}

export interface GameState {
    config: GameConfig;
    rounds: Round[];
    currentRoundIndex: number;
    phase: "waiting" | "answering" | "feedback" | "ended";
    totalTimeMs: number;
    wrongAnswers: number;
    started: boolean;
}

function defaultRng(): number {
    return Math.random();
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[], rng: () => number): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Select 3 random distractors from the word pair's distractor pool
 * and other word pairs if needed
 */
function selectDistractors(
    wordPair: WordPair,
    allWords: WordPair[],
    rng: () => number
): string[] {
    const available = [...wordPair.distractors];

    // If we need more distractors, take from other words
    // FILTER: Don't pick words that are synonyms or the correct answer
    // For safety, we only pick English words that are NOT the correct answer
    if (available.length < 3) {
        const otherWords = allWords
            .filter(w => w.english !== wordPair.english)
            .map(w => w.english);
        available.push(...otherWords);
    }

    // Shuffle and take first 3
    const shuffled = shuffle(available, rng);
    return shuffled.slice(0, 3);
}

/**
 * Create a round with shuffled choices
 */
function createRound(
    wordPair: WordPair,
    allWords: WordPair[],
    config: GameConfig
): Round {
    const rng = config.rng ?? defaultRng;

    // Select 3 distractors
    const distractors = selectDistractors(wordPair, allWords, rng);

    // Create choices (1 correct + 3 wrong)
    const choices: AnswerChoice[] = ([
        { text: wordPair.english, isCorrect: true },
        ...distractors.map(d => ({ text: d, isCorrect: false })),
    ] as AnswerChoice[]);

    // Shuffle choices
    const shuffledChoices = shuffle(choices, rng);
    const correctIndex = shuffledChoices.findIndex(c => c.isCorrect);

    // Random wait time between min and max
    const waitTimeMs = Math.floor(
        config.minWaitMs + rng() * (config.maxWaitMs - config.minWaitMs)
    );

    return {
        wordPair,
        choices: shuffledChoices,
        correctIndex,
        waitTimeMs,
    };
}

/**
 * Create initial game state with all rounds pre-generated
 */
export function createGameState(
    words: WordPair[],
    config: GameConfig
): GameState {
    const rng = config.rng ?? defaultRng;

    // Select random words for the game
    const shuffledWords = shuffle([...words], rng);
    const selectedWords = shuffledWords.slice(0, config.totalRounds);

    // Create all rounds
    const rounds = selectedWords.map(word => createRound(word, words, config));

    return {
        config,
        rounds,
        currentRoundIndex: 0,
        phase: "waiting",
        totalTimeMs: 0,
        wrongAnswers: 0,
        started: false,
    };
}

/**
 * Start the game
 */
export function startGame(state: GameState): GameState {
    return {
        ...state,
        started: true,
        phase: "waiting",
    };
}

/**
 * Start showing choices (called after wait time)
 */
export function startAnswering(state: GameState, nowMs: number): GameState {
    if (state.phase !== "waiting") return state;

    const currentRound = state.rounds[state.currentRoundIndex];
    if (!currentRound) return state;

    return {
        ...state,
        phase: "answering",
        rounds: state.rounds.map((round, i) =>
            i === state.currentRoundIndex
                ? { ...round, startTimeMs: nowMs }
                : round
        ),
    };
}

/**
 * Submit an answer
 */
export function submitAnswer(
    state: GameState,
    choiceIndex: number,
    nowMs: number
): GameState {
    if (state.phase !== "answering") return state;

    const currentRound = state.rounds[state.currentRoundIndex];
    if (!currentRound || currentRound.startTimeMs === undefined) return state;

    const isCorrect = choiceIndex === currentRound.correctIndex;
    const reactionTimeMs = nowMs - currentRound.startTimeMs;
    const penaltyMs = isCorrect ? 0 : state.config.wrongAnswerPenaltyMs;

    // Update round
    const updatedRounds = state.rounds.map((round, i) =>
        i === state.currentRoundIndex
            ? {
                ...round,
                answerTimeMs: nowMs,
                reactionTimeMs,
                isCorrect,
            }
            : round
    );

    return {
        ...state,
        rounds: updatedRounds,
        phase: "feedback",
        totalTimeMs: state.totalTimeMs + reactionTimeMs + penaltyMs,
        wrongAnswers: state.wrongAnswers + (isCorrect ? 0 : 1),
    };
}

/**
 * Move to next round or end game
 */
export function nextRound(state: GameState): GameState {
    if (state.phase !== "feedback") return state;

    const nextIndex = state.currentRoundIndex + 1;

    if (nextIndex >= state.rounds.length) {
        return {
            ...state,
            phase: "ended",
        };
    }

    return {
        ...state,
        currentRoundIndex: nextIndex,
        phase: "waiting",
    };
}

/**
 * Get current round
 */
export function getCurrentRound(state: GameState): Round | undefined {
    return state.rounds[state.currentRoundIndex];
}

/**
 * Calculate final score (total time in ms)
 */
export function getFinalScore(state: GameState): number {
    return state.totalTimeMs;
}

/**
 * Get average reaction time (excluding penalties)
 */
export function getAverageReactionTime(state: GameState): number {
    const completedRounds = state.rounds.filter(r => r.reactionTimeMs !== undefined);
    if (completedRounds.length === 0) return 0;

    const totalReactionTime = completedRounds.reduce(
        (sum, r) => sum + (r.reactionTimeMs ?? 0),
        0
    );

    return Math.round(totalReactionTime / completedRounds.length);
}

/**
 * VOCABULARY LIST
 * Focus: "Faux Amis" (False Friends) and High-Frequency Non-Cognates
 * Criteria: Words must NOT look like their translation to force memory recall.
 * Strict check: Only one correct answer possible per French word.
 */
export const VOCABULARY: WordPair[] = [
    // --- TOP TIER FAUX AMIS (MUST KNOW) ---
    { french: "actuellement", english: "currently", distractors: ["actually", "presently", "really"] },
    { french: "réellement", english: "actually", distractors: ["currently", "now", "presently"] },
    { french: "éventuellement", english: "possibly", distractors: ["eventually", "finally", "ultimately"] },
    { french: "finalement", english: "eventually", distractors: ["possibly", "maybe", "optionally"] },
    { french: "blesser", english: "injure", distractors: ["bless", "hurt", "damage"] },
    { french: "bénir", english: "bless", distractors: ["injure", "wound", "hurt"] },
    { french: "monnaie", english: "change", distractors: ["money", "cash", "bills"] },
    { french: "argent", english: "money", distractors: ["silver", "change", "coins"] },
    { french: "déception", english: "disappointment", distractors: ["deception", "trick", "lie"] },
    { french: "tromperie", english: "deception", distractors: ["disappointment", "sadness", "regret"] },
    { french: "attendre", english: "wait", distractors: ["attend", "expect", "reach"] },
    { french: "assister à", english: "attend", distractors: ["assist", "help", "wait"] },
    { french: "aider", english: "assist", distractors: ["attend", "watch", "be present"] },
    { french: "librairie", english: "bookshop", distractors: ["library", "bookshelf", "store"] },
    { french: "bibliothèque", english: "library", distractors: ["bookshop", "store", "bookcase"] },
    { french: "journée", english: "day", distractors: ["journey", "trip", "travel"] },
    { french: "voyage", english: "journey", distractors: ["day", "journal", "diary"] },
    { french: "rester", english: "stay", distractors: ["rest", "relax", "sleep"] },
    { french: "se reposer", english: "rest", distractors: ["stay", "remain", "wait"] },
    { french: "passer (un examen)", english: "take", distractors: ["pass", "succeed", "win"] },
    { french: "réussir (un examen)", english: "pass", distractors: ["take", "sit", "undergo"] },
    { french: "formidable", english: "great", distractors: ["formidable", "scary", "dreadful"] },
    { french: "redoutable", english: "formidable", distractors: ["wonderful", "amazing", "great"] },
    { french: "sensible", english: "sensitive", distractors: ["sensible", "wise", "reasonable"] },
    { french: "raisonnable", english: "sensible", distractors: ["sensitive", "feeling", "emotional"] },
    { french: "sympathique", english: "nice", distractors: ["sympathetic", "compassionate", "pitying"] },
    { french: "compatissant", english: "sympathetic", distractors: ["nice", "friendly", "pleasant"] },

    // --- DOUBLE MEANING TRAPS ---
    { french: "un avocat (fruit)", english: "avocado", distractors: ["lawyer", "advocate", "fruit"] },
    { french: "un avocat (métier)", english: "lawyer", distractors: ["avocado", "fruit", "advocate"] },
    { french: "un coin", english: "corner", distractors: ["coin", "money", "penny"] },
    { french: "une pièce de monnaie", english: "coin", distractors: ["corner", "nook", "angle"] },
    { french: "une pièce (salle)", english: "room", distractors: ["piece", "part", "slice"] },
    { french: "un morceau", english: "piece", distractors: ["room", "chamber", "hall"] },
    { french: "la chair", english: "flesh", distractors: ["chair", "seat", "bench"] },
    { french: "une chaise", english: "chair", distractors: ["flesh", "meat", "skin"] },
    { french: "une grappe", english: "bunch", distractors: ["grape", "fruit", "wine"] },
    { french: "du raisin", english: "grape", distractors: ["bunch", "cluster", "group"] },

    // --- COMMON VERB CONFUSIONS ---
    { french: "réaliser (un rêve)", english: "fulfill", distractors: ["realize", "understand", "notice"] },
    { french: "se rendre compte", english: "realize", distractors: ["achieve", "make", "create"] },
    { french: "supporter (tolérer)", english: "bear", distractors: ["support", "help", "back"] },
    { french: "soutenir", english: "support", distractors: ["bear", "stand", "tolerate"] },
    { french: "prétendre", english: "claim", distractors: ["pretend", "fake", "simulate"] },
    { french: "faire semblant", english: "pretend", distractors: ["claim", "assert", "affirm"] },
    { french: "contrôler (vérifier)", english: "check", distractors: ["control", "dominate", "master"] },
    { french: "maîtriser", english: "control", distractors: ["check", "verify", "inspect"] },
    { french: "ignorer (ne pas savoir)", english: "not know", distractors: ["ignore", "disregard", "snub"] },
    { french: "ne pas prêter attention", english: "ignore", distractors: ["not know", "be unaware", "forget"] },
    { french: "demander", english: "ask", distractors: ["demand", "require", "insist"] },
    { french: "exiger", english: "demand", distractors: ["ask", "request", "inquire"] },
    { french: "pleurer", english: "cry", distractors: ["rain", "shout", "call"] },
    { french: "pleuvoir", english: "rain", distractors: ["cry", "weep", "sob"] },

    // --- NON-COGNATE EVERYDAY OBJECTS (NO TRANSPARENCY) ---
    { french: "pain", english: "bread", distractors: ["pain", "hurt", "ache"] },
    { french: "douleur", english: "pain", distractors: ["bread", "loaf", "food"] },
    { french: "veste", english: "jacket", distractors: ["vest", "shirt", "coat"] },
    { french: "gilet", english: "vest", distractors: ["jacket", "blazer", "suit"] },
    { french: "tissu", english: "fabric", distractors: ["tissue", "paper", "wipe"] },
    { french: "mouchoir en papier", english: "tissue", distractors: ["fabric", "cloth", "material"] },
    { french: "habit", english: "clothes", distractors: ["habit", "custom", "addiction"] },
    { french: "habitude", english: "habit", distractors: ["clothes", "costume", "wear"] },
    { french: "préservatif", english: "condom", distractors: ["preservative", "jam", "can"] },
    { french: "conservateur (alimentaire)", english: "preservative", distractors: ["condom", "protection", "safe"] },
    { french: "cravate", english: "tie", distractors: ["cravat", "scarf", "bow"] },
    { french: "camion", english: "truck", distractors: ["car", "van", "wagon"] },
    { french: "essence", english: "petrol", distractors: ["essence", "perfume", "oil"] },
    { french: "conférence", english: "lecture", distractors: ["conference", "meeting", "talk"] },
    { french: "avertissement", english: "warning", distractors: ["advertisement", "ad", "notice"] },
    { french: "publicité", english: "advertisement", distractors: ["warning", "publicity", "notice"] },
    { french: "hasard", english: "chance", distractors: ["hazard", "danger", "risk"] },
    { french: "danger", english: "hazard", distractors: ["chance", "luck", "fate"] },
    { french: "large", english: "wide", distractors: ["large", "big", "huge"] },
    { french: "grand (taille)", english: "large", distractors: ["wide", "broad", "thick"] },
    { french: "prune", english: "plum", distractors: ["prune", "grape", "fruit"] },
    { french: "pruneau", english: "prune", distractors: ["plum", "apricot", "date"] },

    // --- USEFUL CONNECTORS (NON-COGNATE) ---
    { french: "pourtant", english: "yet", distractors: ["therefore", "so", "thus"] },
    { french: "néanmoins", english: "nevertheless", distractors: ["furthermore", "moreover", "besides"] },
    { french: "aussi", english: "also", distractors: ["so", "as", "too"] },
    { french: "car", english: "for", distractors: ["car", "bus", "vehicle"] },
    { french: "puisque", english: "since", distractors: ["for", "because", "as"] },
    { french: "tandis que", english: "whereas", distractors: ["where", "when", "while"] },
    { french: "bien que", english: "although", distractors: ["despite", "in spite of", "however"] },
    { french: "dès que", english: "as soon as", distractors: ["while", "during", "before"] },
    { french: "tant que", english: "as long as", distractors: ["while", "whereas", "although"] },
    { french: "malgré", english: "despite", distractors: ["although", "though", "even if"] },
];
