"use server";

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
  calculateLevelFromXP,
  type Difficulty,
} from "@/lib/profile/leveling";
import {
  computeEnigmaScrollRewards,
  mapWordLengthToDifficulty,
} from "@/lib/profile/enigma-scroll-rewards";

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
    const rewards = computeEnigmaScrollRewards({
      difficulty,
      wordsFound: params.wordsFound,
      isNewGlobalBest,
    });

    // Only save if it's a new personal best
    if (isNewPersonalBest) {
      // Delete old personal best if it exists
      if (personalBest?.id) {
        await adminClient
          .from("game_scores")
          .delete()
          .eq("id", personalBest.id);
      }

      // Insert the new personal best score
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
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return {
        success: false,
        error: "Failed to update profile",
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

