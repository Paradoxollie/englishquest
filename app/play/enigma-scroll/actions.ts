"use server";
import { gamePerformance } from "@/lib/profile/economy";
import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { syncBadgesSafely, type NewBadge } from "@/lib/profile/badges-server";

/**
 * Server Actions for Enigma Scroll
 * 
 * Handles:
 * - Submitting game scores
 * - Calculating and applying rewards (XP, gold, level)
 * - Checking for new global best scores
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  mapWordLengthToDifficulty,
} from "@/lib/profile/enigma-scroll-rewards";
import { gameAuthFailure, interruptedGameSave, saveGameScore } from "@/lib/games/score-settlement";
import { checkEnigmaScroll } from "@/lib/games/score-plausibility";

/**
 * Submit an Enigma Scroll game score and update user rewards.
 * 
 * @param params - Game session data
 * @param params.wordLength - Word length (4=easy, 5=medium, 6=hard)
 * @param params.totalScore - Total score from the session
 * @param params.wordsFound - Number of words found
 * @param params.durationMs - Total game duration in milliseconds
 * @returns Result with success status and rewards earned
 */
export async function submitEnigmaScrollScore(params: {
  wordLength: 4 | 5 | 6;
  totalScore: number;
  wordsFound: number;
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
  personalBest?: number | null;
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
    if (![4, 5, 6].includes(params.wordLength) ||
      ![params.totalScore, params.wordsFound, params.durationMs].every(value => Number.isSafeInteger(value) && value >= 0) ||
      params.totalScore > 1_000_000 || params.wordsFound > 20_000 || params.durationMs > 2 * 60 * 60 * 1000) {
      return { success: false, error: "Score Enigma Scroll invalide" };
    }
    if (!checkEnigmaScroll(params).ok) {
      return { success: false, error: "Score Enigma Scroll invraisemblable" };
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

    const saved = await saveGameScore({
      userId: user.id, slug: "enigma-scroll", sessionId: params.sessionId,
      score: params.totalScore, maxScore: params.wordsFound, durationMs: params.durationMs,
      difficulty: mapWordLengthToDifficulty(params.wordLength), performance: gamePerformance.enigmaScroll(params.wordsFound),
      recordEligible: params.totalScore > 0,
    });
    if (!saved.ok) return { success: false, error: saved.error, retryable: saved.retryable };
    const { rewards, playsToday, isNewPersonalBest, isNewGlobalBest } = saved.receipt;

    // Check and grant Daily Challenge bonus (seulement si au moins un mot trouvé)
    const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
    const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "enigma-scroll", {
      eligible: rewards.xpEarned > 0, earnedAt: saved.receipt.savedAt,
    });
    const courseCompleted = saved.receipt.replayed ? null : await autoCompleteCourseMissionForGame(user.id, "enigma-scroll", params.totalScore);
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
      personalBest: saved.receipt.previousBest,
    };
  } catch (error) {
    console.error("Error submitting Enigma Scroll score:", error);
    return interruptedGameSave;
  }
}
