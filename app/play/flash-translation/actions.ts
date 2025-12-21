"use server";

/**
 * Server Actions for Flash Translation
 * 
 * This file contains server actions for:
 * - Submitting game scores
 * - Calculating and applying rewards (XP, gold, level)
 * - Checking for new global best scores
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateLevelFromXP } from "@/lib/profile/leveling";

/**
 * Calculate rewards for Flash Translation based on performance
 * Lower time = better performance = more rewards
 */
function computeFlashTranslationRewards(params: {
    totalTimeMs: number;
    wrongAnswers: number;
    isNewGlobalBest: boolean;
}): {
    xpEarned: number;
    goldEarned: number;
} {
    // Base rewards: XP only, NO Gold for just playing
    let xp = 5;
    let gold = 0;

    // Bonus for perfect score: Gives 2 Gold (Valid farming strategy)
    if (params.wrongAnswers === 0) {
        xp += 15;
        gold += 2;
    }

    // Bonus for fast time: Gives +1 Gold
    if (params.totalTimeMs < 10000) {
        xp += 10;
        gold += 1;
    } else if (params.totalTimeMs < 15000) {
        xp += 5;
        // No gold for slower times
    }

    // Penalty for wrong answers
    xp = Math.max(1, xp - (params.wrongAnswers * 2));
    // Gold can't go negative, stays at calculation result

    // ONE-TIME Bonus for Global Best
    // Reward is XP focused (Prestige). Gold is symbolic.
    if (params.isNewGlobalBest) {
        xp += 50;
        gold += 10;
    }

    return { xpEarned: xp, goldEarned: gold };
}

/**
 * Submit a Flash Translation game score and update user rewards.
 * 
 * Flow:
 * 1. Get the game_id for "flash-translation" from the games table
 * 2. Query the current top score (lowest time) to check if this is a new global best
 * 3. Insert the new game_scores row (only if it's a new personal best)
 * 4. Calculate rewards based on performance
 * 5. Update profiles table with XP, gold, and level
 * 
 * @param params - Game session data
 * @param params.totalTimeMs - Total time in milliseconds (lower is better)
 * @param params.averageReactionTimeMs - Average reaction time per round
 * @param params.wrongAnswers - Number of wrong answers
 * @param params.roundsCompleted - Total rounds completed (should be 10)
 * @returns Result with success status and rewards earned
 */
export async function submitFlashTranslationScore(params: {
    totalTimeMs: number;
    averageReactionTimeMs: number;
    wrongAnswers: number;
    roundsCompleted: number;
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

        // Get the Flash Translation game ID
        const { data: game, error: gameError } = await adminClient
            .from("games")
            .select("id")
            .eq("slug", "flash-translation")
            .single();

        if (gameError || !game) {
            return {
                success: false,
                error: "Game not found",
            };
        }

        // Get user's current personal best score (lowest time)
        const { data: personalBest } = await adminClient
            .from("game_scores")
            .select("id, score")
            .eq("user_id", user.id)
            .eq("game_id", game.id)
            .order("score", { ascending: true }) // Lower is better
            .limit(1)
            .maybeSingle();

        const currentPersonalBest = personalBest?.score ?? Infinity;
        const isNewPersonalBest = params.totalTimeMs < currentPersonalBest;

        // Check if this is a new global best score (lowest time)
        const { data: globalTopScore } = await adminClient
            .from("game_scores")
            .select("score")
            .eq("game_id", game.id)
            .order("score", { ascending: true }) // Lower is better
            .limit(1)
            .maybeSingle();

        const currentGlobalBest = globalTopScore?.score ?? Infinity;
        const isNewGlobalBest = params.totalTimeMs < currentGlobalBest;

        // Calculate rewards
        const rewards = computeFlashTranslationRewards({
            totalTimeMs: params.totalTimeMs,
            wrongAnswers: params.wrongAnswers,
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
                    score: params.totalTimeMs, // Lower is better
                    max_score: params.roundsCompleted,
                    duration_ms: params.totalTimeMs,
                    difficulty: "medium", // Default difficulty for this game
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
        const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "flash-translation");

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
            personalBest: isNewPersonalBest ? params.totalTimeMs : currentPersonalBest,
        };
    } catch (error) {
        console.error("Error in submitFlashTranslationScore:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}

/**
 * Get top 3 scores for TopScoresDisplay
 * Uses AdminClient to bypass RLS ensuring usernames are visible
 */
export async function getFlashTranslationTopScores() {
    const adminClient = createSupabaseAdminClient();

    // Get the Flash Translation game ID
    const { data: game } = await adminClient
        .from("games")
        .select("id")
        .eq("slug", "flash-translation")
        .single();

    if (!game) return [];

    // Get all scores for this game
    const { data: scores } = await adminClient
        .from("game_scores")
        .select("user_id, score")
        .eq("game_id", game.id)
        .order("score", { ascending: true }) // Lower is better
        .limit(10); // Check top 10 to find unique users

    if (!scores || scores.length === 0) return [];

    // Get unique user IDs
    const userIds = [...new Set(scores.map((s) => s.user_id))];

    // Fetch usernames
    const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const profileMap = new Map(
        (profiles || []).map((p) => [p.id, p.username])
    );

    // Fetch equipped items
    const { data: equippedItems } = await adminClient
        .from("user_equipped_items")
        .select(`
          user_id,
          equipped_avatar:shop_items!equipped_avatar_id(*),
          equipped_background:shop_items!equipped_background_id(*),
          equipped_title:shop_items!equipped_title_id(*)
        `)
        .in("user_id", userIds);

    const equippedMap = new Map();
    if (equippedItems) {
        for (const item of equippedItems) {
            const avatar = Array.isArray(item.equipped_avatar) ? item.equipped_avatar[0] : item.equipped_avatar;
            const background = Array.isArray(item.equipped_background) ? item.equipped_background[0] : item.equipped_background;
            const title = Array.isArray(item.equipped_title) ? item.equipped_title[0] : item.equipped_title;
            equippedMap.set(item.user_id, { avatar, background, title });
        }
    }

    // Group by user and get best score
    const userBestScores = new Map<string, number>();
    for (const score of scores) {
        const current = userBestScores.get(score.user_id);
        if (current === undefined || score.score < current) { // Lower is better
            userBestScores.set(score.user_id, score.score);
        }
    }

    // Create top scores array
    return Array.from(userBestScores.entries())
        .map(([userId, score]) => {
            const equipped = equippedMap.get(userId);
            return {
                user_id: userId,
                username: profileMap.get(userId) || "Unknown",
                score,
                rank: 0,
                equipped_avatar: equipped?.avatar || null,
                equipped_background: equipped?.background || null,
                equipped_title: equipped?.title || null,
            };
        })
        .sort((a, b) => a.score - b.score) // Lower is better
        .slice(0, 3)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
}

/**
 * Get full leaderboard for FlashTranslationLeaderboard
 */
export async function getFlashTranslationGameLeaderboard() {
    const adminClient = createSupabaseAdminClient();

    // Get the Flash Translation game ID
    const { data: game } = await adminClient
        .from("games")
        .select("id")
        .eq("slug", "flash-translation")
        .single();

    if (!game) return [];

    // Query: Get all scores for this game
    const { data: scores, error } = await adminClient
        .from("game_scores")
        .select("user_id, score")
        .eq("game_id", game.id)
        .order("score", { ascending: true }); // Lower is better

    if (error || !scores || scores.length === 0) return [];

    // Get unique user IDs
    const userIds = [...new Set(scores.map((s) => s.user_id))];

    // Fetch usernames
    const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const profileMap = new Map(
        (profiles || []).map((p) => [p.id, p.username])
    );

    // Fetch equipped items
    const { data: equippedItems } = await adminClient
        .from("user_equipped_items")
        .select(`
          user_id,
          equipped_avatar:shop_items!equipped_avatar_id(*),
          equipped_background:shop_items!equipped_background_id(*),
          equipped_title:shop_items!equipped_title_id(*)
        `)
        .in("user_id", userIds);

    const equippedMap = new Map();
    if (equippedItems) {
        for (const item of equippedItems) {
            const avatar = Array.isArray(item.equipped_avatar) ? item.equipped_avatar[0] : item.equipped_avatar;
            const background = Array.isArray(item.equipped_background) ? item.equipped_background[0] : item.equipped_background;
            const title = Array.isArray(item.equipped_title) ? item.equipped_title[0] : item.equipped_title;
            equippedMap.set(item.user_id, { avatar, background, title });
        }
    }

    // Group scores by user_id
    const userStats = new Map();
    for (const scoreEntry of scores) {
        const existing = userStats.get(scoreEntry.user_id);
        if (!existing) {
            userStats.set(scoreEntry.user_id, {
                bestScore: scoreEntry.score,
                gamesPlayed: 1,
            });
        } else {
            userStats.set(scoreEntry.user_id, {
                bestScore: Math.min(existing.bestScore, scoreEntry.score), // Lower is better
                gamesPlayed: existing.gamesPlayed + 1,
            });
        }
    }

    // Create leaderboard entries
    return Array.from(userStats.entries())
        .map(([userId, stats]: [string, any]) => {
            const equipped = equippedMap.get(userId);
            return {
                user_id: userId,
                username: profileMap.get(userId) || "Unknown",
                best_score: stats.bestScore,
                games_played: stats.gamesPlayed,
                rank: 0,
                equipped_avatar: equipped?.avatar || null,
                equipped_background: equipped?.background || null,
                equipped_title: equipped?.title || null,
            };
        })
        .sort((a, b) => a.best_score - b.best_score) // Lower is better
        .map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
}
