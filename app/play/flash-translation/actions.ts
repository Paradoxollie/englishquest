"use server";
import { gamePerformance } from "@/lib/profile/economy";
import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { syncBadgesSafely, type NewBadge } from "@/lib/profile/badges-server";

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
import { gameAuthFailure, interruptedGameSave, saveGameScore } from "@/lib/games/score-settlement";
import { checkFlashTranslation } from "@/lib/games/score-plausibility";
import type { ShopItem } from "@/types/shop";

const FLASH_TRANSLATION_MAX_TIME_MS = 10 * 60 * 1000;
const FLASH_TRANSLATION_MAX_AVERAGE_MS = 60 * 1000;
const FLASH_TRANSLATION_MIN_AVERAGE_MS = 120;
const FLASH_TRANSLATION_REQUIRED_ROUNDS = 10;
const FLASH_TRANSLATION_WRONG_ANSWER_PENALTY_MS = 5000;
const FLASH_TRANSLATION_MAX_DURATION_MS = 2 * 60 * 60 * 1000;

type EquippedItems = {
    avatar: ShopItem | null;
    background: ShopItem | null;
    title: ShopItem | null;
};

type SupabaseShopJoin = ShopItem | ShopItem[] | null;

type EquippedItemRow = {
    user_id: string;
    equipped_avatar: SupabaseShopJoin;
    equipped_background: SupabaseShopJoin;
    equipped_title: SupabaseShopJoin;
};

type FlashUserStats = {
    bestScore: number;
    gamesPlayed: number;
};

function pickJoinedItem(value: SupabaseShopJoin): ShopItem | null {
    return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeFlashTranslationScoreParams(params: {
    totalTimeMs: number;
    averageReactionTimeMs: number;
    wrongAnswers: number;
    roundsCompleted: number;
    durationMs: number;
}):
    | {
        valid: true;
        totalTimeMs: number;
        averageReactionTimeMs: number;
        wrongAnswers: number;
        roundsCompleted: number;
        durationMs: number;
    }
    | { valid: false; error: string } {
    if (
        !Number.isFinite(params.totalTimeMs) ||
        !Number.isFinite(params.averageReactionTimeMs) ||
        !Number.isFinite(params.wrongAnswers) ||
        !Number.isFinite(params.roundsCompleted) ||
        !Number.isFinite(params.durationMs)
    ) {
        return { valid: false, error: "Score Flash Translation invalide" };
    }

    const totalTimeMs = Math.floor(params.totalTimeMs);
    const averageReactionTimeMs = Math.floor(params.averageReactionTimeMs);
    const wrongAnswers = Math.floor(params.wrongAnswers);
    const roundsCompleted = Math.floor(params.roundsCompleted);
    const durationMs = Math.floor(params.durationMs);

    if (
        totalTimeMs < 0 ||
        averageReactionTimeMs < 0 ||
        wrongAnswers < 0 ||
        durationMs < 0 ||
        durationMs > FLASH_TRANSLATION_MAX_DURATION_MS ||
        roundsCompleted !== FLASH_TRANSLATION_REQUIRED_ROUNDS ||
        totalTimeMs > FLASH_TRANSLATION_MAX_TIME_MS ||
        averageReactionTimeMs < FLASH_TRANSLATION_MIN_AVERAGE_MS ||
        averageReactionTimeMs > FLASH_TRANSLATION_MAX_AVERAGE_MS ||
        wrongAnswers > roundsCompleted
    ) {
        return { valid: false, error: "Score Flash Translation hors limites" };
    }

    const minimumExpectedTotal =
        averageReactionTimeMs * roundsCompleted +
        wrongAnswers * FLASH_TRANSLATION_WRONG_ANSWER_PENALTY_MS -
        roundsCompleted;

    if (totalTimeMs < minimumExpectedTotal) {
        return { valid: false, error: "Score Flash Translation incoherent" };
    }

    return {
        valid: true,
        totalTimeMs,
        averageReactionTimeMs,
        wrongAnswers,
        roundsCompleted,
        durationMs,
    };
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
 * @param params.durationMs - Wall-clock duration of the game, bounded by the server session
 * @param params.sessionId - Game session started by startGameSession (required)
 * @returns Result with success status and rewards earned
 */
export async function submitFlashTranslationScore(params: {
    totalTimeMs: number;
    averageReactionTimeMs: number;
    wrongAnswers: number;
    roundsCompleted: number;
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
        const session = normalizeFlashTranslationScoreParams(params);
        if (!session.valid) {
            return {
                success: false,
                error: session.error,
            };
        }
        if (!checkFlashTranslation(session).ok) {
            return { success: false, error: "Score Flash Translation invraisemblable" };
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
          userId: user.id, slug: "flash-translation", sessionId: params.sessionId,
          score: session.totalTimeMs, maxScore: session.roundsCompleted, durationMs: session.durationMs,
          difficulty: "medium", performance: gamePerformance.flashTranslation(session.roundsCompleted - session.wrongAnswers, session.roundsCompleted),
          recordEligible: session.wrongAnswers < session.roundsCompleted,
        });
        if (!saved.ok) return { success: false, error: saved.error, retryable: saved.retryable };
        const { rewards, playsToday, isNewPersonalBest, isNewGlobalBest } = saved.receipt;

        // Check and grant Daily Challenge bonus
        const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
        const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "flash-translation", {
            eligible: rewards.xpEarned > 0, earnedAt: saved.receipt.savedAt,
        });
        const courseCompleted = saved.receipt.replayed ? null : await autoCompleteCourseMissionForGame(user.id, "flash-translation", session.totalTimeMs);
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
            personalBest: isNewPersonalBest ? session.totalTimeMs : (saved.receipt.previousBest ?? Infinity),
        };
    } catch (error) {
        console.error("Error in submitFlashTranslationScore:", error);
        return interruptedGameSave;
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
        .maybeSingle();

    if (!game) return [];

    // Get all scores for this game
    const { data: scores } = await adminClient
        .from("game_scores")
        .select("user_id, score")
        .eq("game_id", game.id)
        .order("score", { ascending: true }) // Lower is better
        .limit(200); // Enough rows to dedupe users even when all attempts are stored

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

    const equippedMap = new Map<string, EquippedItems>();
    for (const item of (equippedItems ?? []) as EquippedItemRow[]) {
        equippedMap.set(item.user_id, {
            avatar: pickJoinedItem(item.equipped_avatar),
            background: pickJoinedItem(item.equipped_background),
            title: pickJoinedItem(item.equipped_title),
        });
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
        .maybeSingle();

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

    const equippedMap = new Map<string, EquippedItems>();
    for (const item of (equippedItems ?? []) as EquippedItemRow[]) {
        equippedMap.set(item.user_id, {
            avatar: pickJoinedItem(item.equipped_avatar),
            background: pickJoinedItem(item.equipped_background),
            title: pickJoinedItem(item.equipped_title),
        });
    }

    // Group scores by user_id
    const userStats = new Map<string, FlashUserStats>();
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
        .map(([userId, stats]) => {
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
