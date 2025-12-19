/**
 * Speed Verb Challenge - Core Game Logic
 * 
 * Pure, deterministic game logic for the Speed Verb Challenge game.
 * No DOM, no storage, no fetch. Suitable for testing with injectable RNG.
 * 
 * This module implements the core game mechanics:
 * - Verb selection and round management
 * - Answer validation
 * - Scoring and streak calculation
 * - Timer management
 */

export type Difficulty = 1 | 2 | 3;

export interface Verb {
  base: string;                 // e.g., "begin"
  pastSimple: string[];         // e.g., ["began"]
  pastParticiple: string[];     // e.g., ["begun"]
  translations: string[];       // e.g., ["commencer"]
}

export interface RequiredFields {
  pastSimple: boolean;
  pastParticiple: boolean;
  translation: boolean;
}

export interface Round {
  currentVerb: Verb;
  required: RequiredFields;
  shownAtMs: number;            // timestamp when the verb was shown (for analytics)
}

export interface GameConfig {
  totalTimeMs: number;          // e.g., 90_000
  difficulty: Difficulty;       // 1=easy, 2=medium, 3=hard
  allowImmediateRepeat?: boolean; // default: false
  rng?: () => number;           // optional PRNG (0 <= n < 1) for deterministic tests
}

export interface AnswerPayload {
  pastSimple?: string | null;
  pastParticiple?: string | null;
  translation?: string | null;
}

export interface SubmitResult {
  isCorrect: boolean;
  pointsAwarded: number;
  streakAfter: number;
  comboAfter: number;
  speedBonus?: number;
  timeBonus?: number;
  isMilestone?: boolean;
}

export interface GameState {
  config: GameConfig;
  verbs: Verb[];                // available verb pool
  remainingVerbs: Verb[];       // for selection control; can be same as verbs
  lastVerbBase?: string;        // to avoid immediate repeats if configured
  score: number;
  timeLeftMs: number;
  ended: boolean;
  streak: number;
  highestStreak: number;
  comboMultiplier: number;      // derived from streak, but stored for clarity
  roundsCompleted: number;
  currentRound?: Round;
}

function defaultRng(): number {
  return Math.random();
}

function selectRequiredFields(difficulty: Difficulty): RequiredFields {
  return {
    pastSimple: true,
    pastParticiple: difficulty >= 2,
    translation: difficulty >= 3,
  };
}

function normalize(s?: string | null): string | null {
  if (s == null) return null;
  return s.trim().toLowerCase();
}

function includesNormalized(haystack: string[], needle: string | null): boolean {
  if (needle == null) return false;
  const target = needle.trim().toLowerCase();
  return haystack.some(opt => opt.trim().toLowerCase() === target);
}

function computeCombo(streak: number): number {
  // Mirrors legacy: combo = 1 + 0.1 * streak
  return 1 + (streak * 0.1);
}

function pickRandomVerb(
  pool: Verb[],
  rng: () => number,
  lastVerbBase?: string,
  allowImmediateRepeat?: boolean
): Verb | undefined {
  if (pool.length === 0) return undefined;
  if (allowImmediateRepeat || pool.length === 1) {
    const idx = Math.floor(rng() * pool.length);
    return pool[idx];
  }
  // Try to avoid immediate repeat
  const candidates = pool.filter(v => v.base !== lastVerbBase);
  const choicePool = candidates.length > 0 ? candidates : pool;
  const idx = Math.floor(rng() * choicePool.length);
  return choicePool[idx];
}

export function createInitialGameState(verbs: Verb[], config: GameConfig): GameState {
  const rng = config.rng ?? defaultRng;
  return {
    config: { ...config, rng },
    verbs: [...verbs],
    remainingVerbs: [...verbs],
    lastVerbBase: undefined,
    score: 0,
    timeLeftMs: config.totalTimeMs,
    ended: false,
    streak: 0,
    highestStreak: 0,
    comboMultiplier: 1,
    roundsCompleted: 0,
    currentRound: undefined,
  };
}

export function startNewRound(state: GameState, nowMs: number): GameState {
  if (state.ended) return state;
  const rng = state.config.rng ?? defaultRng;
  const next = pickRandomVerb(
    state.remainingVerbs,
    rng,
    state.lastVerbBase,
    state.config.allowImmediateRepeat
  );
  if (!next) {
    // No verbs available: end game gracefully
    return { ...state, ended: true, currentRound: undefined };
  }
  const required = selectRequiredFields(state.config.difficulty);
  const newRound: Round = {
    currentVerb: next,
    required,
    shownAtMs: nowMs,
  };
  return {
    ...state,
    currentRound: newRound,
    lastVerbBase: next.base,
  };
}

export function submitAnswer(
  state: GameState, 
  answer: AnswerPayload,
  answerTimeMs?: number
): { state: GameState; result: SubmitResult } {
  if (state.ended || !state.currentRound) {
    return {
      state,
      result: {
        isCorrect: false,
        pointsAwarded: 0,
        streakAfter: state.streak,
        comboAfter: state.comboMultiplier,
      },
    };
  }

  const { currentVerb, required, shownAtMs } = state.currentRound;
  const userPS = normalize(answer.pastSimple);
  const userPP = normalize(answer.pastParticiple);
  const userTR = normalize(answer.translation);

  // Validate per required fields
  const psOk = required.pastSimple ? includesNormalized(currentVerb.pastSimple, userPS) : true;
  const ppOk = required.pastParticiple ? includesNormalized(currentVerb.pastParticiple, userPP) : true;
  const trOk = required.translation ? includesNormalized(currentVerb.translations, userTR) : true;

  const isCorrect = psOk && ppOk && trOk;

  // Calculate time taken (in seconds)
  const timeTaken = answerTimeMs !== undefined 
    ? answerTimeMs / 1000 
    : (Date.now() - shownAtMs) / 1000;

  let newStreak = state.streak;
  let newCombo = state.comboMultiplier;
  let points = 0;
  let speedBonus = 0;
  let timeBonus = 0;
  let isMilestone = false;

  if (isCorrect) {
    newStreak = state.streak + 1;
    newCombo = computeCombo(newStreak);
    const base = state.config.difficulty; // 1 / 2 / 3
    points = Math.round(base * newCombo);

    // Speed bonus: faster answers get bonus points
    // < 3 seconds: 50% bonus, < 5 seconds: 30% bonus, < 8 seconds: 15% bonus
    if (timeTaken < 3) {
      speedBonus = Math.round(points * 0.5);
    } else if (timeTaken < 5) {
      speedBonus = Math.round(points * 0.3);
    } else if (timeTaken < 8) {
      speedBonus = Math.round(points * 0.15);
    }

    // Time bonus: very fast answers (< 3s) add 1 second to timer
    if (timeTaken < 3) {
      timeBonus = 1000; // 1 second
    }

    // Check for milestone streaks (10, 20, 30, 50, 100, etc.)
    const milestoneStreaks = [10, 20, 30, 50, 100];
    if (milestoneStreaks.includes(newStreak)) {
      isMilestone = true;
      // Milestone bonus: extra points for reaching milestones
      speedBonus += Math.round(points * 0.5);
      timeBonus += 2000; // 2 extra seconds for milestones
    }
  } else {
    newStreak = 0;
    newCombo = 1;
  }

  const totalPoints = points + speedBonus;
  const newTimeLeft = Math.min(
    state.config.totalTimeMs,
    state.timeLeftMs + timeBonus
  );

  const newState: GameState = {
    ...state,
    score: state.score + totalPoints,
    timeLeftMs: newTimeLeft,
    streak: newStreak,
    highestStreak: Math.max(state.highestStreak, newStreak),
    comboMultiplier: newCombo,
    roundsCompleted: isCorrect ? state.roundsCompleted + 1 : state.roundsCompleted,
    // currentRound remains until caller starts a new one
  };

  return {
    state: newState,
    result: {
      isCorrect,
      pointsAwarded: totalPoints,
      streakAfter: newStreak,
      comboAfter: newCombo,
      speedBonus,
      timeBonus,
      isMilestone,
    },
  };
}

export function skipCurrentVerb(state: GameState): GameState {
  if (state.ended || !state.currentRound) return state;
  // Minimal rule: skipping does not change score or streak.
  // If you want a penalty or streak reset, adjust here.
  return state;
}

export function tickTimer(state: GameState, deltaMs: number): GameState {
  if (state.ended) return state;
  const timeLeftMs = Math.max(0, state.timeLeftMs - Math.max(0, deltaMs));
  const ended = timeLeftMs <= 0;
  return {
    ...state,
    timeLeftMs,
    ended,
    currentRound: ended ? undefined : state.currentRound,
  };
}

export function setDifficulty(state: GameState, difficulty: Difficulty): GameState {
  return {
    ...state,
    config: { ...state.config, difficulty },
  };
}

/**
 * Static verb list for the game.
 * TODO: Later, fetch verbs from Supabase or a verbs table.
 */
export const VERBS: Verb[] = [
    {
      base: "be",
      pastSimple: ["was", "were"],
      pastParticiple: ["been"],
      translations: ["être"],
    },
    {
      base: "have",
      pastSimple: ["had"],
      pastParticiple: ["had"],
      translations: ["avoir"],
    },
    {
      base: "do",
      pastSimple: ["did"],
      pastParticiple: ["done"],
      translations: ["faire"],
    },
    {
      base: "say",
      pastSimple: ["said"],
      pastParticiple: ["said"],
      translations: ["dire"],
    },
    {
      base: "get",
      pastSimple: ["got"],
      pastParticiple: ["got", "gotten"],
      translations: ["obtenir", "recevoir"],
    },
    {
      base: "make",
      pastSimple: ["made"],
      pastParticiple: ["made"],
      translations: ["faire", "fabriquer"],
    },
    {
      base: "go",
      pastSimple: ["went"],
      pastParticiple: ["gone"],
      translations: ["aller"],
    },
    {
      base: "know",
      pastSimple: ["knew"],
      pastParticiple: ["known"],
      translations: ["savoir", "connaître"],
    },
    {
      base: "think",
      pastSimple: ["thought"],
      pastParticiple: ["thought"],
      translations: ["penser"],
    },
    {
      base: "take",
      pastSimple: ["took"],
      pastParticiple: ["taken"],
      translations: ["prendre"],
    },
    {
      base: "see",
      pastSimple: ["saw"],
      pastParticiple: ["seen"],
      translations: ["voir"],
    },
    {
      base: "come",
      pastSimple: ["came"],
      pastParticiple: ["come"],
      translations: ["venir"],
    },
    {
      base: "find",
      pastSimple: ["found"],
      pastParticiple: ["found"],
      translations: ["trouver"],
    },
    {
      base: "give",
      pastSimple: ["gave"],
      pastParticiple: ["given"],
      translations: ["donner"],
    },
    {
      base: "tell",
      pastSimple: ["told"],
      pastParticiple: ["told"],
      translations: ["dire", "raconter"],
    },
    {
      base: "become",
      pastSimple: ["became"],
      pastParticiple: ["become"],
      translations: ["devenir"],
    },
    {
      base: "show",
      pastSimple: ["showed"],
      pastParticiple: ["shown", "showed"],
      translations: ["montrer"],
    },
    {
      base: "leave",
      pastSimple: ["left"],
      pastParticiple: ["left"],
      translations: ["partir", "quitter", "laisser"],
    },
    {
      base: "feel",
      pastSimple: ["felt"],
      pastParticiple: ["felt"],
      translations: ["sentir", "ressentir"],
    },
    {
      base: "put",
      pastSimple: ["put"],
      pastParticiple: ["put"],
      translations: ["mettre"],
    },
    {
      base: "bring",
      pastSimple: ["brought"],
      pastParticiple: ["brought"],
      translations: ["apporter", "amener"],
    },
    {
      base: "begin",
      pastSimple: ["began"],
      pastParticiple: ["begun"],
      translations: ["commencer"],
    },
    {
      base: "keep",
      pastSimple: ["kept"],
      pastParticiple: ["kept"],
      translations: ["garder"],
    },
    {
      base: "hold",
      pastSimple: ["held"],
      pastParticiple: ["held"],
      translations: ["tenir"],
    },
    {
      base: "write",
      pastSimple: ["wrote"],
      pastParticiple: ["written"],
      translations: ["écrire"],
    },
    {
      base: "stand",
      pastSimple: ["stood"],
      pastParticiple: ["stood"],
      translations: ["se tenir debout"],
    },
    {
      base: "hear",
      pastSimple: ["heard"],
      pastParticiple: ["heard"],
      translations: ["entendre"],
    },
    {
      base: "let",
      pastSimple: ["let"],
      pastParticiple: ["let"],
      translations: ["laisser", "permettre"],
    },
    {
      base: "mean",
      pastSimple: ["meant"],
      pastParticiple: ["meant"],
      translations: ["vouloir dire", "signifier"],
    },
    {
      base: "set",
      pastSimple: ["set"],
      pastParticiple: ["set"],
      translations: ["mettre", "fixer"],
    },
    {
      base: "meet",
      pastSimple: ["met"],
      pastParticiple: ["met"],
      translations: ["rencontrer"],
    },
    {
      base: "run",
      pastSimple: ["ran"],
      pastParticiple: ["run"],
      translations: ["courir"],
    },
    {
      base: "pay",
      pastSimple: ["paid"],
      pastParticiple: ["paid"],
      translations: ["payer"],
    },
    {
      base: "sit",
      pastSimple: ["sat"],
      pastParticiple: ["sat"],
      translations: ["s'asseoir"],
    },
    {
      base: "speak",
      pastSimple: ["spoke"],
      pastParticiple: ["spoken"],
      translations: ["parler"],
    },
    {
      base: "lie",
      pastSimple: ["lay"],
      pastParticiple: ["lain"],
      translations: ["être allongé", "se coucher"],
    },
    {
      base: "lead",
      pastSimple: ["led"],
      pastParticiple: ["led"],
      translations: ["mener", "conduire"],
    },
    {
      base: "read",
      pastSimple: ["read"],
      pastParticiple: ["read"],
      translations: ["lire"],
    },
    {
      base: "grow",
      pastSimple: ["grew"],
      pastParticiple: ["grown"],
      translations: ["grandir", "cultiver"],
    },
    {
      base: "lose",
      pastSimple: ["lost"],
      pastParticiple: ["lost"],
      translations: ["perdre"],
    },
    {
      base: "fall",
      pastSimple: ["fell"],
      pastParticiple: ["fallen"],
      translations: ["tomber"],
    },
    {
      base: "send",
      pastSimple: ["sent"],
      pastParticiple: ["sent"],
      translations: ["envoyer"],
    },
    {
      base: "build",
      pastSimple: ["built"],
      pastParticiple: ["built"],
      translations: ["construire"],
    },
    {
      base: "understand",
      pastSimple: ["understood"],
      pastParticiple: ["understood"],
      translations: ["comprendre"],
    },
    {
      base: "draw",
      pastSimple: ["drew"],
      pastParticiple: ["drawn"],
      translations: ["dessiner", "tirer"],
    },
    {
      base: "break",
      pastSimple: ["broke"],
      pastParticiple: ["broken"],
      translations: ["casser", "briser"],
    },
    {
      base: "spend",
      pastSimple: ["spent"],
      pastParticiple: ["spent"],
      translations: ["dépenser", "passer (du temps)"],
    },
    {
      base: "cut",
      pastSimple: ["cut"],
      pastParticiple: ["cut"],
      translations: ["couper"],
    },
    {
      base: "rise",
      pastSimple: ["rose"],
      pastParticiple: ["risen"],
      translations: ["se lever", "augmenter"],
    },
    {
      base: "drive",
      pastSimple: ["drove"],
      pastParticiple: ["driven"],
      translations: ["conduire"],
    },
    {
      base: "buy",
      pastSimple: ["bought"],
      pastParticiple: ["bought"],
      translations: ["acheter"],
    },
    {
      base: "wear",
      pastSimple: ["wore"],
      pastParticiple: ["worn"],
      translations: ["porter (vêtement)"],
    },
    {
      base: "choose",
      pastSimple: ["chose"],
      pastParticiple: ["chosen"],
      translations: ["choisir"],
    },
    {
      base: "sleep",
      pastSimple: ["slept"],
      pastParticiple: ["slept"],
      translations: ["dormir"],
    },
    {
      base: "win",
      pastSimple: ["won"],
      pastParticiple: ["won"],
      translations: ["gagner"],
    },
    {
      base: "teach",
      pastSimple: ["taught"],
      pastParticiple: ["taught"],
      translations: ["enseigner"],
    },
    {
      base: "catch",
      pastSimple: ["caught"],
      pastParticiple: ["caught"],
      translations: ["attraper"],
    },
    {
      base: "fight",
      pastSimple: ["fought"],
      pastParticiple: ["fought"],
      translations: ["se battre"],
    },
    {
      base: "throw",
      pastSimple: ["threw"],
      pastParticiple: ["thrown"],
      translations: ["lancer", "jeter"],
    },
    {
      base: "eat",
      pastSimple: ["ate"],
      pastParticiple: ["eaten"],
      translations: ["manger"],
    },
    {
      base: "sell",
      pastSimple: ["sold"],
      pastParticiple: ["sold"],
      translations: ["vendre"],
    },
    {
      base: "beat",
      pastSimple: ["beat"],
      pastParticiple: ["beaten"],
      translations: ["battre"],
    },
    {
      base: "hit",
      pastSimple: ["hit"],
      pastParticiple: ["hit"],
      translations: ["frapper", "taper"],
    },
    {
      base: "hurt",
      pastSimple: ["hurt"],
      pastParticiple: ["hurt"],
      translations: ["blesser", "faire mal"],
    },
    {
      base: "cost",
      pastSimple: ["cost"],
      pastParticiple: ["cost"],
      translations: ["coûter"],
    },
    {
      base: "shut",
      pastSimple: ["shut"],
      pastParticiple: ["shut"],
      translations: ["fermer"],
    },
    {
      base: "sing",
      pastSimple: ["sang"],
      pastParticiple: ["sung"],
      translations: ["chanter"],
    },
    {
      base: "swim",
      pastSimple: ["swam"],
      pastParticiple: ["swum"],
      translations: ["nager"],
    },
    {
      base: "ring",
      pastSimple: ["rang"],
      pastParticiple: ["rung"],
      translations: ["sonner", "appeler"],
    },
    {
      base: "drink",
      pastSimple: ["drank"],
      pastParticiple: ["drunk"],
      translations: ["boire"],
    },
    {
      base: "fly",
      pastSimple: ["flew"],
      pastParticiple: ["flown"],
      translations: ["voler (dans les airs)"],
    },
    {
      base: "forget",
      pastSimple: ["forgot"],
      pastParticiple: ["forgotten"],
      translations: ["oublier"],
    },
    {
      base: "forgive",
      pastSimple: ["forgave"],
      pastParticiple: ["forgiven"],
      translations: ["pardonner"],
    },
    {
      base: "freeze",
      pastSimple: ["froze"],
      pastParticiple: ["frozen"],
      translations: ["geler"],
    },
    {
      base: "hang",
      pastSimple: ["hung"],
      pastParticiple: ["hung"],
      translations: ["pendre", "suspendre"],
    },
    {
      base: "hide",
      pastSimple: ["hid"],
      pastParticiple: ["hidden"],
      translations: ["cacher"],
    },
    {
      base: "ride",
      pastSimple: ["rode"],
      pastParticiple: ["ridden"],
      translations: ["monter (à cheval, vélo)"],
    },
    {
      base: "shoot",
      pastSimple: ["shot"],
      pastParticiple: ["shot"],
      translations: ["tirer (avec une arme)"],
    },
    {
      base: "stick",
      pastSimple: ["stuck"],
      pastParticiple: ["stuck"],
      translations: ["coller"],
    },
    {
      base: "steal",
      pastSimple: ["stole"],
      pastParticiple: ["stolen"],
      translations: ["voler", "dérober"],
    },
    {
      base: "tear",
      pastSimple: ["tore"],
      pastParticiple: ["torn"],
      translations: ["déchirer"],
    },
    {
      base: "wake",
      pastSimple: ["woke"],
      pastParticiple: ["woken"],
      translations: ["se réveiller"],
    },
    {
      base: "dig",
      pastSimple: ["dug"],
      pastParticiple: ["dug"],
      translations: ["creuser"],
    },
    {
      base: "feed",
      pastSimple: ["fed"],
      pastParticiple: ["fed"],
      translations: ["nourrir"],
    },
    {
      base: "light",
      pastSimple: ["lit", "lighted"],
      pastParticiple: ["lit", "lighted"],
      translations: ["allumer", "éclairer"],
    },
    {
      base: "bind",
      pastSimple: ["bound"],
      pastParticiple: ["bound"],
      translations: ["lier", "attacher"],
    },
    {
      base: "bite",
      pastSimple: ["bit"],
      pastParticiple: ["bitten"],
      translations: ["mordre"],
    },
    {
      base: "bleed",
      pastSimple: ["bled"],
      pastParticiple: ["bled"],
      translations: ["saigner"],
    },
    {
      base: "blow",
      pastSimple: ["blew"],
      pastParticiple: ["blown"],
      translations: ["souffler"],
    },
    {
      base: "breed",
      pastSimple: ["bred"],
      pastParticiple: ["bred"],
      translations: ["élever (des animaux)"],
    },
    {
      base: "cling",
      pastSimple: ["clung"],
      pastParticiple: ["clung"],
      translations: ["s'accrocher"],
    },
    {
      base: "creep",
      pastSimple: ["crept"],
      pastParticiple: ["crept"],
      translations: ["ramper", "se faufiler"],
    },
    {
      base: "deal",
      pastSimple: ["dealt"],
      pastParticiple: ["dealt"],
      translations: ["traiter", "gérer"],
    },
    {
      base: "forbid",
      pastSimple: ["forbade"],
      pastParticiple: ["forbidden"],
      translations: ["interdire"],
    },
    {
      base: "kneel",
      pastSimple: ["knelt", "kneeled"],
      pastParticiple: ["knelt", "kneeled"],
      translations: ["s'agenouiller"],
    },
    {
      base: "lend",
      pastSimple: ["lent"],
      pastParticiple: ["lent"],
      translations: ["prêter"],
    },
    {
      base: "seek",
      pastSimple: ["sought"],
      pastParticiple: ["sought"],
      translations: ["chercher"],
    },
    {
      base: "shake",
      pastSimple: ["shook"],
      pastParticiple: ["shaken"],
      translations: ["secouer"],
    },
    {
      base: "shine",
      pastSimple: ["shone"],
      pastParticiple: ["shone"],
      translations: ["briller"],
    },
    {
      base: "shrink",
      pastSimple: ["shrank", "shrunk"],
      pastParticiple: ["shrunk", "shrunken"],
      translations: ["rétrécir"],
    },
    {
      base: "slide",
      pastSimple: ["slid"],
      pastParticiple: ["slid"],
      translations: ["glisser"],
    },
    {
      base: "split",
      pastSimple: ["split"],
      pastParticiple: ["split"],
      translations: ["fendre", "diviser"],
    },
    {
      base: "spread",
      pastSimple: ["spread"],
      pastParticiple: ["spread"],
      translations: ["répandre", "étaler"],
    },
    {
      base: "spring",
      pastSimple: ["sprang", "sprung"],
      pastParticiple: ["sprung"],
      translations: ["sauter", "jaillir"],
    },
    {
      base: "stink",
      pastSimple: ["stank", "stunk"],
      pastParticiple: ["stunk"],
      translations: ["puer"],
    },
    {
      base: "strike",
      pastSimple: ["struck"],
      pastParticiple: ["struck"],
      translations: ["frapper", "heurter"],
    },
    {
      base: "swear",
      pastSimple: ["swore"],
      pastParticiple: ["sworn"],
      translations: ["jurer"],
    },
    {
      base: "sweep",
      pastSimple: ["swept"],
      pastParticiple: ["swept"],
      translations: ["balayer"],
    },
    {
      base: "swing",
      pastSimple: ["swung"],
      pastParticiple: ["swung"],
      translations: ["se balancer"],
    },
    {
      base: "undertake",
      pastSimple: ["undertook"],
      pastParticiple: ["undertaken"],
      translations: ["entreprendre"],
    },
    {
      base: "weep",
      pastSimple: ["wept"],
      pastParticiple: ["wept"],
      translations: ["pleurer"],
    },
    {
      base: "withdraw",
      pastSimple: ["withdrew"],
      pastParticiple: ["withdrawn"],
      translations: ["retirer"],
    },
    {
      base: "arise",
      pastSimple: ["arose"],
      pastParticiple: ["arisen"],
      translations: ["survenir", "se produire"],
    },
    {
      base: "bear",
      pastSimple: ["bore"],
      pastParticiple: ["borne", "born"],
      translations: ["porter", "supporter", "mettre au monde"],
    },
    {
      base: "bet",
      pastSimple: ["bet"],
      pastParticiple: ["bet"],
      translations: ["parier"],
    },
    {
      base: "broadcast",
      pastSimple: ["broadcast"],
      pastParticiple: ["broadcast"],
      translations: ["diffuser (à la radio, TV)"],
    },
    {
      base: "burst",
      pastSimple: ["burst"],
      pastParticiple: ["burst"],
      translations: ["éclater"],
    },
    {
      base: "cast",
      pastSimple: ["cast"],
      pastParticiple: ["cast"],
      translations: ["jeter", "distribuer un rôle"],
    },
    {
      base: "forecast",
      pastSimple: ["forecast", "forecasted"],
      pastParticiple: ["forecast", "forecasted"],
      translations: ["prédire", "prévoir"],
    },
    {
      base: "foresee",
      pastSimple: ["foresaw"],
      pastParticiple: ["foreseen"],
      translations: ["prévoir", "anticiper"],
    },
    {
      base: "grind",
      pastSimple: ["ground"],
      pastParticiple: ["ground"],
      translations: ["moudre"],
    },
    {
      base: "lay",
      pastSimple: ["laid"],
      pastParticiple: ["laid"],
      translations: ["poser", "pondre"],
    },
    {
      base: "learn",
      pastSimple: ["learnt", "learned"],
      pastParticiple: ["learnt", "learned"],
      translations: ["apprendre"],
    },
    {
      base: "burn",
      pastSimple: ["burnt", "burned"],
      pastParticiple: ["burnt", "burned"],
      translations: ["brûler"],
    },
    {
      base: "smell",
      pastSimple: ["smelt", "smelled"],
      pastParticiple: ["smelt", "smelled"],
      translations: ["sentir (odeur)"],
    },
    {
      base: "spell",
      pastSimple: ["spelt", "spelled"],
      pastParticiple: ["spelt", "spelled"],
      translations: ["épeler"],
    },
    {
      base: "spill",
      pastSimple: ["spilt", "spilled"],
      pastParticiple: ["spilt", "spilled"],
      translations: ["renverser"],
    },
    {
      base: "spoil",
      pastSimple: ["spoilt", "spoiled"],
      pastParticiple: ["spoilt", "spoiled"],
      translations: ["gâcher", "abîmer"],
    },
    {
      base: "lean",
      pastSimple: ["leant", "leaned"],
      pastParticiple: ["leant", "leaned"],
      translations: ["se pencher", "s'appuyer"],
    },
    {
      base: "leap",
      pastSimple: ["leapt", "leaped"],
      pastParticiple: ["leapt", "leaped"],
      translations: ["sauter"],
    },
    {
      base: "bend",
      pastSimple: ["bent"],
      pastParticiple: ["bent"],
      translations: ["plier", "se pencher"],
    },
    {
      base: "flee",
      pastSimple: ["fled"],
      pastParticiple: ["fled"],
      translations: ["fuir"],
    },
    {
      base: "forgo",
      pastSimple: ["forwent"],
      pastParticiple: ["forgone"],
      translations: ["renoncer à"],
    },
    {
      base: "overtake",
      pastSimple: ["overtook"],
      pastParticiple: ["overtaken"],
      translations: ["dépasser", "rattraper"],
    },
    {
      base: "upset",
      pastSimple: ["upset"],
      pastParticiple: ["upset"],
      translations: ["contrarier", "bouleverser"],
    },
    {
      base: "withstand",
      pastSimple: ["withstood"],
      pastParticiple: ["withstood"],
      translations: ["résister à"],
    },
    {
      base: "overcome",
      pastSimple: ["overcame"],
      pastParticiple: ["overcome"],
      translations: ["surmonter"],
    },
    {
      base: "mistake",
      pastSimple: ["mistook"],
      pastParticiple: ["mistaken"],
      translations: ["se tromper sur", "confondre"],
    },
    {
      base: "wind",
      pastSimple: ["wound"],
      pastParticiple: ["wound"],
      translations: ["remonter (une montre)", "enrouler"],
    },
    {
      base: "undergo",
      pastSimple: ["underwent"],
      pastParticiple: ["undergone"],
      translations: ["subir"],
    },
    {
      base: "prove",
      pastSimple: ["proved"],
      pastParticiple: ["proven", "proved"],
      translations: ["prouver"],
    },
    {
      base: "dream",
      pastSimple: ["dreamt", "dreamed"],
      pastParticiple: ["dreamt", "dreamed"],
      translations: ["rêver"],
    },
    {
      base: "dive",
      pastSimple: ["dived", "dove"],
      pastParticiple: ["dived"],
      translations: ["plonger"],
    },
    {
      base: "fit",
      pastSimple: ["fit", "fitted"],
      pastParticiple: ["fit", "fitted"],
      translations: ["aller (taille)", "convenir"],
    },
    {
      base: "quit",
      pastSimple: ["quit"],
      pastParticiple: ["quit"],
      translations: ["quitter", "abandonner"],
    },
    {
      base: "spin",
      pastSimple: ["spun"],
      pastParticiple: ["spun"],
      translations: ["tourner", "faire tourner"],
    },
    {
      base: "spit",
      pastSimple: ["spat"],
      pastParticiple: ["spat"],
      translations: ["cracher"],
    },
    {
      base: "sting",
      pastSimple: ["stung"],
      pastParticiple: ["stung"],
      translations: ["piquer"],
    },
    {
      base: "string",
      pastSimple: ["strung"],
      pastParticiple: ["strung"],
      translations: ["enfiler", "tendre (une corde)"],
    },
    {
      base: "wring",
      pastSimple: ["wrung"],
      pastParticiple: ["wrung"],
      translations: ["tordre"],
    },
  ];
  