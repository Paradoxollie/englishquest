"use server";
import { gamePerformance } from "@/lib/profile/economy";
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
import { gameAuthFailure, interruptedGameSave, saveGameScore } from "@/lib/games/score-settlement";
import { checkLexiconBlaster } from "@/lib/games/score-plausibility";

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
        if (![params.score, params.wave, params.maxCombo, params.wordsMastered, params.wordsMissed, params.durationMs]
            .every(value => Number.isSafeInteger(value) && value >= 0) || params.wave < 1 || params.wave > 1_000 ||
            params.score > 1_000_000 || params.maxCombo > 20_000 || params.wordsMastered > 20_000 ||
            params.wordsMissed > 20_000 || params.durationMs > 2 * 60 * 60 * 1000) {
            return { success: false, error: "Score Space Lex invalide" };
        }
        if (!checkLexiconBlaster(params).ok) {
            return { success: false, error: "Score Space Lex invraisemblable" };
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
          userId: user.id, slug: "space-lex", sessionId: params.sessionId,
          score: params.score, maxScore: params.wave, durationMs: params.durationMs,
          difficulty: DEFAULT_DIFFICULTY, performance: gamePerformance.lexiconBlaster(params.wordsMastered, params.wave),
          recordEligible: params.score > 0,
        });
        if (!saved.ok) return { success: false, error: saved.error, retryable: saved.retryable };
        const { rewards, playsToday, isNewPersonalBest, isNewGlobalBest } = saved.receipt;

        // Check and grant Daily Challenge bonus
        const { checkAndGrantDailyBonus } = await import("@/lib/profile/daily-challenge");
        const dailyChallengeResult = await checkAndGrantDailyBonus(user.id, "space-lex", {
            eligible: rewards.xpEarned > 0, earnedAt: saved.receipt.savedAt,
        });
        const courseCompleted = saved.receipt.replayed ? null : await autoCompleteCourseMissionForGame(user.id, "space-lex", params.score);
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
            personalBest: isNewPersonalBest ? params.score : (saved.receipt.previousBest ?? 0),
        };
    } catch (error) {
        console.error("Error in submitLexiconBlasterScore:", error);
        return interruptedGameSave;
    }
}
