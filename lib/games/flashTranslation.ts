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
 * Rebuilt to avoid ambiguous correct answers and to add more high-frequency,
 * useful words and false friends.
 */
export const VOCABULARY: WordPair[] = [
    // --- 1. ESSENTIAL PHRASAL VERBS ---
    { french: "abandonner", english: "give up", distractors: ["give in", "give out", "leave"] },
    { french: "continuer", english: "carry on", distractors: ["carry out", "slow down", "put off"] },
    { french: "s'occuper de", english: "look after", distractors: ["look for", "look at", "watch"] },
    { french: "chercher", english: "look for", distractors: ["look after", "wait for", "avoid"] },
    { french: "rejeter / refuser", english: "turn down", distractors: ["turn up", "turn off", "accept"] },
    { french: "éteindre", english: "turn off", distractors: ["turn on", "turn up", "close"] },
    { french: "découvrir", english: "find out", distractors: ["look for", "hide", "ignore"] },
    { french: "bien s'entendre", english: "get along", distractors: ["get over", "break down", "fit in"] },
    { french: "se remettre (d'une maladie)", english: "get over", distractors: ["give up", "get along", "fall ill"] },
    { french: "enlever (vêtement)", english: "take off", distractors: ["put on", "take out", "throw away"] },
    { french: "mettre (vêtement)", english: "put on", distractors: ["take off", "put away", "wear out"] },
    { french: "remettre à plus tard", english: "put off", distractors: ["put on", "carry on", "call off"] },
    { french: "tomber en panne", english: "break down", distractors: ["break up", "turn off", "speed up"] },
    { french: "rompre (relation)", english: "break up", distractors: ["break down", "make up", "turn up"] },
    { french: "grandir", english: "grow up", distractors: ["grow out", "wake up", "settle down"] },
    { french: "élever (un enfant)", english: "bring up", distractors: ["bring in", "take over", "hold back"] },
    { french: "annuler", english: "call off", distractors: ["call on", "put on", "keep up"] },
    { french: "attendre (au téléphone)", english: "hold on", distractors: ["hang up", "hold up", "go away"] },
    { french: "prendre pour modèle", english: "look up to", distractors: ["look after", "look down on", "turn into"] },
    { french: "prendre de haut", english: "look down on", distractors: ["look up to", "look after", "care for"] },

    // --- 2. BUSINESS & PROFESSIONAL ENGLISH ---
    { french: "embaucher", english: "hire", distractors: ["fire", "retire", "rent"] },
    { french: "licencier", english: "fire", distractors: ["hire", "freeze", "retire"] },
    { french: "démissionner", english: "quit", distractors: ["hire", "fire", "stay"] },
    { french: "salaire (horaire / hebdo)", english: "wage", distractors: ["salary", "bonus", "wealth"] },
    { french: "salaire (mensuel / annuel)", english: "salary", distractors: ["wage", "bonus", "wealth"] },
    { french: "date limite", english: "deadline", distractors: ["lifeline", "border", "schedule"] },
    { french: "réunion", english: "meeting", distractors: ["reunion", "greeting", "holiday"] },
    { french: "PDG", english: "CEO", distractors: ["boss", "manager", "chief"] },
    { french: "siège social", english: "headquarters", distractors: ["warehouse", "branch", "factory"] },
    { french: "chiffre d'affaires", english: "turnover", distractors: ["profit", "invoice", "salary"] },
    { french: "bénéfice", english: "profit", distractors: ["loss", "turnover", "salary"] },
    { french: "concurrent", english: "competitor", distractors: ["contestant", "customer", "colleague"] },
    { french: "fournisseur", english: "supplier", distractors: ["customer", "employee", "retailer"] },
    { french: "facture", english: "invoice", distractors: ["receipt", "salary", "notice"] },
    { french: "reçu", english: "receipt", distractors: ["recipe", "invoice", "schedule"] },
    { french: "stagiaire", english: "intern", distractors: ["manager", "customer", "teacher"] },
    { french: "stage", english: "internship", distractors: ["meeting", "course", "salary"] },
    { french: "augmentation", english: "raise", distractors: ["fall", "delay", "reward"] },
    { french: "entrepôt", english: "warehouse", distractors: ["office", "folder", "boardroom"] },
    { french: "remboursement", english: "refund", distractors: ["reward", "report", "result"] },

    // --- 3. EMOTIONS & PERSONALITY ---
    { french: "têtu", english: "stubborn", distractors: ["shy", "polite", "lucky"] },
    { french: "timide", english: "shy", distractors: ["proud", "brave", "noisy"] },
    { french: "fier", english: "proud", distractors: ["afraid", "ashamed", "noisy"] },
    { french: "déçu", english: "disappointed", distractors: ["delighted", "confident", "curious"] },
    { french: "accablé / débordé", english: "overwhelmed", distractors: ["relaxed", "steady", "bored"] },
    { french: "soulagé", english: "relieved", distractors: ["worried", "trapped", "confused"] },
    { french: "épuisé", english: "exhausted", distractors: ["bored", "hungry", "cheerful"] },
    { french: "gêné", english: "embarrassed", distractors: ["confident", "noisy", "relaxed"] },
    { french: "honteux", english: "ashamed", distractors: ["jealous", "proud", "calm"] },
    { french: "jaloux", english: "jealous", distractors: ["zealous", "yellow", "proud"] },
    { french: "anxieux", english: "anxious", distractors: ["angry", "careful", "cheerful"] },
    { french: "reconnaissant", english: "grateful", distractors: ["greedy", "awful", "stubborn"] },
    { french: "égoïste", english: "selfish", distractors: ["shellfish", "generous", "patient"] },
    { french: "sensible", english: "sensitive", distractors: ["sensible", "logical", "tough"] },
    { french: "raisonnable", english: "sensible", distractors: ["sensitive", "fragile", "random"] },
    { french: "maladroit", english: "clumsy", distractors: ["steady", "clever", "calm"] },
    { french: "bavard", english: "talkative", distractors: ["silent", "lazy", "hungry"] },
    { french: "radin", english: "stingy", distractors: ["generous", "cheerful", "patient"] },
    { french: "généreux", english: "generous", distractors: ["stingy", "jealous", "narrow"] },
    { french: "honnête", english: "honest", distractors: ["false", "noisy", "tricky"] },
    { french: "courageux", english: "brave", distractors: ["afraid", "weak", "quiet"] },
    { french: "grossier", english: "rude", distractors: ["kind", "calm", "young"] },

    // --- 4. FALSE FRIENDS, CONNECTORS & ABSTRACT WORDS ---
    { french: "liberté", english: "freedom", distractors: ["rule", "prison", "order"] },
    { french: "connaissance", english: "knowledge", distractors: ["question", "strength", "hunger"] },
    { french: "sagesse", english: "wisdom", distractors: ["anger", "freedom", "kingdom"] },
    { french: "comportement", english: "behavior", distractors: ["gesture", "bedroom", "silence"] },
    { french: "moyenne", english: "average", distractors: ["peak", "total", "edge"] },
    { french: "presque", english: "almost", distractors: ["already", "alone", "always"] },
    { french: "sauf", english: "except", distractors: ["accept", "expect", "exit"] },
    { french: "à moins que", english: "unless", distractors: ["until", "inside", "before"] },
    { french: "au lieu de", english: "instead of", distractors: ["because of", "in front of", "inside"] },
    { french: "pourtant", english: "however", distractors: ["therefore", "besides", "meanwhile"] },
    { french: "d'ailleurs", english: "besides", distractors: ["beside", "inside", "outside"] },
    { french: "par conséquent", english: "therefore", distractors: ["however", "besides", "earlier"] },
    { french: "en fait", english: "actually", distractors: ["currently", "carefully", "yearly"] },
    { french: "actuellement", english: "currently", distractors: ["actually", "quietly", "rarely"] },
    { french: "habitude", english: "habit", distractors: ["hobby", "hurry", "hallway"] },
    { french: "choix", english: "choice", distractors: ["voice", "chance", "change"] },
    { french: "erreur", english: "mistake", distractors: ["mark", "stake", "medal"] },
    { french: "indice", english: "clue", distractors: ["club", "cloud", "class"] },
    { french: "lecture", english: "reading", distractors: ["lecture", "speech", "conference"] },
    { french: "location", english: "rental", distractors: ["location", "address", "position"] },
    { french: "assister à", english: "attend", distractors: ["assist", "help", "support"] },
    { french: "éventuellement", english: "maybe", distractors: ["eventually", "certainly", "rarely"] },
    { french: "déception", english: "disappointment", distractors: ["deception", "decision", "discussion"] },
    { french: "librairie", english: "bookshop", distractors: ["library", "office", "shelf"] },
    { french: "bibliothèque", english: "library", distractors: ["bookshop", "wardrobe", "warehouse"] },
    { french: "journée", english: "day", distractors: ["journey", "trip", "week"] },
    { french: "voyage", english: "journey", distractors: ["day", "holiday", "office"] },
    { french: "sympathique", english: "nice", distractors: ["sympathetic", "rude", "noisy"] },
    { french: "compatissant", english: "sympathetic", distractors: ["nice", "stubborn", "noisy"] },
    { french: "monnaie", english: "change", distractors: ["money", "cash", "note"] },
    { french: "argent", english: "money", distractors: ["silver", "gold", "change"] },
    { french: "préservatif", english: "condom", distractors: ["preservative", "medicine", "bandage"] },
    { french: "conservateur (alimentaire)", english: "preservative", distractors: ["condom", "keeper", "shelf"] },
    { french: "formidable", english: "great", distractors: ["formidable", "terrible", "weak"] },
    { french: "redoutable", english: "formidable", distractors: ["great", "friendly", "useless"] },
    { french: "pain", english: "bread", distractors: ["pain", "food", "fear"] },
    { french: "douleur", english: "pain", distractors: ["bread", "joy", "trust"] },

    // --- 5. EVERYDAY VERBS & OBJECTS ---
    { french: "rechercher", english: "seek", distractors: ["hide", "borrow", "deny"] },
    { french: "cacher", english: "hide", distractors: ["show", "lend", "seek"] },
    { french: "geler", english: "freeze", distractors: ["melt", "boil", "burn"] },
    { french: "secouer", english: "shake", distractors: ["share", "break", "smile"] },
    { french: "couler", english: "sink", distractors: ["float", "swim", "rest"] },
    { french: "briller", english: "shine", distractors: ["shade", "clean", "smile"] },
    { french: "tirer (avec une arme)", english: "shoot", distractors: ["hide", "throw", "guard"] },
    { french: "fermer à clé", english: "lock", distractors: ["open", "leave", "fold"] },
    { french: "voler (dérober)", english: "steal", distractors: ["sail", "borrow", "protect"] },
    { french: "jurer", english: "swear", distractors: ["smile", "whisper", "laugh"] },
    { french: "déchirer", english: "tear", distractors: ["fix", "fold", "glue"] },
    { french: "porter (vêtement)", english: "wear", distractors: ["carry", "wash", "borrow"] },
    { french: "gagner (une compétition)", english: "win", distractors: ["lose", "earn", "borrow"] },
    { french: "gagner (de l'argent)", english: "earn", distractors: ["spend", "win", "lose"] },
    { french: "dépenser", english: "spend", distractors: ["save", "lend", "gather"] },
    { french: "prêter", english: "lend", distractors: ["borrow", "send", "keep"] },
    { french: "emprunter", english: "borrow", distractors: ["lend", "bring", "own"] },
    { french: "enseigner", english: "teach", distractors: ["learn", "copy", "watch"] },
    { french: "mordre", english: "bite", distractors: ["lick", "boil", "fold"] },
    { french: "souffler", english: "blow", distractors: ["glow", "borrow", "throw"] },
    { french: "oreiller", english: "pillow", distractors: ["blanket", "ceiling", "bucket"] },
    { french: "couverture", english: "blanket", distractors: ["pillow", "handle", "ceiling"] },
    { french: "seau", english: "bucket", distractors: ["bottle", "ladder", "candle"] },
    { french: "balai", english: "broom", distractors: ["hammer", "bucket", "blanket"] },
    { french: "allumette", english: "match", distractors: ["candle", "rope", "ladder"] },
    { french: "bougie", english: "candle", distractors: ["candy", "handle", "ladder"] },
    { french: "voisin", english: "neighbor", distractors: ["stranger", "teacher", "baker"] },
    { french: "colère", english: "anger", distractors: ["hunger", "laughter", "fear"] },
    { french: "faim", english: "hunger", distractors: ["anger", "rest", "pride"] },
    { french: "soif", english: "thirst", distractors: ["hunger", "sleep", "wealth"] },
    { french: "mensonge", english: "lie", distractors: ["line", "law", "trust"] },
    { french: "vérité", english: "truth", distractors: ["trust", "youth", "lie"] },
    { french: "bruit", english: "noise", distractors: ["voice", "note", "smile"] },
    { french: "plafond", english: "ceiling", distractors: ["floor", "door", "bucket"] },
    { french: "sol", english: "floor", distractors: ["ceiling", "roof", "candle"] },
    { french: "poignée", english: "handle", distractors: ["candle", "pocket", "ladder"] },
    { french: "échelle", english: "ladder", distractors: ["scale", "rope", "handle"] },
    { french: "corde", english: "rope", distractors: ["road", "soap", "coat"] },
    { french: "marteau", english: "hammer", distractors: ["hanger", "ladder", "bucket"] },
    { french: "clou", english: "nail", distractors: ["rope", "wood", "glass"] },
    { french: "savon", english: "soap", distractors: ["soup", "rope", "sale"] },
    { french: "couteau", english: "knife", distractors: ["fork", "bucket", "spoon"] },
    { french: "cuillère", english: "spoon", distractors: ["fork", "knife", "plate"] },
    { french: "fourchette", english: "fork", distractors: ["spoon", "knife", "plate"] },
    { french: "chaussettes", english: "socks", distractors: ["gloves", "shoes", "sleeves"] },
];
