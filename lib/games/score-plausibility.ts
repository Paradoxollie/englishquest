/**
 * Plausibilité des scores envoyés par les jeux (module pur, testé).
 *
 * Pour chaque jeu, un score maximal atteignable compte tenu du nombre de
 * réponses et de la durée annoncée, dérivé des règles de score des moteurs
 * (lib/games/*) avec des marges larges : un joueur honnête, même très rapide,
 * n'est jamais refusé ; un score inventé l'est. La durée annoncée est elle-même
 * bornée par la session côté serveur (lib/games/game-session-server.ts).
 */

import { isValidRushResult } from "./grammar-rush";

export type Plausibility = { ok: true } | { ok: false; reason: string };

const OK: Plausibility = { ok: true };
const fail = (reason: string): Plausibility => ({ ok: false, reason });

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/* ------------------------------------------------------------------ */
/* Enigma Scroll (lib/games/enigma-scroll.ts, calculateScore)          */
/* ------------------------------------------------------------------ */

const ENIGMA_RULES: Record<4 | 5 | 6, { base: number; maxAttempts: number }> = {
  4: { base: 10, maxAttempts: 5 },
  5: { base: 15, maxAttempts: 6 },
  6: { base: 20, maxAttempts: 7 },
};
/** Bonus de temps plafonné à 15, multiplicateur de série plafonné à 1,15. */
const ENIGMA_MAX_TIME_BONUS = 15;
const ENIGMA_MAX_STREAK_MULTIPLIER = 1.15;
/** Un mot trouvé demande au moins de taper ses lettres et de valider. */
export const ENIGMA_MIN_MS_PER_WORD = 1_200;

export function maxEnigmaPointsPerWord(wordLength: 4 | 5 | 6): number {
  const rules = ENIGMA_RULES[wordLength];
  return Math.floor((rules.base + (rules.maxAttempts - 1) * 2 + ENIGMA_MAX_TIME_BONUS) * ENIGMA_MAX_STREAK_MULTIPLIER);
}

export function checkEnigmaScroll(input: { wordLength: number; totalScore: number; wordsFound: number; durationMs: number }): Plausibility {
  const { wordLength, totalScore, wordsFound, durationMs } = input;
  if (wordLength !== 4 && wordLength !== 5 && wordLength !== 6) return fail("longueur");
  if (![totalScore, wordsFound, durationMs].every(isCount)) return fail("valeurs");
  if (totalScore > wordsFound * maxEnigmaPointsPerWord(wordLength)) return fail("score trop haut pour le nombre de mots");
  if (totalScore < wordsFound * ENIGMA_RULES[wordLength].base) return fail("score trop bas pour le nombre de mots");
  if (wordsFound > Math.floor(durationMs / ENIGMA_MIN_MS_PER_WORD) + 1) return fail("trop de mots pour la durée");
  return OK;
}

/* ------------------------------------------------------------------ */
/* Wordfall (lib/games/wordfall.ts, processWordInput)                  */
/* ------------------------------------------------------------------ */

/** Plus long mot ou expression pris en compte pour le bonus de longueur. */
const WORDFALL_MAX_LETTERS = 20;
const WORDFALL_MAX_SPEED_BONUS = 5;
export const WORDFALL_MIN_MS_PER_WORD = 500;

function wordfallCombo(streak: number) {
  if (streak >= 50) return 3;
  if (streak >= 20) return 2.5;
  if (streak >= 10) return 2;
  if (streak >= 5) return 1.5;
  return 1;
}

/** Score maximal après `words` mots attrapés sans faute, tout en haut de l'écran. */
export function maxWordfallScore(mode: "exact" | "free", words: number): number {
  const base = mode === "exact" ? 5 : 8;
  const lengthBonus = Math.floor(WORDFALL_MAX_LETTERS * 0.5);
  let total = 0;
  for (let i = 1; i <= words; i += 1) {
    const combo = wordfallCombo(i);
    const levelBonus = Math.floor(i / 5); // niveau = mots / 5 + 1
    total += Math.floor((base + lengthBonus + WORDFALL_MAX_SPEED_BONUS + levelBonus) * combo);
    if (i % 10 === 0) total += Math.floor(10 * combo);
  }
  return total;
}

export function checkWordfall(input: { mode: string; score: number; wordsCompleted: number; durationMs: number }): Plausibility {
  const { mode, score, wordsCompleted, durationMs } = input;
  if (mode !== "exact" && mode !== "free") return fail("mode");
  if (![score, wordsCompleted, durationMs].every(isCount)) return fail("valeurs");
  if (score > maxWordfallScore(mode, wordsCompleted)) return fail("score trop haut pour le nombre de mots");
  if (wordsCompleted > Math.floor(durationMs / WORDFALL_MIN_MS_PER_WORD) + 3) return fail("trop de mots pour la durée");
  return OK;
}

/* ------------------------------------------------------------------ */
/* Lexicon Blaster (lib/games/spaceLexShooter.ts, checkCollisions)     */
/* ------------------------------------------------------------------ */

/** Un mot au plus par intervalle d'apparition (900 ms au plus rapide). */
export const LEXICON_MIN_SPAWN_MS = 900;
/** Mots déjà à l'écran ou en approche au départ d'une vague. */
const LEXICON_EXTRA_HITS = 16;
/** Chaque vague passe par une annonce et un bilan d'au moins 3 s chacun. */
const LEXICON_MIN_WAVE_TRANSITION_MS = 5_000;

export function lexiconWaveTarget(wave: number): number {
  return wave % 5 === 0 ? 15 : 10 + (wave - 1) * 5;
}

/** Plafond du nombre de mots touchés pendant une durée. */
export function maxLexiconHits(durationMs: number): number {
  return Math.floor(durationMs / LEXICON_MIN_SPAWN_MS) + LEXICON_EXTRA_HITS;
}

/**
 * Score maximal pour `hits` bonnes cibles : bonus x2 permanent, combo jamais
 * cassé, toutes les vagues et tous les boss réussis.
 */
export function maxLexiconScore(hits: number): number {
  let score = 0;
  let combo = 0;
  let wave = 1;
  let progress = 0;
  for (let i = 0; i < hits; i += 1) {
    const level = Math.floor(score / 100) + 1;
    score += 2 * 10 * level;
    combo += 1;
    if (combo >= 5) score += Math.floor(combo / 5) * 5;
    progress += 1;
    if (progress >= lexiconWaveTarget(wave)) {
      score += wave * 100;
      if (wave % 5 === 0) score += 1000;
      wave += 1;
      progress = 0;
    }
    if (score > Number.MAX_SAFE_INTEGER / 4) return Number.MAX_SAFE_INTEGER;
  }
  return score;
}

export function checkLexiconBlaster(input: {
  score: number;
  wave: number;
  maxCombo: number;
  wordsMastered: number;
  wordsMissed: number;
  durationMs: number;
}): Plausibility {
  const { score, wave, maxCombo, wordsMastered, wordsMissed, durationMs } = input;
  if (![score, wave, maxCombo, wordsMastered, wordsMissed, durationMs].every(isCount) || wave < 1) return fail("valeurs");
  const hitsCap = maxLexiconHits(durationMs);
  let hitsNeeded = 0;
  for (let w = 1; w < wave; w += 1) hitsNeeded += lexiconWaveTarget(w);
  if (hitsNeeded > hitsCap) return fail("vague trop haute pour la durée");
  if ((wave - 1) * LEXICON_MIN_WAVE_TRANSITION_MS > durationMs) return fail("vague trop haute pour la durée");
  if (maxCombo > hitsCap || wordsMastered > hitsCap) return fail("trop de mots pour la durée");
  if (score > maxLexiconScore(hitsCap)) return fail("score trop haut pour la durée");
  return OK;
}

/* ------------------------------------------------------------------ */
/* Flashback (lib/games/echoLex.ts)                                    */
/* ------------------------------------------------------------------ */

/** Après chaque réponse, la correction reste affichée 650 ms. */
export const FLASHBACK_MIN_MS_PER_ROUND = 600;

export function checkFlashback(input: { score: number; durationMs: number }): Plausibility {
  const { score, durationMs } = input;
  if (![score, durationMs].every(isCount)) return fail("valeurs");
  if (score > Math.floor(durationMs / FLASHBACK_MIN_MS_PER_ROUND) + 1) return fail("trop de réponses pour la durée");
  return OK;
}

/* ------------------------------------------------------------------ */
/* Flash Translation (lib/games/flashTranslation.ts)                   */
/* ------------------------------------------------------------------ */

export const FLASH_TRANSLATION_ROUNDS = 10;
const FLASH_TRANSLATION_PENALTY_MS = 5_000;
/** Délai minimal avant l'apparition des choix (client : 1 400 ms). */
const FLASH_TRANSLATION_MIN_WAIT_MS = 1_400;

export function checkFlashTranslation(input: {
  totalTimeMs: number;
  wrongAnswers: number;
  roundsCompleted: number;
  durationMs: number;
}): Plausibility {
  const { totalTimeMs, wrongAnswers, roundsCompleted, durationMs } = input;
  if (![totalTimeMs, wrongAnswers, roundsCompleted, durationMs].every(isCount)) return fail("valeurs");
  if (roundsCompleted !== FLASH_TRANSLATION_ROUNDS || wrongAnswers > roundsCompleted) return fail("manches");
  const reactions = totalTimeMs - wrongAnswers * FLASH_TRANSLATION_PENALTY_MS;
  if (reactions < 0) return fail("temps incohérent");
  // Les réactions ont eu lieu pendant la partie ; les délais d'attente aussi.
  if (reactions > durationMs + 1_000) return fail("temps plus long que la partie");
  if (durationMs < 0.8 * (roundsCompleted * FLASH_TRANSLATION_MIN_WAIT_MS + reactions)) return fail("partie trop courte");
  return OK;
}

/* ------------------------------------------------------------------ */
/* Speed Verb Challenge (lib/games/speed-verb-challenge.ts)            */
/* ------------------------------------------------------------------ */

/** Après une bonne réponse, le verbe suivant arrive au bout de 900 ms. */
export const SPEED_VERB_MIN_MS_PER_ANSWER = 800;

/** Score maximal pour `correct` bonnes réponses d'affilée, toutes rapides. */
export function maxSpeedVerbScore(difficulty: 1 | 2 | 3, correct: number): number {
  const milestones = new Set([10, 20, 30, 50, 100]);
  let total = 0;
  for (let streak = 1; streak <= correct; streak += 1) {
    const points = Math.round(difficulty * (1 + streak * 0.1));
    total += points + Math.round(points * 0.5) + (milestones.has(streak) ? Math.round(points * 0.5) : 0);
  }
  return total;
}

export function checkSpeedVerb(input: {
  difficulty: number;
  score: number;
  correctCount: number;
  totalRounds: number;
  durationMs: number;
}): Plausibility {
  const { difficulty, score, correctCount, totalRounds, durationMs } = input;
  if (difficulty !== 1 && difficulty !== 2 && difficulty !== 3) return fail("difficulté");
  if (![score, correctCount, totalRounds, durationMs].every(isCount) || totalRounds < correctCount) return fail("valeurs");
  if (score > maxSpeedVerbScore(difficulty, correctCount)) return fail("score trop haut pour le nombre de verbes");
  if (score < correctCount * difficulty) return fail("score trop bas pour le nombre de verbes");
  if (correctCount > Math.floor(durationMs / SPEED_VERB_MIN_MS_PER_ANSWER) + 1) return fail("trop de verbes pour la durée");
  return OK;
}

/* ------------------------------------------------------------------ */
/* Grammar Rush (lib/games/grammar-rush.ts)                            */
/* ------------------------------------------------------------------ */

export function checkGrammarRush(input: { score: number; correct: number; attempts: number; durationMs: number }): Plausibility {
  return isValidRushResult(input) ? OK : fail("résultat incohérent");
}
