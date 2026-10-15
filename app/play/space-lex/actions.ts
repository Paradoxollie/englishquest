"use server";
import { computeGameRewards, gamePerformance } from "@/lib/profile/economy";
import { countPlaysToday, grantProfileRewards } from "@/lib/profile/economy-server";
import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { syncBadgesSafely, type NewBadge } from "@/lib/profile/badges-server";

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

// Default difficulty for all Lexicon Blaster scores (no difficulty selection in this game)
const DEFAULT_DIFFICULTY = "medium" as const;

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
        if (![params.score, params.wave, params.maxCombo, params.wordsMastered, params.wordsMissed, params.durationMs]
            .every(value => Number.isSafeInteger(value) && value >= 0) || params.wave < 1 || params.wave > 1_000 ||
            params.score > 1_000_000 || params.maxCombo > 20_000 || params.wordsMastered > 20_000 ||
            params.wordsMissed > 20_000 || params.durationMs > 2 * 60 * 60 * 1000) {
            return { success: false, error: "Score Space Lex invalide" };
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
        const playsToday = await countPlaysToday(adminClient, user.id, game.id);
        const rewards = computeGameRewards({
            performance: gamePerformance.lexiconBlaster(params.wordsMastered, params.wave),
            difficulty: DEFAULT_DIFFICULTY,
            playsToday,
            isNewPersonalBest,
            isNewGlobalBest,
        });

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


        const updatedProfile = await grantProfileRewards(adminClient, user.id, {
            xp: rewards.xpEarned,
            gold: rewards.goldEarned,
        });

        // Check and grant Daily Challenge bonus
        const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
        const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "space-lex");
        const courseCompleted = await autoCompleteCourseMissionForGame(user.id, "space-lex", params.score);
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
