"use server";

/**
 * Server Actions for Lexicon Blaster (Space Lex)
 * 
 * This file contains server actions for:
 * - Submitting game scores
 * - Calculating and applying rewards (XP, gold, level)
 * - Checking for new global best scores
 * 
 * Note: This game has NO difficulty levels - all scores use "medium" as default
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateLevelFromXP } from "@/lib/profile/leveling";

// Default difficulty for all Lexicon Blaster scores (no difficulty selection in this game)
const DEFAULT_DIFFICULTY = "medium" as const;

/**
 * Calculate rewards for Lexicon Blaster based on performance
 */
function computeLexiconBlasterRewards(params: {
    score: number;
    wave: number;
    wordsMastered: number;
    maxCombo: number;
    isNewGlobalBest: boolean;
}): {
    xpEarned: number;
    goldEarned: number;
} {
    // Base XP from score (1 XP per 50 points)
    let xpEarned = Math.floor(params.score / 50);

    // Wave bonus (5 XP per wave reached)
    xpEarned += params.wave * 5;

    // Words mastered bonus (2 XP per word)
    xpEarned += params.wordsMastered * 2;

    // Combo bonus (1 XP per max combo point)
    xpEarned += params.maxCombo;

    // Global best bonus
    if (params.isNewGlobalBest) {
        xpEarned += 100;
    }

    // Gold: 1 gold per 4 XP
    const goldEarned = Math.floor(xpEarned / 4);

    return {
        xpEarned,
        goldEarned,
    };
}

/**
 * Submit a Lexicon Blaster game score and update user rewards.
 * 
 * Flow:
 * 1. Get the game_id for "space-lex" from the games table
 * 2. Query the current top score to check if this is a new global best
 * 3. Insert the new game_scores row
 * 4. Calculate XP and gold rewards
 * 5. Update profiles table with new XP, gold, and level
 */
export async function submitLexiconBlasterScore(params: {
    score: number;
    wave: number;
    maxCombo: number;
    wordsMastered: number;
    wordsMissed: number;
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

        // Get the Lexicon Blaster game ID
        const { data: game, error: gameError } = await adminClient
            .from("games")
            .select("id")
            .eq("slug", "space-lex")
            .single();

        if (gameError || !game) {
            console.error("Game not found:", gameError);
            return {
                success: false,
                error: "Game not found in database. Please run the SQL migration.",
            };
        }

        // Get user's current personal best score (no difficulty filter - global for this game)
        const { data: personalBest } = await adminClient
            .from("game_scores")
            .select("id, score")
            .eq("user_id", user.id)
            .eq("game_id", game.id)
            .order("score", { ascending: false })
            .limit(1)
            .maybeSingle();

        const currentPersonalBest = personalBest?.score ?? 0;
        const isNewPersonalBest = params.score > currentPersonalBest;

        // Check if this is a new global best score (no difficulty filter)
        const { data: globalTopScore } = await adminClient
            .from("game_scores")
            .select("score")
            .eq("game_id", game.id)
            .order("score", { ascending: false })
            .limit(1)
            .maybeSingle();

        const currentGlobalBest = globalTopScore?.score ?? 0;
        const isNewGlobalBest = params.score > currentGlobalBest;

        // Calculate rewards
        const rewards = computeLexiconBlasterRewards({
            score: params.score,
            wave: params.wave,
            wordsMastered: params.wordsMastered,
            maxCombo: params.maxCombo,
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
                }
            }

            // Insert the new personal best score
            const { error: insertError } = await adminClient
                .from("game_scores")
                .insert({
                    user_id: user.id,
                    game_id: game.id,
                    score: params.score,
                    max_score: params.wave, // Use max_score to store wave reached
                    duration_ms: params.durationMs,
                    difficulty: DEFAULT_DIFFICULTY, // Always use default difficulty
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

        // Check and grant Daily Challenge bonus
        const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
        const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "space-lex");

        return {
            success: true,
            rewards: {
                xpEarned: rewards.xpEarned,
                goldEarned: rewards.goldEarned,
                newLevel: newLevel > profile.level ? newLevel : undefined,
            },
            dailyChallenge: dailyChallengeResult,
            isNewPersonalBest,
            isNewGlobalBest,
            personalBest: isNewPersonalBest ? params.score : currentPersonalBest,
        };
    } catch (error) {
        console.error("Error in submitLexiconBlasterScore:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}
