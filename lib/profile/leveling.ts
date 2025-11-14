/**
 * Leveling and Reward System for EnglishQuest
 * 
 * This module implements the XP, gold, and level calculation system.
 * 
 * Philosophy:
 * - XP and gold must be VERY slow to farm, even if players loop games
 * - Rewards depend ONLY on correct answers and difficulty (no time, accuracy, or streak)
 * - Significant bonus for achieving a new global best score on leaderboard
 * - Level progression is slow and meaningful (200 XP per level)
 */

export type Difficulty = "easy" | "medium" | "hard";

/**
 * Calculate the player's level based on their total XP.
 * 
 * Formula: level = 1 + floor(xp / 200)
 * 
 * This means:
 * - Level 1: 0-199 XP
 * - Level 2: 200-399 XP
 * - Level 3: 400-599 XP
 * - etc.
 * 
 * With the slow XP gain (1-3 XP per correct answer), leveling up requires
 * significant playtime, making each level meaningful.
 */
export function calculateLevelFromXP(xp: number): number {
  if (xp < 0) xp = 0;
  return 1 + Math.floor(xp / 200);
}

/**
 * Result of reward calculation for a game session.
 */
export type RewardResult = {
  xpEarned: number;
  goldEarned: number;
};

/**
 * Compute XP and gold rewards for a Speed Verb Challenge game session.
 * 
 * Reward Philosophy:
 * - Base XP per correct answer: 1 (easy), 2 (medium), 3 (hard)
 * - Gold is calculated as floor(XP / 8), making it even slower to farm
 * - Bonus XP (+80) for achieving a new global best score on the leaderboard
 * 
 * This ensures:
 * - Even looping games won't allow rapid XP/gold farming
 * - Difficulty directly impacts rewards (harder = more rewards)
 * - Leaderboard competition is incentivized with significant bonus
 * 
 * Example calculations:
 * - Easy, 10 correct, no best: 10 XP, 1 gold
 * - Medium, 15 correct, no best: 30 XP, 3 gold
 * - Hard, 20 correct, new best: 80 XP (60 base + 20 bonus), 10 gold
 * 
 * @param params - Reward calculation parameters
 * @param params.difficulty - Game difficulty level
 * @param params.correctCount - Number of correct answers in the session
 * @param params.isNewGlobalBest - Whether this score is a new global best for the difficulty
 * @returns Reward result with XP and gold earned
 */
export function computeSpeedVerbRewards(params: {
  difficulty: Difficulty;
  correctCount: number;
  isNewGlobalBest: boolean;
}): RewardResult {
  const { difficulty, correctCount, isNewGlobalBest } = params;

  // XP per correct answer based on difficulty
  const perCorrect: Record<Difficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  // Base XP = correct answers × XP per correct
  let xpBase = correctCount * perCorrect[difficulty];

  // Bonus for achieving a new global best score
  // Only applies if the player got at least one correct answer
  if (isNewGlobalBest && correctCount > 0) {
    xpBase += 80;
  }

  // Gold is calculated as floor(XP / 8)
  // This makes gold even slower to farm than XP
  const goldEarned = Math.floor(xpBase / 8);

  return {
    xpEarned: xpBase,
    goldEarned,
  };
}

