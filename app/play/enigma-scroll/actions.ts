"use server";
import { computeGameRewards, gamePerformance } from "@/lib/profile/economy";
import { countPlaysToday, grantProfileRewards } from "@/lib/profile/economy-server";
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
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  mapWordLengthToDifficulty,
} from "@/lib/profile/enigma-scroll-rewards";
import { consumeGameSession } from "@/lib/games/game-session-server";
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
  error?: string;
  rewards?: {
    xpEarned: number;
    goldEarned: number;
    newLevel?: number;
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
    const adminClient = createSupabaseAdminClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const gameSession = await consumeGameSession({
      sessionId: params.sessionId,
      userId: user.id,
      slug: "enigma-scroll",
      claimedDurationMs: params.durationMs,
    });
    if (!gameSession.ok) {
      return { success: false, error: gameSession.error };
    }

    // Get the Enigma Scroll game ID
    const { data: game, error: gameError } = await adminClient
      .from("games")
      .select("id")
      .eq("slug", "enigma-scroll")
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Game not found. Please ensure the game is registered in Supabase.",
      };
    }

    // Map word length to difficulty
    const difficulty = mapWordLengthToDifficulty(params.wordLength);

    // Get user's current personal best for this difficulty
    const { data: personalBest } = await adminClient
      .from("game_scores")
      .select("id, score")
      .eq("user_id", user.id)
      .eq("game_id", game.id)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false })
      .limit(1)
      .single();

    const isNewPersonalBest = !personalBest || params.totalScore > personalBest.score;

    // Get global best score for this difficulty
    const { data: globalTopScore } = await adminClient
      .from("game_scores")
      .select("score")
      .eq("game_id", game.id)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false })
      .limit(1)
      .single();

    const currentGlobalBest = globalTopScore?.score ?? 0;
    const isNewGlobalBest = params.totalScore > currentGlobalBest;

    // Calculate rewards
    const playsToday = await countPlaysToday(adminClient, user.id, game.id);
    const rewards = computeGameRewards({
      performance: gamePerformance.enigmaScroll(params.wordsFound),
      difficulty,
      playsToday,
      isNewPersonalBest,
      isNewGlobalBest,
    });

    const { error: insertError } = await adminClient
      .from("game_scores")
      .insert({
        user_id: user.id,
        game_id: game.id,
        score: params.totalScore,
        max_score: params.wordsFound, // Store words found as max_score
        duration_ms: params.durationMs,
        difficulty: difficulty,
      });

    if (insertError) {
      console.error("Error inserting game score:", insertError);
      return {
        success: false,
        error: "Failed to save score",
      };
    }


    const updatedProfile = await grantProfileRewards(adminClient, user.id, {
      xp: rewards.xpEarned,
      gold: rewards.goldEarned,
    });

    // Check and grant Daily Challenge bonus
    // This is done after the game rewards are applied
    const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
    const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "enigma-scroll");
    const courseCompleted = await autoCompleteCourseMissionForGame(user.id, "enigma-scroll", params.totalScore);
    const newBadges = await syncBadgesSafely(user.id);

    return {
      success: true,
      rewards: {
        xpEarned: rewards.xpEarned,
        goldEarned: rewards.goldEarned,
        newLevel: updatedProfile.level > updatedProfile.previousLevel ? updatedProfile.level : undefined,
      },
      dailyChallenge: dailyChallengeResult,
      courseCompleted,
      newBadges,
      isNewPersonalBest,
      isNewGlobalBest,
      personalBest: personalBest?.score ?? null,
    };
  } catch (error) {
    console.error("Error submitting Enigma Scroll score:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
