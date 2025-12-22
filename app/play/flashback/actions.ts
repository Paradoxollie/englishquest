"use server";

/**
 * Server Actions for Echo Lex
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateLevelFromXP } from "@/lib/profile/leveling";

const DEFAULT_DIFFICULTY = "medium" as const;

/**
 * Calculate rewards for Echo Lex based on performance
 * Optimized for FARMING as requested.
 */
async function resolveFlashbackGameId(adminClient: any) {
    // Try new slug first
    let { data: game } = await adminClient
        .from("games")
        .select("id")
        .eq("slug", "flashback")
        .maybeSingle();

    // Fallback to old slug if not found
    if (!game) {
        const { data: oldGame } = await adminClient
            .from("games")
            .select("id")
            .eq("slug", "echo-lex")
            .maybeSingle();
        game = oldGame;
    }
    return game;
}

function computeEchoLexRewards(params: {
    score: number;
    isNewPersonalBest: boolean;
    isNewGlobalBest: boolean;
    durationMs: number;
}): {
    xpEarned: number;
    goldEarned: number;
} {
    // VERY LOW REWARDS to encourage "hard farming"
    // Base XP: 1 XP per 2 correct words
    let xpEarned = Math.floor(params.score / 2);

    // Gold: 1 Gold every 10 correct words
    let goldEarned = Math.floor(params.score / 10);

    // Speed bonus: 1 Gold for every 2 minutes of play
    const durationMinutes = params.durationMs / (1000 * 120);
    goldEarned += Math.floor(durationMinutes);

    // Personal Best Bonus (Small)
    if (params.isNewPersonalBest) {
        xpEarned += 5;
        goldEarned += 1;
    }

    // Global Best Bonus (Prestige)
    if (params.isNewGlobalBest) {
        xpEarned += 20;
        goldEarned += 5;
    }

    // Ensure at least 1 XP if they scored anything
    if (params.score > 0 && xpEarned === 0) xpEarned = 1;

    return {
        xpEarned,
        goldEarned,
    };
}

/**
 * Submit an Echo Lex game score
 */
export async function submitEchoLexScore(params: {
    score: number;
    durationMs: number;
}) {
    try {
        const supabase = await createSupabaseServerClient();
        const adminClient = createSupabaseAdminClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { success: false, error: "User not authenticated" };
        }

        // Get the Echo Lex game ID
        const game = await resolveFlashbackGameId(adminClient);

        if (!game) {
            return { success: false, error: "Game not found" };
        }

        // Check FB and GB
        const { data: personalBest } = await adminClient
            .from("game_scores")
            .select("id, score")
            .eq("user_id", user.id)
            .eq("game_id", game.id)
            .order("score", { ascending: false })
            .limit(1)
            .maybeSingle();

        const currentPB = personalBest?.score ?? 0;
        const isNewPB = params.score > currentPB;

        const { data: globalTopScore } = await adminClient
            .from("game_scores")
            .select("score")
            .eq("game_id", game.id)
            .order("score", { ascending: false })
            .limit(1)
            .maybeSingle();

        const currentGB = globalTopScore?.score ?? 0;
        const isNewGB = params.score > currentGB;

        const rewards = computeEchoLexRewards({
            score: params.score,
            isNewPersonalBest: isNewPB,
            isNewGlobalBest: isNewGB,
            durationMs: params.durationMs,
        });

        if (isNewPB) {
            if (personalBest?.id) {
                await adminClient.from("game_scores").delete().eq("id", personalBest.id);
            }

            await adminClient.from("game_scores").insert({
                user_id: user.id,
                game_id: game.id,
                score: params.score,
                duration_ms: params.durationMs,
                difficulty: DEFAULT_DIFFICULTY,
            });
        }

        // Update profile
        const { data: profile } = await adminClient
            .from("profiles")
            .select("xp, gold, level")
            .eq("id", user.id)
            .single();

        if (profile) {
            const newXP = profile.xp + rewards.xpEarned;
            const newGold = profile.gold + rewards.goldEarned;
            const newLevel = calculateLevelFromXP(newXP);

            await adminClient.from("profiles").update({
                xp: newXP,
                gold: newGold,
                level: newLevel,
                updated_at: new Date().toISOString(),
            }).eq("id", user.id);

            // Daily Challenge
            const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
            const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "flashback");

            return {
                success: true,
                rewards: {
                    xpEarned: rewards.xpEarned,
                    goldEarned: rewards.goldEarned,
                    newLevel: newLevel > profile.level ? newLevel : undefined,
                },
                isNewPersonalBest: isNewPB,
                isNewGlobalBest: isNewGB,
                dailyChallenge: dailyChallengeResult,
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in submitEchoLexScore:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Fetch top scores for Echo Lex
 */
export async function getEchoLexTopScores() {
    try {
        const adminClient = createSupabaseAdminClient();

        const game = await resolveFlashbackGameId(adminClient);

        if (!game) return [];

        // 1. Get top scores
        const { data: scores } = await adminClient
            .from("game_scores")
            .select("user_id, score")
            .eq("game_id", game.id)
            .order("score", { ascending: false })
            .limit(10); // Fetch more to handle duplicates if any

        if (!scores || scores.length === 0) return [];

        // 2. Get unique User IDs
        const userIds = [...new Set(scores.map(s => s.user_id))];

        // 3. Fetch Profiles
        const { data: profiles } = await adminClient
            .from("profiles")
            .select("id, username")
            .in("id", userIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p.username]));

        // 4. Fetch Equipped Items
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

        // 5. Combine and Sort
        // Since we fetched multiple scores, we need to pick the best per user if duplicates exist
        const uniqueScores = scores
            .filter((s, index, self) => index === self.findIndex(t => t.user_id === s.user_id))
            .slice(0, 3);

        return uniqueScores.map((s, i) => {
            const equipped = equippedMap.get(s.user_id);
            return {
                rank: i + 1,
                score: s.score,
                username: profileMap.get(s.user_id) || "Unknown",
                user_id: s.user_id,
                equippedAvatar: equipped?.avatar || null,
                equippedBackground: equipped?.background || null,
                equippedTitle: equipped?.title || null,
            };
        });
    } catch (error) {
        console.error("Error fetching top scores:", error);
        return [];
    }
}

/**
 * Fetch personal best for the current user
 */
export async function getUserPersonalBest() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const adminClient = createSupabaseAdminClient();
        const game = await resolveFlashbackGameId(adminClient);

        if (!game) return null;

        const { data: best } = await adminClient
            .from("game_scores")
            .select("score, duration_ms, max_score")
            .eq("user_id", user.id)
            .eq("game_id", game.id)
            .order("score", { ascending: false })
            .limit(1)
            .maybeSingle();

        return best ? { score: best.score, durationMs: best.duration_ms } : null;
    } catch (error) {
        console.error("Error fetching personal best:", error);
        return null;
    }
}

/**
 * Fetch full leaderboard for Echo Lex
 */
export async function getEchoLexGameLeaderboard() {
    try {
        const adminClient = createSupabaseAdminClient();

        const game = await resolveFlashbackGameId(adminClient);

        if (!game) return [];

        const { data: scores } = await adminClient
            .from("game_scores")
            .select("user_id, score")
            .eq("game_id", game.id)
            .order("score", { ascending: false })
            .limit(50);

        if (!scores || scores.length === 0) return [];

        const userIds = [...new Set(scores.map(s => s.user_id))];

        const { data: profiles } = await adminClient
            .from("profiles")
            .select("id, username")
            .in("id", userIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p.username]));

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

        // Aggregate best score per user if needed, but here we just list them
        // If sorting games_played, we would calculate it here, but we'll return 1 for now to match interface
        return scores.map((s, i) => {
            const equipped = equippedMap.get(s.user_id);
            return {
                rank: i + 1,
                best_score: s.score,
                username: profileMap.get(s.user_id) || "Unknown",
                user_id: s.user_id,
                games_played: 1,
                equippedAvatar: equipped?.avatar || null,
                equippedBackground: equipped?.background || null,
                equippedTitle: equipped?.title || null,
            };
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}
