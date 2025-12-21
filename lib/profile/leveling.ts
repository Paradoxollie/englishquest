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
 * 
 * Architecture:
 * - Only ONE table game_scores with a "difficulty" column
 * - 3 leaderboards (easy / medium / hard) are built by filtering on difficulty
 * - XP and gold are wired to Supabase (profiles + game_scores + leaderboards)
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
 * IMPORTANT: Rewards depend ONLY on:
 * - Number of correct answers (correctCount)
 * - Difficulty level (easy/medium/hard)
 * - Whether this is a new global best score (isNewGlobalBest)
 * 
 * NO other factors are considered:
 * - NO time/duration
 * - NO streak
 * - NO accuracy percentage
 * - NO other metrics
 * 
 * Reward Formula:
 * - Base XP per correct answer: 1 (easy), 2 (medium), 3 (hard)
 * - Base XP = correctCount × XP per correct
 * - Bonus XP: +80 if this is a new global best score for the difficulty
 * - Gold based on correct answers with specific thresholds:
 *   * 1 gold at 10 correct answers
 *   * 2 gold at 30 correct answers
 *   * 3 gold at 60 correct answers
 *   * Formula: floor(correctCount / 10) for 0-29, then floor(correctCount / 15) for 30-59, then floor(correctCount / 20) for 60+
 * 
 * This ensures:
 * - Even looping games won't allow rapid XP/gold farming
 * - Difficulty directly impacts rewards (harder = more rewards)
 * - Leaderboard competition is incentivized with significant bonus (+80 XP)
 * - Gold is VERY slow to farm - purchasing avatars (50 gold) requires significant effort
 * 
 * Example calculations:
 * - Easy, 10 correct, no best: 10 XP, 1 gold
 * - Medium, 30 correct, no best: 60 XP, 2 gold
 * - Hard, 60 correct, no best: 180 XP, 3 gold
 * - Hard, 20 correct, new best: 140 XP (60 base + 80 bonus), 2 gold (based on correctCount, not XP)
 * - To earn 50 gold (avatar price): need ~1000 correct answers
 * 
 * @param params - Reward calculation parameters
 * @param params.difficulty - Game difficulty level ("easy" | "medium" | "hard")
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

  // Validate inputs
  if (correctCount < 0) {
    return { xpEarned: 0, goldEarned: 0 };
  }

  // XP per correct answer based on difficulty
  // This is the ONLY factor (besides global best bonus) that affects XP
  // XP per correct answer (Reduced for slower leveling)
  const perCorrect: Record<Difficulty, number> = {
    easy: 1,
    medium: 1, // Medium same as easy
    hard: 2,   // Hard gives slightly more
  };

  // Base XP = correct answers × XP per correct
  let xpBase = correctCount * perCorrect[difficulty];

  // Global Best Bonus: Prestige (XP) only, modest amount
  if (isNewGlobalBest && correctCount > 0) {
    xpBase += 50;
  }

  // Gold: HARDCORE FARMING
  // 1 Gold for every 20 correct answers
  // 20 correct = 1 Gold
  // 60 correct = 3 Gold
  const goldEarned = Math.floor(correctCount / 20);

  return {
    xpEarned: xpBase,
    goldEarned,
  };
}

