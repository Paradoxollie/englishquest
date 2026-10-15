/**
 * Flash Translation - Core Game Logic
 *
 * A reaction speed game where players must quickly select the correct
 * English translation of French words. A test of speed and vocabulary.
 *
 * Game Flow:
 * 0. Pick 10 words: about 70 % at the player's level, 30 % one level below
 * 1. Show French word with random wait time (2000-4000ms)
 * 2. Show 4 English choices (1 correct + 3 distractors)
 * 3. Measure reaction time from when choices appear
 * 4. Apply +5000ms penalty for wrong answers
 * 5. Final score = total time (lower is better)
 */

import { pickByLevel, type GameLevel } from "./levels";

export interface WordPair {
    french: string;
    english: string;
    distractors: string[]; // Pre-defined wrong answers
    /** 1 = A1 (chapitre 1) ... 5 = C1 (chapitre 5). */
    level: GameLevel;
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
    /** Niveau du joueur : les mots viennent surtout de ce niveau, le reste du niveau inférieur. */
    level?: GameLevel;
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

function normalizeChoice(value: string): string {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
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
    const correctAnswer = normalizeChoice(wordPair.english);
    const available: string[] = [];

    for (const distractor of wordPair.distractors) {
        const normalized = normalizeChoice(distractor);
        if (normalized && normalized !== correctAnswer && !available.some(item => normalizeChoice(item) === normalized)) {
            available.push(distractor);
        }
    }

    // If we need more distractors, take from other words
    // FILTER: Don't pick words that are synonyms or the correct answer
    // For safety, we only pick English words that are NOT the correct answer
    if (available.length < 3) {
        const otherWords = allWords
            .filter(w => normalizeChoice(w.english) !== correctAnswer)
            .map(w => w.english);
        for (const otherWord of otherWords) {
            const normalized = normalizeChoice(otherWord);
            if (!available.some(item => normalizeChoice(item) === normalized)) {
                available.push(otherWord);
            }
        }
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

    // Select random words for the game (by level when one is given)
    const selectedWords = config.level
        ? pickByLevel(words, config.level, config.totalRounds, rng)
        : shuffle([...words], rng).slice(0, config.totalRounds);

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
    if (state.started) return state;
    return {
        ...state,
        started: true,
        phase: state.rounds.length > 0 ? "waiting" : "ended",
    };
}

/**
 * Start showing choices (called after wait time)
 */
export function startAnswering(state: GameState, nowMs: number): GameState {
    if (!state.started || state.phase !== "waiting" || !Number.isFinite(nowMs)) return state;

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
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentRound.choices.length || !Number.isFinite(nowMs)) return state;

    const isCorrect = choiceIndex === currentRound.correctIndex;
    const reactionTimeMs = Math.max(0, nowMs - currentRound.startTimeMs);
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
 *
 * Un mot français = une seule bonne réponse anglaise. Les trois distracteurs
 * sont plausibles (faux amis, mots voisins) mais jamais une traduction
 * acceptable ; une précision entre parenthèses lève les ambiguïtés.
 * Niveaux : 1 = A1, 2 = A2, 3 = B1, 4 = B2, 5 = C1 (chapitres 1 à 5).
 * Anglais britannique (behaviour, neighbour, rubber, trousers).
 */
export const VOCABULARY: WordPair[] = [
    // --- NIVEAU 1 (A1) : école, famille, nourriture, maison, corps, vêtements, temps, loisirs ---
    { french: "cahier", english: "notebook", distractors: ["pencil case", "schoolbag", "ruler"], level: 1 },
    { french: "crayon à papier", english: "pencil", distractors: ["pen", "rubber", "ruler"], level: 1 },
    { french: "gomme", english: "rubber", distractors: ["ruler", "glue", "scissors"], level: 1 },
    { french: "règle (pour tracer)", english: "ruler", distractors: ["rubber", "glue", "scissors"], level: 1 },
    { french: "cartable", english: "schoolbag", distractors: ["pencil case", "notebook", "lunchbox"], level: 1 },
    { french: "trousse", english: "pencil case", distractors: ["schoolbag", "notebook", "ruler"], level: 1 },
    { french: "ciseaux", english: "scissors", distractors: ["glue", "ruler", "rubber"], level: 1 },
    { french: "devoirs (à la maison)", english: "homework", distractors: ["housework", "lesson", "break"], level: 1 },
    { french: "professeur", english: "teacher", distractors: ["student", "headteacher", "doctor"], level: 1 },
    { french: "frère", english: "brother", distractors: ["sister", "cousin", "uncle"], level: 1 },
    { french: "sœur", english: "sister", distractors: ["brother", "aunt", "daughter"], level: 1 },
    { french: "grand-mère", english: "grandmother", distractors: ["grandfather", "aunt", "mother"], level: 1 },
    { french: "oncle", english: "uncle", distractors: ["aunt", "cousin", "nephew"], level: 1 },
    { french: "tante", english: "aunt", distractors: ["uncle", "niece", "sister"], level: 1 },
    { french: "fils", english: "son", distractors: ["daughter", "nephew", "husband"], level: 1 },
    { french: "fille (enfant de ses parents)", english: "daughter", distractors: ["son", "niece", "wife"], level: 1 },
    { french: "pomme", english: "apple", distractors: ["pear", "peach", "plum"], level: 1 },
    { french: "pain", english: "bread", distractors: ["pain", "butter", "cake"], level: 1 },
    { french: "fromage", english: "cheese", distractors: ["butter", "bread", "milk"], level: 1 },
    { french: "lait", english: "milk", distractors: ["water", "juice", "tea"], level: 1 },
    { french: "œuf", english: "egg", distractors: ["ham", "rice", "bread"], level: 1 },
    { french: "poisson", english: "fish", distractors: ["poison", "chicken", "meat"], level: 1 },
    { french: "fraise", english: "strawberry", distractors: ["raspberry", "cherry", "blueberry"], level: 1 },
    { french: "petit-déjeuner", english: "breakfast", distractors: ["lunch", "dinner", "snack"], level: 1 },
    { french: "déjeuner (repas de midi)", english: "lunch", distractors: ["breakfast", "dinner", "dessert"], level: 1 },
    { french: "dîner (repas du soir)", english: "dinner", distractors: ["lunch", "breakfast", "snack"], level: 1 },
    { french: "couteau", english: "knife", distractors: ["fork", "spoon", "plate"], level: 1 },
    { french: "cuillère", english: "spoon", distractors: ["fork", "knife", "plate"], level: 1 },
    { french: "fourchette", english: "fork", distractors: ["spoon", "knife", "plate"], level: 1 },
    { french: "cuisine (pièce)", english: "kitchen", distractors: ["bathroom", "bedroom", "garden"], level: 1 },
    { french: "chambre", english: "bedroom", distractors: ["bathroom", "living room", "kitchen"], level: 1 },
    { french: "salle de bains", english: "bathroom", distractors: ["bedroom", "kitchen", "garage"], level: 1 },
    { french: "fenêtre", english: "window", distractors: ["door", "wall", "roof"], level: 1 },
    { french: "lit", english: "bed", distractors: ["bath", "chair", "sofa"], level: 1 },
    { french: "chaise", english: "chair", distractors: ["table", "bed", "shelf"], level: 1 },
    { french: "tête", english: "head", distractors: ["hair", "face", "neck"], level: 1 },
    { french: "main", english: "hand", distractors: ["arm", "foot", "finger"], level: 1 },
    { french: "pied", english: "foot", distractors: ["leg", "hand", "knee"], level: 1 },
    { french: "jambe", english: "leg", distractors: ["arm", "foot", "back"], level: 1 },
    { french: "bouche", english: "mouth", distractors: ["nose", "ear", "eye"], level: 1 },
    { french: "dent", english: "tooth", distractors: ["tongue", "lip", "chin"], level: 1 },
    { french: "pantalon", english: "trousers", distractors: ["shorts", "skirt", "tights"], level: 1 },
    { french: "jupe", english: "skirt", distractors: ["dress", "shirt", "trousers"], level: 1 },
    { french: "chapeau", english: "hat", distractors: ["cap", "scarf", "hood"], level: 1 },
    { french: "écharpe", english: "scarf", distractors: ["hat", "gloves", "belt"], level: 1 },
    { french: "chaussettes", english: "socks", distractors: ["gloves", "shoes", "sleeves"], level: 1 },
    { french: "pluie", english: "rain", distractors: ["snow", "wind", "cloud"], level: 1 },
    { french: "neige", english: "snow", distractors: ["rain", "ice", "fog"], level: 1 },
    { french: "soleil", english: "sun", distractors: ["moon", "star", "sky"], level: 1 },
    { french: "nuage", english: "cloud", distractors: ["rain", "sky", "storm"], level: 1 },
    { french: "aujourd'hui", english: "today", distractors: ["tomorrow", "yesterday", "tonight"], level: 1 },
    { french: "demain", english: "tomorrow", distractors: ["today", "yesterday", "morning"], level: 1 },
    { french: "hier", english: "yesterday", distractors: ["today", "tomorrow", "later"], level: 1 },
    { french: "semaine", english: "week", distractors: ["weekend", "month", "day"], level: 1 },
    { french: "matin", english: "morning", distractors: ["evening", "afternoon", "night"], level: 1 },
    { french: "vacances", english: "holidays", distractors: ["weekend", "journey", "trip"], level: 1 },
    { french: "nager", english: "swim", distractors: ["run", "jump", "climb"], level: 1 },
    { french: "chanter", english: "sing", distractors: ["dance", "shout", "speak"], level: 1 },
    { french: "dessiner", english: "draw", distractors: ["paint", "write", "cut"], level: 1 },
    { french: "manger", english: "eat", distractors: ["drink", "cook", "sleep"], level: 1 },
    { french: "dormir", english: "sleep", distractors: ["wake up", "rest", "dream"], level: 1 },
    { french: "acheter", english: "buy", distractors: ["sell", "pay", "spend"], level: 1 },
    { french: "attendre", english: "wait", distractors: ["attend", "watch", "stay"], level: 1 },
    { french: "trouver", english: "find", distractors: ["lose", "keep", "fill"], level: 1 },
    { french: "voyager", english: "travel", distractors: ["drive", "work", "move"], level: 1 },
    { french: "chien", english: "dog", distractors: ["cat", "horse", "rabbit"], level: 1 },
    { french: "oiseau", english: "bird", distractors: ["fish", "bee", "frog"], level: 1 },
    { french: "cheval", english: "horse", distractors: ["cow", "sheep", "donkey"], level: 1 },
    { french: "jaune", english: "yellow", distractors: ["green", "orange", "brown"], level: 1 },
    { french: "heureux", english: "happy", distractors: ["sad", "angry", "tired"], level: 1 },
    { french: "triste", english: "sad", distractors: ["happy", "bored", "angry"], level: 1 },
    { french: "en colère", english: "angry", distractors: ["hungry", "anxious", "lonely"], level: 1 },
    { french: "froid", english: "cold", distractors: ["hot", "warm", "dry"], level: 1 },
    { french: "facile", english: "easy", distractors: ["hard", "boring", "slow"], level: 1 },
    { french: "drôle", english: "funny", distractors: ["boring", "serious", "sunny"], level: 1 },
    { french: "voiture", english: "car", distractors: ["bus", "bike", "train"], level: 1 },
    { french: "plage", english: "beach", distractors: ["sea", "sand", "coast"], level: 1 },
    { french: "magasin", english: "shop", distractors: ["magazine", "market", "mall"], level: 1 },
    { french: "ordinateur", english: "computer", distractors: ["calculator", "keyboard", "screen"], level: 1 },
    { french: "argent (pour payer)", english: "money", distractors: ["silver", "gold", "change"], level: 1 },

    // --- NIVEAU 2 (A2) : quotidien, sentiments simples, verbes courants, premiers faux amis ---
    { french: "chercher", english: "look for", distractors: ["look after", "wait for", "avoid"], level: 2 },
    { french: "éteindre", english: "turn off", distractors: ["turn on", "turn up", "close"], level: 2 },
    { french: "enlever (un vêtement)", english: "take off", distractors: ["put on", "take out", "throw away"], level: 2 },
    { french: "mettre (un vêtement)", english: "put on", distractors: ["take off", "put away", "wear out"], level: 2 },
    { french: "grandir", english: "grow up", distractors: ["grow out", "wake up", "settle down"], level: 2 },
    { french: "oreiller", english: "pillow", distractors: ["blanket", "ceiling", "bucket"], level: 2 },
    { french: "couverture (de lit)", english: "blanket", distractors: ["pillow", "handle", "ceiling"], level: 2 },
    { french: "bougie", english: "candle", distractors: ["candy", "handle", "ladder"], level: 2 },
    { french: "voisin", english: "neighbour", distractors: ["stranger", "teacher", "baker"], level: 2 },
    { french: "mensonge", english: "lie", distractors: ["line", "law", "trust"], level: 2 },
    { french: "vérité", english: "truth", distractors: ["trust", "youth", "lie"], level: 2 },
    { french: "bruit", english: "noise", distractors: ["voice", "note", "smile"], level: 2 },
    { french: "sol (d'une pièce)", english: "floor", distractors: ["ceiling", "roof", "candle"], level: 2 },
    { french: "savon", english: "soap", distractors: ["soup", "rope", "sale"], level: 2 },
    { french: "cacher", english: "hide", distractors: ["show", "lend", "seek"], level: 2 },
    { french: "fermer à clé", english: "lock", distractors: ["open", "leave", "fold"], level: 2 },
    { french: "porter (un vêtement)", english: "wear", distractors: ["carry", "wash", "borrow"], level: 2 },
    { french: "gagner (une compétition)", english: "win", distractors: ["lose", "earn", "borrow"], level: 2 },
    { french: "dépenser", english: "spend", distractors: ["save", "lend", "gather"], level: 2 },
    { french: "enseigner", english: "teach", distractors: ["learn", "copy", "watch"], level: 2 },
    { french: "timide", english: "shy", distractors: ["proud", "brave", "noisy"], level: 2 },
    { french: "honnête", english: "honest", distractors: ["false", "noisy", "tricky"], level: 2 },
    { french: "courageux", english: "brave", distractors: ["afraid", "weak", "quiet"], level: 2 },
    { french: "presque", english: "almost", distractors: ["already", "alone", "always"], level: 2 },
    { french: "choix", english: "choice", distractors: ["voice", "chance", "change"], level: 2 },
    { french: "erreur", english: "mistake", distractors: ["mark", "stake", "medal"], level: 2 },
    { french: "librairie", english: "bookshop", distractors: ["library", "office", "shelf"], level: 2 },
    { french: "bibliothèque", english: "library", distractors: ["bookshop", "wardrobe", "warehouse"], level: 2 },
    { french: "journée", english: "day", distractors: ["journey", "trip", "week"], level: 2 },
    { french: "sympathique", english: "nice", distractors: ["sympathetic", "rude", "noisy"], level: 2 },
    { french: "raisin", english: "grapes", distractors: ["raisins", "plums", "cherries"], level: 2 },
    { french: "coin (de la rue)", english: "corner", distractors: ["coin", "edge", "side"], level: 2 },
    { french: "affiche", english: "poster", distractors: ["post", "postcard", "board"], level: 2 },
    { french: "sale (pas propre)", english: "dirty", distractors: ["sale", "salty", "clean"], level: 2 },
    { french: "propre (pas sale)", english: "clean", distractors: ["own", "clear", "dirty"], level: 2 },
    { french: "rester", english: "stay", distractors: ["rest", "leave", "stand"], level: 2 },
    { french: "blesser", english: "hurt", distractors: ["bless", "heal", "help"], level: 2 },
    { french: "anniversaire (de naissance)", english: "birthday", distractors: ["anniversary", "party", "holiday"], level: 2 },
    { french: "passe-temps", english: "hobby", distractors: ["habit", "holiday", "lobby"], level: 2 },
    { french: "gentil", english: "kind", distractors: ["rude", "kid", "mean"], level: 2 },
    { french: "inquiet", english: "worried", distractors: ["quiet", "angry", "proud"], level: 2 },
    { french: "ennuyeux", english: "boring", distractors: ["bored", "noisy", "lazy"], level: 2 },
    { french: "paresseux", english: "lazy", distractors: ["crazy", "busy", "easy"], level: 2 },
    { french: "occupé", english: "busy", distractors: ["lazy", "free", "bossy"], level: 2 },
    { french: "demander", english: "ask", distractors: ["demand", "answer", "tell"], level: 2 },
    { french: "se souvenir de", english: "remember", distractors: ["remind", "forget", "record"], level: 2 },
    { french: "oublier", english: "forget", distractors: ["forgive", "lose", "remember"], level: 2 },
    { french: "perdre", english: "lose", distractors: ["loose", "win", "find"], level: 2 },
    { french: "rater (le bus)", english: "miss", distractors: ["lose", "fail", "catch"], level: 2 },
    { french: "envoyer", english: "send", distractors: ["spend", "lend", "bend"], level: 2 },
    { french: "ranger (sa chambre)", english: "tidy", distractors: ["range", "mess", "hide"], level: 2 },
    { french: "célèbre", english: "famous", distractors: ["furious", "friendly", "generous"], level: 2 },

    // --- NIVEAU 3 (B1) : verbes à particule courants, sentiments, faux amis, mots abstraits ---
    { french: "abandonner", english: "give up", distractors: ["give back", "give out", "give away"], level: 3 },
    { french: "s'occuper de", english: "look after", distractors: ["look for", "look at", "look out"], level: 3 },
    { french: "découvrir", english: "find out", distractors: ["look for", "hide", "ignore"], level: 3 },
    { french: "réunion", english: "meeting", distractors: ["reunion", "greeting", "holiday"], level: 3 },
    { french: "fier", english: "proud", distractors: ["afraid", "ashamed", "noisy"], level: 3 },
    { french: "déçu", english: "disappointed", distractors: ["delighted", "confident", "curious"], level: 3 },
    { french: "épuisé", english: "exhausted", distractors: ["bored", "hungry", "cheerful"], level: 3 },
    { french: "gêné", english: "embarrassed", distractors: ["confident", "noisy", "relaxed"], level: 3 },
    { french: "jaloux", english: "jealous", distractors: ["zealous", "yellow", "proud"], level: 3 },
    { french: "égoïste", english: "selfish", distractors: ["shellfish", "generous", "patient"], level: 3 },
    { french: "sensible", english: "sensitive", distractors: ["sensible", "logical", "tough"], level: 3 },
    { french: "bavard", english: "talkative", distractors: ["silent", "lazy", "hungry"], level: 3 },
    { french: "généreux", english: "generous", distractors: ["stingy", "jealous", "narrow"], level: 3 },
    { french: "grossier", english: "rude", distractors: ["kind", "calm", "young"], level: 3 },
    { french: "liberté", english: "freedom", distractors: ["rule", "prison", "order"], level: 3 },
    { french: "connaissance (savoir)", english: "knowledge", distractors: ["question", "strength", "hunger"], level: 3 },
    { french: "comportement", english: "behaviour", distractors: ["gesture", "bedroom", "silence"], level: 3 },
    { french: "moyenne", english: "average", distractors: ["peak", "total", "edge"], level: 3 },
    { french: "sauf", english: "except", distractors: ["accept", "expect", "exit"], level: 3 },
    { french: "au lieu de", english: "instead of", distractors: ["because of", "in front of", "inside"], level: 3 },
    { french: "pourtant", english: "however", distractors: ["therefore", "besides", "meanwhile"], level: 3 },
    { french: "en fait", english: "actually", distractors: ["currently", "carefully", "yearly"], level: 3 },
    { french: "habitude", english: "habit", distractors: ["hobby", "hurry", "hallway"], level: 3 },
    { french: "indice", english: "clue", distractors: ["club", "cloud", "class"], level: 3 },
    { french: "lecture", english: "reading", distractors: ["lecture", "speech", "conference"], level: 3 },
    { french: "voyage", english: "journey", distractors: ["day", "holiday", "office"], level: 3 },
    { french: "monnaie (pièces rendues)", english: "change", distractors: ["money", "cash", "note"], level: 3 },
    { french: "formidable", english: "great", distractors: ["formidable", "terrible", "weak"], level: 3 },
    { french: "douleur", english: "pain", distractors: ["bread", "joy", "trust"], level: 3 },
    { french: "colère", english: "anger", distractors: ["hunger", "laughter", "fear"], level: 3 },
    { french: "faim", english: "hunger", distractors: ["anger", "rest", "pride"], level: 3 },
    { french: "soif", english: "thirst", distractors: ["hunger", "sleep", "wealth"], level: 3 },
    { french: "seau", english: "bucket", distractors: ["bottle", "ladder", "candle"], level: 3 },
    { french: "balai", english: "broom", distractors: ["hammer", "bucket", "blanket"], level: 3 },
    { french: "allumette", english: "match", distractors: ["candle", "rope", "ladder"], level: 3 },
    { french: "plafond", english: "ceiling", distractors: ["floor", "door", "bucket"], level: 3 },
    { french: "poignée (de porte)", english: "handle", distractors: ["candle", "pocket", "ladder"], level: 3 },
    { french: "échelle (pour grimper)", english: "ladder", distractors: ["scale", "rope", "handle"], level: 3 },
    { french: "corde", english: "rope", distractors: ["road", "soap", "coat"], level: 3 },
    { french: "marteau", english: "hammer", distractors: ["hanger", "ladder", "bucket"], level: 3 },
    { french: "clou", english: "nail", distractors: ["rope", "wood", "glass"], level: 3 },
    { french: "geler", english: "freeze", distractors: ["melt", "boil", "burn"], level: 3 },
    { french: "secouer", english: "shake", distractors: ["share", "break", "smile"], level: 3 },
    { french: "couler (un bateau)", english: "sink", distractors: ["float", "swim", "rest"], level: 3 },
    { french: "briller", english: "shine", distractors: ["shade", "clean", "smile"], level: 3 },
    { french: "tirer (au but)", english: "shoot", distractors: ["hide", "throw", "guard"], level: 3 },
    { french: "voler (dérober)", english: "steal", distractors: ["sail", "borrow", "protect"], level: 3 },
    { french: "gagner (de l'argent)", english: "earn", distractors: ["spend", "win", "lose"], level: 3 },
    { french: "prêter", english: "lend", distractors: ["borrow", "send", "keep"], level: 3 },
    { french: "emprunter", english: "borrow", distractors: ["lend", "bring", "own"], level: 3 },
    { french: "mordre", english: "bite", distractors: ["lick", "boil", "fold"], level: 3 },
    { french: "souffler", english: "blow", distractors: ["glow", "borrow", "throw"], level: 3 },
    { french: "chômage", english: "unemployment", distractors: ["employment", "employee", "retirement"], level: 3 },
    { french: "se rendre compte", english: "realise", distractors: ["render", "count", "achieve"], level: 3 },
    { french: "contrôler (vérifier)", english: "check", distractors: ["control", "charge", "change"], level: 3 },
    { french: "déménager", english: "move house", distractors: ["remove", "manage", "settle"], level: 3 },

    // --- NIVEAU 4 (B2) : verbes à particule, monde du travail, nuances, connecteurs ---
    { french: "continuer", english: "carry on", distractors: ["carry out", "slow down", "put off"], level: 4 },
    { french: "rejeter / refuser", english: "turn down", distractors: ["turn up", "turn off", "accept"], level: 4 },
    { french: "bien s'entendre", english: "get along", distractors: ["get over", "break down", "fit in"], level: 4 },
    { french: "se remettre (d'une maladie)", english: "get over", distractors: ["give up", "get along", "fall ill"], level: 4 },
    { french: "remettre à plus tard", english: "put off", distractors: ["put on", "carry on", "call off"], level: 4 },
    { french: "tomber en panne", english: "break down", distractors: ["break up", "turn off", "speed up"], level: 4 },
    { french: "rompre (une relation)", english: "break up", distractors: ["break down", "make up", "turn up"], level: 4 },
    { french: "élever (un enfant)", english: "bring up", distractors: ["bring in", "take over", "hold back"], level: 4 },
    { french: "attendre (au téléphone)", english: "hold on", distractors: ["hang up", "hang out", "go away"], level: 4 },
    { french: "embaucher", english: "hire", distractors: ["fire", "retire", "rent"], level: 4 },
    { french: "licencier", english: "fire", distractors: ["hire", "freeze", "retire"], level: 4 },
    { french: "démissionner", english: "quit", distractors: ["hire", "fire", "stay"], level: 4 },
    { french: "salaire (mensuel ou annuel)", english: "salary", distractors: ["wage", "bonus", "wealth"], level: 4 },
    { french: "date limite", english: "deadline", distractors: ["lifeline", "border", "schedule"], level: 4 },
    { french: "bénéfice", english: "profit", distractors: ["loss", "turnover", "salary"], level: 4 },
    { french: "reçu (de caisse)", english: "receipt", distractors: ["recipe", "invoice", "schedule"], level: 4 },
    { french: "stagiaire", english: "intern", distractors: ["manager", "customer", "teacher"], level: 4 },
    { french: "stage (en entreprise)", english: "internship", distractors: ["meeting", "interview", "salary"], level: 4 },
    { french: "remboursement", english: "refund", distractors: ["reward", "report", "result"], level: 4 },
    { french: "têtu", english: "stubborn", distractors: ["shy", "polite", "lucky"], level: 4 },
    { french: "soulagé", english: "relieved", distractors: ["worried", "trapped", "confused"], level: 4 },
    { french: "honteux", english: "ashamed", distractors: ["jealous", "proud", "calm"], level: 4 },
    { french: "anxieux", english: "anxious", distractors: ["angry", "careful", "cheerful"], level: 4 },
    { french: "reconnaissant", english: "grateful", distractors: ["greedy", "awful", "stubborn"], level: 4 },
    { french: "raisonnable", english: "sensible", distractors: ["sensitive", "fragile", "random"], level: 4 },
    { french: "maladroit", english: "clumsy", distractors: ["steady", "clever", "calm"], level: 4 },
    { french: "sagesse", english: "wisdom", distractors: ["anger", "freedom", "kingdom"], level: 4 },
    { french: "à moins que", english: "unless", distractors: ["until", "inside", "before"], level: 4 },
    { french: "d'ailleurs", english: "besides", distractors: ["beside", "inside", "outside"], level: 4 },
    { french: "par conséquent", english: "therefore", distractors: ["however", "besides", "earlier"], level: 4 },
    { french: "actuellement", english: "currently", distractors: ["actually", "quietly", "rarely"], level: 4 },
    { french: "location (d'un logement)", english: "rental", distractors: ["location", "address", "position"], level: 4 },
    { french: "assister à (un cours)", english: "attend", distractors: ["assist", "help", "support"], level: 4 },
    { french: "éventuellement", english: "possibly", distractors: ["eventually", "certainly", "rarely"], level: 4 },
    { french: "déception", english: "disappointment", distractors: ["deception", "decision", "discussion"], level: 4 },
    { french: "jurer", english: "swear", distractors: ["smile", "whisper", "laugh"], level: 4 },
    { french: "déchirer", english: "tear", distractors: ["fix", "fold", "glue"], level: 4 },
    { french: "rechercher", english: "seek", distractors: ["hide", "borrow", "deny"], level: 4 },
    { french: "fiable", english: "reliable", distractors: ["reliant", "liable", "available"], level: 4 },
    { french: "sensibiliser (le public)", english: "raise awareness", distractors: ["raise funds", "raise prices", "set up"], level: 4 },
    { french: "affirmer (sans preuve)", english: "claim", distractors: ["complain", "blame", "deny"], level: 4 },
    { french: "inégalité", english: "inequality", distractors: ["iniquity", "unequal", "inability"], level: 4 },
    { french: "prise de conscience", english: "awareness", distractors: ["conscience", "warning", "wariness"], level: 4 },
    { french: "retraite (fin de carrière)", english: "retirement", distractors: ["retreat", "resignation", "redundancy"], level: 4 },
    { french: "candidature (à un emploi)", english: "application", distractors: ["appliance", "nomination", "invitation"], level: 4 },
    { french: "néanmoins", english: "nevertheless", distractors: ["meanwhile", "whereas", "otherwise"], level: 4 },
    { french: "tendance", english: "trend", distractors: ["tender", "trance", "threat"], level: 4 },
    { french: "renforcer", english: "strengthen", distractors: ["lengthen", "weaken", "threaten"], level: 4 },
    { french: "à peine", english: "hardly", distractors: ["hard", "nearly", "highly"], level: 4 },
    { french: "de plus en plus", english: "increasingly", distractors: ["incredibly", "increasing", "eventually"], level: 4 },

    // --- NIVEAU 5 (C1) : registre soutenu, monde professionnel, faux amis subtils ---
    { french: "annuler (un événement)", english: "call off", distractors: ["call on", "put on", "keep up"], level: 5 },
    { french: "prendre pour modèle", english: "look up to", distractors: ["look after", "look down on", "turn into"], level: 5 },
    { french: "prendre de haut", english: "look down on", distractors: ["look up to", "look after", "care for"], level: 5 },
    { french: "salaire (à l'heure ou à la semaine)", english: "wage", distractors: ["salary", "bonus", "wealth"], level: 5 },
    { french: "PDG", english: "CEO", distractors: ["clerk", "manager", "chief"], level: 5 },
    { french: "siège social", english: "headquarters", distractors: ["warehouse", "branch", "factory"], level: 5 },
    { french: "chiffre d'affaires", english: "turnover", distractors: ["profit", "invoice", "salary"], level: 5 },
    { french: "concurrent (entreprise rivale)", english: "competitor", distractors: ["consumer", "customer", "colleague"], level: 5 },
    { french: "fournisseur", english: "supplier", distractors: ["customer", "employee", "retailer"], level: 5 },
    { french: "facture", english: "invoice", distractors: ["receipt", "salary", "notice"], level: 5 },
    { french: "augmentation (de salaire)", english: "pay rise", distractors: ["pay cut", "delay", "reward"], level: 5 },
    { french: "entrepôt", english: "warehouse", distractors: ["office", "folder", "boardroom"], level: 5 },
    { french: "accablé / débordé", english: "overwhelmed", distractors: ["relaxed", "steady", "bored"], level: 5 },
    { french: "radin", english: "stingy", distractors: ["generous", "cheerful", "patient"], level: 5 },
    { french: "compatissant", english: "sympathetic", distractors: ["nice", "stubborn", "noisy"], level: 5 },
    { french: "conservateur (alimentaire)", english: "preservative", distractors: ["conservative", "keeper", "shelf"], level: 5 },
    { french: "redoutable", english: "formidable", distractors: ["great", "friendly", "useless"], level: 5 },
    { french: "souligner (une idée)", english: "emphasise", distractors: ["undermine", "overlook", "dismiss"], level: 5 },
    { french: "saper / affaiblir", english: "undermine", distractors: ["underline", "uphold", "enhance"], level: 5 },
    { french: "négliger (ne pas voir)", english: "overlook", distractors: ["oversee", "look over", "outlook"], level: 5 },
    { french: "atténuer", english: "mitigate", distractors: ["aggravate", "militate", "motivate"], level: 5 },
    { french: "aggraver (une situation)", english: "exacerbate", distractors: ["alleviate", "exaggerate", "exasperate"], level: 5 },
    { french: "épanouissant", english: "fulfilling", distractors: ["filling", "fruitful", "faithful"], level: 5 },
    { french: "durable (écologique)", english: "sustainable", distractors: ["durable", "suitable", "reliable"], level: 5 },
    { french: "pertinent", english: "relevant", distractors: ["reliable", "relative", "revealing"], level: 5 },
    { french: "parti pris", english: "bias", distractors: ["basis", "boast", "bond"], level: 5 },
    { french: "mettre en œuvre", english: "implement", distractors: ["implicate", "imply", "impose"], level: 5 },
    { french: "enjeu", english: "stake", distractors: ["steak", "stack", "stage"], level: 5 },
    { french: "entraver", english: "hinder", distractors: ["hint", "hinge", "help"], level: 5 },
    { french: "favoriser (encourager)", english: "foster", distractors: ["forest", "fester", "fasten"], level: 5 },
    { french: "désormais", english: "from now on", distractors: ["so far", "until now", "from then on"], level: 5 },
    { french: "tandis que (opposition)", english: "whereas", distractors: ["whereby", "wherever", "meanwhile"], level: 5 },
    { french: "d'où (par conséquent)", english: "hence", distractors: ["whence", "hereby", "henceforth"], level: 5 },
    { french: "approfondir", english: "deepen", distractors: ["widen", "dig", "darken"], level: 5 },
    { french: "remettre en question", english: "challenge", distractors: ["charge", "check", "chase"], level: 5 },
    { french: "préjugé", english: "prejudice", distractors: ["privilege", "presumption", "judgement"], level: 5 },
    { french: "souhaitable", english: "desirable", distractors: ["desired", "available", "suitable"], level: 5 },
    { french: "épuiser (des ressources)", english: "deplete", distractors: ["complete", "replete", "delete"], level: 5 },
    { french: "réticent", english: "reluctant", distractors: ["relevant", "redundant", "reliant"], level: 5 },
    { french: "minutieux", english: "thorough", distractors: ["through", "thoughtful", "though"], level: 5 },
    { french: "éventuel (possible)", english: "potential", distractors: ["eventual", "actual", "essential"], level: 5 },
];
