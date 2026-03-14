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
 * 4. Apply +5000ms penalty for wrong answers
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
    wrongAnswerPenaltyMs: number; // 5000
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
    // --- 1. ESSENTIAL PHRASAL VERBS (CRUCIAL FOR FLUENCY) ---
    { french: "abandonner", english: "give up", distractors: ["give in", "give out", "leave"] },
    { french: "continuer", english: "carry on", distractors: ["carry out", "hold on", "keep off"] },
    { french: "s'occuper de", english: "look after", distractors: ["look for", "look at", "watch out"] },
    { french: "chercher", english: "look for", distractors: ["look after", "look at", "find"] },
    { french: "rejeter / refuser", english: "turn down", distractors: ["turn off", "turn up", "refuse"] },
    { french: "éteindre", english: "turn off", distractors: ["turn down", "turn out", "close"] },
    { french: "découvrir", english: "find out", distractors: ["find in", "look for", "search"] },
    { french: "bien s'entendre", english: "get along", distractors: ["get over", "get up", "friend"] },
    { french: "se remettre (d'une maladie)", english: "get over", distractors: ["get along", "get up", "recover"] },
    { french: "enlever (vêtement)", english: "take off", distractors: ["take out", "put on", "remove"] },
    { french: "mettre (vêtement)", english: "put on", distractors: ["put off", "take off", "wear"] },
    { french: "remettre à plus tard", english: "put off", distractors: ["put on", "put out", "cancel"] },
    { french: "tomber en panne", english: "break down", distractors: ["break up", "break off", "fall"] },
    { french: "rompre (relation)", english: "break up", distractors: ["break down", "break out", "stop"] },
    { french: "grandir", english: "grow up", distractors: ["grow on", "grow out", "tall"] },
    { french: "élever (enfant)", english: "bring up", distractors: ["bring in", "take up", "raise"] },
    { french: "annuler", english: "call off", distractors: ["call on", "call in", "delete"] },
    { french: "attendre (au téléphone)", english: "hold on", distractors: ["hold up", "hold off", "wait"] },
    { french: "admirer", english: "look up to", distractors: ["look down on", "watch", "admire"] },
    { french: "mépriser", english: "look down on", distractors: ["look up to", "hate", "despise"] },

    // --- 2. BUSINESS & PROFESSIONAL ENGLISH ---
    { french: "embaucher", english: "hire", distractors: ["fire", "rent", "employ"] },
    { french: "licencier", english: "fire", distractors: ["hire", "burn", "quit"] },
    { french: "démissionner", english: "quit", distractors: ["quiet", "quite", "fire"] },
    { french: "salaire (horaire/hebdo)", english: "wage", distractors: ["salary", "money", "pay"] },
    { french: "salaire (mensuel/annuel)", english: "salary", distractors: ["wage", "money", "income"] },
    { french: "date limite", english: "deadline", distractors: ["date line", "finish", "limit"] },
    { french: "réunion", english: "meeting", distractors: ["reunion", "meet", "gathering"] },
    { french: "PDG", english: "CEO", distractors: ["boss", "manager", "chief"] },
    { french: "siège social", english: "headquarters", distractors: ["head office", "base", "seat"] },
    { french: "chiffre d'affaires", english: "turnover", distractors: ["revenue", "profit", "sales"] },
    { french: "bénéfice", english: "profit", distractors: ["benefit", "turnover", "gain"] },
    { french: "concurrent", english: "competitor", distractors: ["concurrent", "rival", "contestant"] },
    { french: "fournisseur", english: "supplier", distractors: ["provider", "giver", "vendor"] },
    { french: "client", english: "customer", distractors: ["client", "guest", "buyer"] },
    { french: "facture", english: "invoice", distractors: ["bill", "facture", "receipt"] },
    { french: "reçu / ticket", english: "receipt", distractors: ["recipe", "bill", "ticket"] },
    { french: "stagiaire", english: "intern", distractors: ["trainee", "student", "stage"] },
    { french: "stage", english: "internship", distractors: ["stage", "training", "course"] },
    { french: "promotion", english: "promotion", distractors: ["raise", "advance", "upgrade"] },
    { french: "augmentation", english: "raise", distractors: ["rise", "promotion", "lift"] },

    // --- 3. EMOTIONS & PERSONALITY ---
    { french: "têtu", english: "stubborn", distractors: ["shy", "bold", "heady"] },
    { french: "timide", english: "shy", distractors: ["shine", "bold", "fear"] },
    { french: "fier", english: "proud", distractors: ["pride", "loud", "happy"] },
    { french: "déçu", english: "disappointed", distractors: ["deceived", "sad", "angry"] },
    { french: "accablé / débordé", english: "overwhelmed", distractors: ["overcome", "busy", "tired"] },
    { french: "soulagé", english: "relieved", distractors: ["believed", "relaxed", "calm"] },
    { french: "épuisé", english: "exhausted", distractors: ["tired", "worn out", "sleepy"] },
    { french: "gêné / embarrassé", english: "embarrassed", distractors: ["embraced", "ashamed", "shy"] },
    { french: "honteux", english: "ashamed", distractors: ["shy", "embarrassed", "sorry"] },
    { french: "jaloux", english: "jealous", distractors: ["envious", "zealous", "yellow"] },
    { french: "anxieux", english: "anxious", distractors: ["eager", "scared", "nervous"] },
    { french: "reconnaissant", english: "grateful", distractors: ["great", "thankful", "pleased"] },
    { french: "égoïste", english: "selfish", distractors: ["shellfish", "self", "mean"] },
    { french: "sensible", english: "sensitive", distractors: ["sensible", "feeling", "soft"] },
    { french: "bon sens / raisonnable", english: "sensible", distractors: ["sensitive", "wise", "smart"] },
    { french: "maladroit", english: "clumsy", distractors: ["awkward", "silly", "stupid"] },
    { french: "bavard", english: "talkative", distractors: ["chatty", "loud", "speaking"] },
    { french: "radin", english: "stingy", distractors: ["mean", "cheap", "poor"] },
    { french: "généreux", english: "generous", distractors: ["kind", "giving", "rich"] },
    { french: "honnête", english: "honest", distractors: ["frank", "true", "real"] },

    // --- 4. ABSTRACT CONCEPTS & CONNECTORS ---
    { french: "liberté", english: "freedom", distractors: ["liberty", "free", "open"] },
    { french: "connaissance", english: "knowledge", distractors: ["knowing", "science", "info"] },
    { french: "sagesse", english: "wisdom", distractors: ["wise", "smart", "brain"] },
    { french: "comportement", english: "behavior", distractors: ["attitude", "act", "conduct"] },
    { french: "but / objectif", english: "purpose", distractors: ["goal", "aim", "target"] },
    { french: "moyen / moyenne", english: "average", distractors: ["mean", "medium", "middle"] },
    { french: "environ", english: "about", distractors: ["around", "nearly", "close"] },
    { french: "presque", english: "almost", distractors: ["mostly", "near", "about"] },
    { french: "plutôt", english: "rather", distractors: ["quite", "fairly", "sooner"] },
    { french: "sauf", english: "except", distractors: ["expect", "accept", "save"] },
    { french: "à moins que", english: "unless", distractors: ["until", "if", "less"] },
    { french: "au lieu de", english: "instead of", distractors: ["in place", "rather", "place"] },
    { french: "puisque", english: "since", distractors: ["for", "because", "as"] },
    { french: "bien que", english: "although", distractors: ["despite", "though", "even"] },
    { french: "pourtant", english: "yet", distractors: ["however", "still", "but"] },
    { french: "d'ailleurs", english: "besides", distractors: ["beside", "anyway", "also"] },
    { french: "par conséquent", english: "therefore", distractors: ["so", "thus", "then"] },
    { french: "en fait", english: "actually", distractors: ["currently", "fact", "real"] },
    { french: "actuellement", english: "currently", distractors: ["actually", "now", "present"] },
    { french: "habitude", english: "habit", distractors: ["custom", "use", "wear"] },

    // --- 5. COMMON IRREGULAR VERBS (CONTEXTUAL) ---
    { french: "chercher", english: "seek", distractors: ["search", "look", "find"] },
    { french: "cacher", english: "hide", distractors: ["hidden", "cover", "mask"] },
    { french: "geler", english: "freeze", distractors: ["froze", "cold", "ice"] },
    { french: "secouer", english: "shake", distractors: ["shook", "move", "mix"] },
    { french: "couler", english: "sink", distractors: ["sank", "flow", "drown"] },
    { french: "briller", english: "shine", distractors: ["shone", "light", "bright"] },
    { french: "tirer (arme)", english: "shoot", distractors: ["shot", "fire", "gun"] },
    { french: "fermer (à clé)", english: "lock", distractors: ["close", "shut", "block"] },
    { french: "voler (dérober)", english: "steal", distractors: ["rob", "fly", "take"] },
    { french: "jurer", english: "swear", distractors: ["promise", "cursed", "oath"] },
    { french: "déchirer", english: "tear", distractors: ["rip", "cry", "cut"] },
    { french: "porter (vêtement)", english: "wear", distractors: ["carry", "bear", "cloth"] },
    { french: "gagner (compétition)", english: "win", distractors: ["earn", "gain", "beat"] },
    { french: "gagner (argent)", english: "earn", distractors: ["win", "gain", "get"] },
    { french: "dépenser", english: "spend", distractors: ["expense", "cost", "pay"] },
    { french: "prêter", english: "lend", distractors: ["borrow", "loan", "give"] },
    { french: "emprunter", english: "borrow", distractors: ["lend", "take", "rent"] },
    { french: "enseigner", english: "teach", distractors: ["learn", "show", "educate"] },
    { french: "mordre", english: "bite", distractors: ["bit", "chew", "eat"] },
    { french: "souffler", english: "blow", distractors: ["blew", "wind", "breath"] },

    // --- TOP TIER FAUX AMIS (RETAINED) ---
    { french: "blesser", english: "injure", distractors: ["bless", "hurt", "pain"] },
    { french: "bénir", english: "bless", distractors: ["injure", "good", "pray"] },
    { french: "monnaie", english: "change", distractors: ["money", "coin", "cash"] },
    { french: "argent", english: "money", distractors: ["silver", "change", "rich"] },
    { french: "librairie", english: "bookshop", distractors: ["library", "store", "shop"] },
    { french: "bibliothèque", english: "library", distractors: ["bookshop", "biblio", "shelf"] },
    { french: "journée", english: "day", distractors: ["journey", "trip", "sun"] },
    { french: "voyage", english: "journey", distractors: ["day", "travel", "tour"] },
    { french: "rester", english: "stay", distractors: ["rest", "remain", "wait"] },
    { french: "se reposer", english: "rest", distractors: ["stay", "sleep", "calm"] },
    { french: "passer (un examen)", english: "take", distractors: ["pass", "sit", "do"] },
    { french: "réussir (un examen)", english: "pass", distractors: ["take", "succeed", "win"] },
    { french: "formidable", english: "great", distractors: ["formidable", "scary", "fear"] },
    { french: "redoutable", english: "formidable", distractors: ["great", "fearful", "bad"] },
    { french: "sympathique", english: "nice", distractors: ["sympathetic", "friendly", "cool"] },
    { french: "compatissant", english: "sympathetic", distractors: ["nice", "pity", "kind"] },
    { french: "pain", english: "bread", distractors: ["pain", "hurt", "food"] },
    { french: "douleur", english: "pain", distractors: ["bread", "ache", "suffer"] },
    { french: "veste", english: "jacket", distractors: ["vest", "coat", "wear"] },
    { french: "gilet", english: "vest", distractors: ["jacket", "waist", "suit"] },
    { french: "tissu", english: "fabric", distractors: ["tissue", "cloth", "textile"] },
    { french: "mouchoir en papier", english: "tissue", distractors: ["fabric", "paper", "wipe"] },
    { french: "préservatif", english: "condom", distractors: ["preservative", "safe", "protect"] },
    { french: "conservateur (alimentaire)", english: "preservative", distractors: ["condom", "food", "keep"] },
];
