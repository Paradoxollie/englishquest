"use server";

/**
 * Server Actions for Wordfall
 * 
 * This file contains server actions for:
 * - Submitting game scores
 * - Calculating and applying rewards (XP, gold, level)
 * - Checking for new global best scores
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  calculateLevelFromXP,
  type Difficulty,
} from "@/lib/profile/leveling";

/**
 * Calculate rewards for Wordfall based on score and mode
 */
function computeWordfallRewards(params: {
  mode: "exact" | "free";
  score: number;
  wordsCompleted: number;
  isNewGlobalBest: boolean;
}): {
  xpEarned: number;
  goldEarned: number;
} {
  // Base XP per word completed
  const baseXPPerWord = params.mode === "exact" ? 2 : 3;
  let xpEarned = params.wordsCompleted * baseXPPerWord;
  
  // Score bonus (1 XP per 10 points)
  xpEarned += Math.floor(params.score / 10);
  
  // Global best bonus
  if (params.isNewGlobalBest) {
    xpEarned += 50;
  }
  
  // Gold: 1 gold per 5 XP
  const goldEarned = Math.floor(xpEarned / 5);
  
  return {
    xpEarned,
    goldEarned,
  };
}

/**
 * Map Wordfall mode to difficulty string for database
 */
function mapModeToDifficulty(mode: "exact" | "free"): Difficulty {
  // Map "exact" to "easy" and "free" to "hard" for consistency with other games
  return mode === "exact" ? "easy" : "hard";
}

/**
 * Submit a Wordfall game score and update user rewards.
 * 
 * Flow:
 * 1. Get the game_id for "wordfall" from the games table
 * 2. Query the current top score for the given mode to check if this is a new global best
 * 3. Insert the new game_scores row with:
 *    - user_id (from auth)
 *    - game_id
 *    - score (total score)
 *    - difficulty (easy for exact mode, hard for free mode)
 *    - max_score (words completed)
 *    - duration_ms (game duration)
 * 4. Calculate XP and gold rewards
 * 5. Update profiles table:
 *    - xp = xp + xpEarned
 *    - gold = gold + goldEarned
 *    - level = calculateLevelFromXP(new_xp)
 * 
 * @param params - Game session data
 * @param params.mode - Game mode ("exact" or "free")
 * @param params.score - Total score
 * @param params.wordsCompleted - Number of words completed
 * @param params.durationMs - Game duration in milliseconds
 * @returns Result with success status and rewards earned
 */
export async function submitWordfallScore(params: {
  mode: "exact" | "free";
  score: number;
  wordsCompleted: number;
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

    // Get the Wordfall game ID
    const { data: game, error: gameError } = await adminClient
      .from("games")
      .select("id")
      .eq("slug", "wordfall")
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    // Map mode to difficulty
    const difficulty = mapModeToDifficulty(params.mode);

    // Get user's current personal best score for this mode
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
    const isNewPersonalBest = params.score > currentPersonalBest;

    // Check if this is a new global best score for this mode
    const { data: globalTopScore } = await adminClient
      .from("game_scores")
      .select("score")
      .eq("game_id", game.id)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentGlobalBest = globalTopScore?.score ?? 0;
    const isNewGlobalBest = params.score > currentGlobalBest;

    // Calculate rewards (always calculate, even if not saving)
    const rewards = computeWordfallRewards({
      mode: params.mode,
      score: params.score,
      wordsCompleted: params.wordsCompleted,
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
          score: params.score,
          max_score: params.wordsCompleted,
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
      personalBest: isNewPersonalBest ? params.score : currentPersonalBest,
    };
  } catch (error) {
    console.error("Error in submitWordfallScore:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

