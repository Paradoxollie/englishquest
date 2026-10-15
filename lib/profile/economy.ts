/**
 * Économie unique d'English Quest.
 *
 * Un seul barème pour tout le site, pensé pour tenir sur des années :
 * - l'expérience (XP) récompense les bonnes réponses, jamais le temps passé ;
 * - l'or est rare : il sert à acheter des avatars et des titres ;
 * - les parties répétées rapportent de moins en moins dans la journée ;
 * - un record personnel ou global donne un bonus visible mais borné ;
 * - les cours et les missions rapportent plus que les parties, parce que
 *   c'est là que l'apprentissage se fait.
 *
 * Principes repris du système d'origine (lib/profile/leveling.ts) :
 * XP lents à farmer, or très rare, bonus pour un record, niveau tous les 200 XP.
 */

import type { Difficulty } from "@/lib/profile/leveling";

export const XP_PER_LEVEL = 200;

/** Parties rémunérées à plein tarif par jour et par jeu. */
export const FULL_REWARD_PLAYS_PER_DAY = 5;
/** Au-delà, les XP sont divisés par quatre et l'or tombe à zéro. */
export const REDUCED_REWARD_RATIO = 0.25;

/** XP d'une partie "de référence" (performance = 1), avant difficulté. */
export const GAME_REFERENCE_XP = 25;
/** XP maximum d'une partie, bonus de record exclus. */
export const GAME_MAX_XP = 40;
/** XP minimum dès qu'il y a eu au moins une bonne réponse. */
export const GAME_MIN_XP = 2;
/** Un point d'or tous les 12 XP de partie, 3 maximum. */
export const GOLD_PER_XP = 12;
export const GAME_MAX_GOLD = 3;

export const PERSONAL_BEST_BONUS = { xp: 10, gold: 1 } as const;
export const GLOBAL_BEST_BONUS = { xp: 30, gold: 3 } as const;

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.8,
  medium: 1,
  hard: 1.3,
};

export type GameRewardInput = {
  /** Performance normalisée : 1 = partie de référence, 1.5 = plafond. 0 = rien. */
  performance: number;
  difficulty: Difficulty;
  /** Nombre de parties déjà enregistrées aujourd'hui pour ce jeu. */
  playsToday: number;
  isNewPersonalBest: boolean;
  isNewGlobalBest: boolean;
};

export type GameRewardResult = {
  xpEarned: number;
  goldEarned: number;
  /** Vrai si la partie est au tarif réduit (au-delà du quota du jour). */
  reduced: boolean;
  /** Détail affichable. */
  breakdown: {
    base: number;
    personalBest: number;
    globalBest: number;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function computeGameRewards(input: GameRewardInput): GameRewardResult {
  const performance = clamp(Number.isFinite(input.performance) ? input.performance : 0, 0, 1.5);

  if (performance <= 0) {
    return { xpEarned: 0, goldEarned: 0, reduced: false, breakdown: { base: 0, personalBest: 0, globalBest: 0 } };
  }

  const multiplier = DIFFICULTY_MULTIPLIER[input.difficulty] ?? 1;
  let base = Math.round(GAME_REFERENCE_XP * performance * multiplier);
  base = clamp(base, GAME_MIN_XP, GAME_MAX_XP);

  const reduced = input.playsToday >= FULL_REWARD_PLAYS_PER_DAY;
  if (reduced) {
    base = Math.max(1, Math.round(base * REDUCED_REWARD_RATIO));
  }

  const personalBest = input.isNewPersonalBest && !input.isNewGlobalBest ? PERSONAL_BEST_BONUS.xp : 0;
  const globalBest = input.isNewGlobalBest ? GLOBAL_BEST_BONUS.xp : 0;

  let gold = reduced ? 0 : Math.min(GAME_MAX_GOLD, Math.floor(base / GOLD_PER_XP));
  if (input.isNewGlobalBest) {
    gold += GLOBAL_BEST_BONUS.gold;
  } else if (input.isNewPersonalBest) {
    gold += PERSONAL_BEST_BONUS.gold;
  }

  return {
    xpEarned: base + personalBest + globalBest,
    goldEarned: gold,
    reduced,
    breakdown: { base, personalBest, globalBest },
  };
}

/** Récompense d'un cours validé (quiz à 80 %), par palier. */
export function getCourseCompletionReward(palierId: number) {
  const palier = clamp(Math.round(palierId), 1, 5);
  return {
    xp: 80 + (palier - 1) * 20,
    gold: 6 + (palier - 1) * 2,
  };
}

/** Examen de chapitre réussi (15 questions, 12 bonnes réponses) : l'équivalent de deux missions. */
export function getChapterExamReward(chapterId: number) {
  const base = getCourseCompletionReward(chapterId);
  return { xp: base.xp * 2, gold: base.gold * 2 };
}

/** Défi du jour : trois jeux tirés au sort, bonus fixe plus série de jours. */
export const DAILY_CHALLENGE_REWARD = { xp: 30, gold: 3 } as const;

export function getDailyStreakMultiplier(streakDays: number) {
  // +10 % par jour de série, plafonné à +50 %.
  return 1 + Math.min(5, Math.max(0, streakDays - 1)) * 0.1;
}

export function getLevelFromXP(xp: number) {
  return 1 + Math.floor(Math.max(0, xp) / XP_PER_LEVEL);
}

export function getLevelProgress(xp: number) {
  const safeXp = Math.max(0, xp);
  const level = getLevelFromXP(safeXp);
  const into = safeXp - (level - 1) * XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel: into,
    xpForLevel: XP_PER_LEVEL,
    percent: Math.round((into / XP_PER_LEVEL) * 100),
    xpToNext: XP_PER_LEVEL - into,
  };
}

/**
 * Normalisations par jeu. Chaque jeu fournit ce qu'il mesure ; on en fait
 * une performance comparable entre jeux (1 = bonne partie type).
 */
export const gamePerformance = {
  speedVerb(correctCount: number, difficulty: Difficulty) {
    const reference = difficulty === "hard" ? 20 : 25;
    return correctCount / reference;
  },
  enigmaScroll(wordsFound: number) {
    return wordsFound / 8;
  },
  wordfall(wordsCompleted: number, mode: "exact" | "free") {
    return wordsCompleted / (mode === "exact" ? 15 : 20);
  },
  flashTranslation(correctRounds: number, totalRounds: number) {
    return totalRounds > 0 ? correctRounds / totalRounds : 0;
  },
  flashback(score: number) {
    return score / 30;
  },
  grammarRush(correct: number) {
    return correct / 15;
  },
  lexiconBlaster(wordsMastered: number, wave: number) {
    return wordsMastered / 25 + Math.max(0, wave - 1) * 0.05;
  },
};
