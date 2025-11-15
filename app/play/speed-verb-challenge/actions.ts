"use server";

/**
 * Server Actions for Speed Verb Challenge
 * 
 * This file contains server actions for:
 * - Submitting game scores
 * - Calculating and applying rewards (XP, gold, level)
 * - Checking for new global best scores
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  computeSpeedVerbRewards,
  calculateLevelFromXP,
  type Difficulty,
} from "@/lib/profile/leveling";

/**
 * Submit a Speed Verb Challenge game score and update user rewards.
 * 
 * Flow:
 * 1. Get the game_id for "speed-verb-challenge" from the games table
 * 2. Query the current top score for the given difficulty to check if this is a new global best
 * 3. Insert the new game_scores row with:
 *    - user_id (from auth)
 *    - game_id
 *    - score (number of correct answers)
 *    - difficulty (easy/medium/hard)
 *    - max_score (optional, can be null)
 *    - duration_ms (optional, can be null)
 * 4. Call computeSpeedVerbRewards to calculate XP and gold
 * 5. Update profiles table:
 *    - xp = xp + xpEarned
 *    - gold = gold + goldEarned
 *    - level = calculateLevelFromXP(new_xp)
 * 
 * @param params - Game session data
 * @param params.difficulty - Difficulty level (1=easy, 2=medium, 3=hard)
 * @param params.correctCount - Number of correct answers
 * @param params.totalRounds - Total number of rounds attempted
 * @param params.durationMs - Game duration in milliseconds
 * @returns Result with success status and rewards earned
 */
export async function submitSpeedVerbScore(params: {
  difficulty: 1 | 2 | 3;
  correctCount: number;
  totalRounds: number;
  durationMs: number;
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
  personalBest?: number;
}> {
  try {
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

    // Get the Speed Verb Challenge game ID
    const { data: game, error: gameError } = await adminClient
      .from("games")
      .select("id")
      .eq("slug", "speed-verb-challenge")
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    // Map difficulty number to string
    const difficultyMap: Record<1 | 2 | 3, Difficulty> = {
      1: "easy",
      2: "medium",
      3: "hard",
    };
    const difficulty = difficultyMap[params.difficulty];

    // Get user's current personal best score for this difficulty
    const { data: personalBest } = await adminClient
      .from("game_scores")
      .select("id, score")
      .eq("user_id", user.id)
      .eq("game_id", game.id)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentPersonalBest = personalBest?.score ?? 0;
    const isNewPersonalBest = params.correctCount > currentPersonalBest;

    // Check if this is a new global best score for this difficulty
    const { data: globalTopScore } = await adminClient
      .from("game_scores")
      .select("score")
      .eq("game_id", game.id)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentGlobalBest = globalTopScore?.score ?? 0;
    const isNewGlobalBest = params.correctCount > currentGlobalBest;

    // Calculate rewards (always calculate, even if not saving)
    const rewards = computeSpeedVerbRewards({
      difficulty,
      correctCount: params.correctCount,
      isNewGlobalBest,
    });

    // Only save if it's a new personal best
    if (isNewPersonalBest) {
      // Delete old personal best if it exists
      if (personalBest?.id) {
        const { error: deleteError } = await adminClient
          .from("game_scores")
          .delete()
          .eq("id", personalBest.id);

        if (deleteError) {
          console.error("Error deleting old personal best:", deleteError);
          // Continue anyway, we'll try to insert the new one
        }
      }

      // Insert the new personal best score
      const { error: insertError } = await adminClient
        .from("game_scores")
        .insert({
          user_id: user.id,
          game_id: game.id,
          score: params.correctCount,
          max_score: params.totalRounds,
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
    }

    // Update user profile with rewards
    const { data: profile } = await adminClient
      .from("profiles")
      .select("xp, gold, level")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return {
        success: false,
        error: "Profile not found",
      };
    }

    const newXP = profile.xp + rewards.xpEarned;
    const newGold = profile.gold + rewards.goldEarned;
    const newLevel = calculateLevelFromXP(newXP);

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        xp: newXP,
        gold: newGold,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return {
        success: false,
        error: "Failed to update rewards",
      };
    }

    return {
      success: true,
      rewards: {
        xpEarned: rewards.xpEarned,
        goldEarned: rewards.goldEarned,
        newLevel: newLevel > profile.level ? newLevel : undefined,
      },
      isNewPersonalBest,
      isNewGlobalBest,
      personalBest: isNewPersonalBest ? params.correctCount : currentPersonalBest,
    };
  } catch (error) {
    console.error("Error in submitSpeedVerbScore:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

