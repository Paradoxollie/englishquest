/**
 * Reward System for Enigma Scroll
 * 
 * Calculates XP and gold rewards based on:
 * - Number of words found (wordsFound)
 * - Difficulty level (4=easy, 5=medium, 6=hard)
 * - Whether this is a new global best score
 */

import type { Difficulty } from "./leveling";

/**
 * Map Enigma Scroll word length to difficulty
 */
export function mapWordLengthToDifficulty(wordLength: 4 | 5 | 6): Difficulty {
  switch (wordLength) {
    case 4:
      return "easy";
    case 5:
      return "medium";
    case 6:
      return "hard";
  }
}

/**
 * Compute XP and gold rewards for Enigma Scroll
 * 
 * IMPORTANT: This system is aligned with Speed Verb Challenge to ensure
 * consistent, slow gold farming across all games.
 * 
 * Philosophy:
 * - XP and gold must be VERY slow to farm, even if players loop games
 * - Rewards depend ONLY on words found and difficulty (no time, attempts, or streak)
 * - Significant bonus for achieving a new global best score on leaderboard
 * - Gold is VERY slow to farm - purchasing avatars (50 gold) requires significant effort
 * 
 * Reward Formula (aligned with Speed Verb Challenge):
 * - Base XP per word found: 1 (easy), 2 (medium), 3 (hard)
 * - Base XP = wordsFound × XP per word
 * - Bonus XP: +80 if this is a new global best score for the difficulty
 * - Gold based on words found with specific thresholds (same as Speed Verb Challenge):
 *   * 1 gold at 10 words found
 *   * 2 gold at 30 words found
 *   * 3 gold at 60 words found
 *   * Formula: floor(wordsFound / 10) for 0-29, then floor(wordsFound / 15) for 30-59, then floor(wordsFound / 20) for 60+
 * 
 * This ensures:
 * - Even looping games won't allow rapid XP/gold farming
 * - Difficulty directly impacts rewards (harder = more rewards)
 * - Leaderboard competition is incentivized with significant bonus (+80 XP)
 * - Gold is VERY slow to farm - purchasing avatars (50 gold) requires ~1000 words found
 * 
 * Example calculations:
 * - Easy, 10 words, no best: 10 XP, 1 gold
 * - Medium, 30 words, no best: 60 XP, 2 gold
 * - Hard, 60 words, no best: 180 XP, 3 gold
 * - Hard, 20 words, new best: 140 XP (60 base + 80 bonus), 2 gold (based on wordsFound, not XP)
 * - To earn 50 gold (avatar price): need ~1000 words found
 * 
 * @param params - Reward calculation parameters
 * @param params.difficulty - Game difficulty level ("easy" | "medium" | "hard")
 * @param params.wordsFound - Number of words found in the session
 * @param params.isNewGlobalBest - Whether this score is a new global best for the difficulty
 * @returns Reward result with XP and gold earned
 */
export function computeEnigmaScrollRewards(params: {
  difficulty: Difficulty;
  wordsFound: number;
  isNewGlobalBest: boolean;
}): { xpEarned: number; goldEarned: number } {
  const { difficulty, wordsFound, isNewGlobalBest } = params;

  // Validate inputs
  if (wordsFound < 0) {
    return { xpEarned: 0, goldEarned: 0 };
  }

  // XP per word found based on difficulty
  // This is the ONLY factor (besides global best bonus) that affects XP
  // Aligned with Speed Verb Challenge: 1 (easy), 2 (medium), 3 (hard)
  const perWord: Record<Difficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  // Base XP = words found × XP per word
  // This is the core reward formula - simple and slow to farm
  let xpBase = wordsFound * perWord[difficulty];

  // Significant bonus for achieving a new global best score on the leaderboard
  // This incentivizes competition and reaching the top of the leaderboard
  // Only applies if the player found at least one word
  // Aligned with Speed Verb Challenge: +80 XP bonus
  if (isNewGlobalBest && wordsFound > 0) {
    xpBase += 80;
  }

  // Gold is calculated based on words found with specific thresholds
  // Formula ensures (aligned with Speed Verb Challenge):
  // - 1 gold at 10 words found
  // - 2 gold at 30 words found
  // - 3 gold at 60 words found
  // Then continues scaling slowly
  let goldEarned = 0;
  if (wordsFound >= 60) {
    // At 60+, give 3 gold and then 1 gold per 20 additional words found
    goldEarned = 3 + Math.floor((wordsFound - 60) / 20);
  } else if (wordsFound >= 30) {
    // At 30-59, give 2 gold
    goldEarned = 2;
  } else if (wordsFound >= 10) {
    // At 10-29, give 1 gold
    goldEarned = 1;
  }
  // Below 10 words found = 0 gold

  return {
    xpEarned: xpBase,
    goldEarned,
  };
}

