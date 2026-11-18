"use server";
import { gamePerformance } from "@/lib/profile/economy";
import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { syncBadgesSafely, type NewBadge } from "@/lib/profile/badges-server";

/**
 * Server Actions for Speed Verb Challenge
 * 
 * This file contains server actions for:
 * - Submitting game scores
 * - Calculating and applying rewards (XP, gold, level)
 * - Checking for new global best scores
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Difficulty } from "@/lib/profile/leveling";
import { gameAuthFailure, interruptedGameSave, saveGameScore } from "@/lib/games/score-settlement";
import { checkSpeedVerb } from "@/lib/games/score-plausibility";

/**
 * Submit a Speed Verb Challenge game score and update user rewards.
 * 
 * Flow:
 * 1. Get the game_id for "speed-verb-challenge" from the games table
 * 2. Query the current top score for the given difficulty to check if this is a new global best
 * 3. Insert the new game_scores row with:
 *    - user_id (from auth)
 *    - game_id
 *    - score (TOTAL SCORE with streak bonuses, not just correct count)
 *    - difficulty (easy/medium/hard)
 *    - max_score (optional, can be null)
 *    - duration_ms (optional, can be null)
 * 4. Call computeSpeedVerbRewards to calculate XP and gold (based on correctCount, not score)
 * 5. Update profiles table:
 *    - xp = xp + xpEarned
 *    - gold = gold + goldEarned
 *    - level = calculateLevelFromXP(new_xp)
 * 
 * IMPORTANT: The score saved is the TOTAL POINTS (with streak bonuses), not just the number of correct answers.
 * Rewards (XP/gold) are calculated based on correctCount, but the leaderboard uses the total score.
 * 
 * @param params - Game session data
 * @param params.difficulty - Difficulty level (1=easy, 2=medium, 3=hard)
 * @param params.score - Total score with streak bonuses (this is what gets saved and compared)
 * @param params.correctCount - Number of correct answers (used for XP/gold rewards calculation)
 * @param params.totalRounds - Total number of rounds attempted
 * @param params.durationMs - Game duration in milliseconds
 * @returns Result with success status and rewards earned
 */
export async function submitSpeedVerbScore(params: {
  difficulty: 1 | 2 | 3;
  score: number; // Total score with streak bonuses
  correctCount: number; // Number of correct answers (for rewards)
  totalRounds: number;
  durationMs: number;
  sessionId?: string | null;
}): Promise<{
  success: boolean;
  retryable?: boolean;
  error?: string;
  rewards?: {
    xpEarned: number;
    goldEarned: number;
    newLevel?: number;
    reduced?: boolean;
    breakdown?: { base: number; personalBest: number; globalBest: number };
    playsUsedToday?: number;
  };
  isNewPersonalBest?: boolean;
  isNewGlobalBest?: boolean;
  personalBest?: number;
  courseCompleted?: AutoCompletedCourse | null;
  newBadges?: NewBadge[];
  dailyChallenge?: {
    dailyPlayedGames: string[];
    requiredGames: string[];
    bonusGranted: boolean;
    xpBonus: number;
    goldBonus: number;
    dailyGoalReached: boolean;
    newLevel?: number | null;
  };
}> {
  try {
    if (
      ![1, 2, 3].includes(params.difficulty) ||
      !Number.isSafeInteger(params.score) || params.score < 0 || params.score > 1_000_000 ||
      !Number.isSafeInteger(params.correctCount) || params.correctCount < 0 || params.correctCount > 5_000 ||
      !Number.isSafeInteger(params.totalRounds) || params.totalRounds < params.correctCount || params.totalRounds > 5_000 ||
      !Number.isSafeInteger(params.durationMs) || params.durationMs < 0 || params.durationMs > 2 * 60 * 60 * 1000
    ) {
      return { success: false, error: "Score Speed Verb Challenge invalide" };
    }
    if (!checkSpeedVerb(params).ok) {
      return { success: false, error: "Score Speed Verb Challenge invraisemblable" };
    }
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return gameAuthFailure(userError);
    }

    const difficulty = ({ 1: "easy", 2: "medium", 3: "hard" } as const)[params.difficulty];
    const saved = await saveGameScore({
      userId: user.id, slug: "speed-verb-challenge", sessionId: params.sessionId,
      score: params.score, maxScore: params.totalRounds, durationMs: params.durationMs,
      difficulty, performance: gamePerformance.speedVerb(params.correctCount, difficulty),
      recordEligible: params.score > 0,
    });
    if (!saved.ok) return { success: false, error: saved.error, retryable: saved.retryable };
    const { rewards, playsToday, isNewPersonalBest, isNewGlobalBest } = saved.receipt;

    // Check and grant Daily Challenge bonus
    const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
    const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "speed-verb-challenge", {
      eligible: rewards.xpEarned > 0, earnedAt: saved.receipt.savedAt,
    });
    const courseCompleted = saved.receipt.replayed ? null : await autoCompleteCourseMissionForGame(user.id, "speed-verb-challenge", params.score);
    const newBadges = await syncBadgesSafely(user.id);
    const gameNewLevel = saved.receipt.level > saved.receipt.previousLevel ? saved.receipt.level : 0;
    const mergedNewLevel = Math.max(gameNewLevel, dailyChallengeResult.newLevel ?? 0) || undefined;

    return {
      success: true,
      rewards: {
        xpEarned: rewards.xpEarned,
        goldEarned: rewards.goldEarned,
        newLevel: mergedNewLevel,
        reduced: rewards.reduced,
        breakdown: rewards.breakdown,
        playsUsedToday: playsToday + 1,
      },
      dailyChallenge: dailyChallengeResult,
      courseCompleted,
      newBadges,
      isNewPersonalBest,
      isNewGlobalBest,
      personalBest: isNewPersonalBest ? params.score : (saved.receipt.previousBest ?? 0),
    };
  } catch (error) {
    console.error("Error in submitSpeedVerbScore:", error);
    return interruptedGameSave;
  }
}
