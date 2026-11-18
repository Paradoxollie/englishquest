"use server";

import { revalidatePath } from "next/cache";
import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { gameAuthFailure, interruptedGameSave, saveGameScore } from "@/lib/games/score-settlement";
import { checkSpellStrike } from "@/lib/games/score-plausibility";
import { spellDifficultyToDb, type SpellDifficulty } from "@/lib/games/spellStrike";
import { syncBadgesSafely, type NewBadge } from "@/lib/profile/badges-server";
import { checkAndGrantDailyBonus } from "@/lib/profile/daily-challenge";
import { gamePerformance } from "@/lib/profile/economy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SLUG = "spell-strike";

export async function submitSpellStrikeScore(params: {
  difficulty: SpellDifficulty;
  score: number;
  correctCount: number;
  totalRounds: number;
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
  dailyChallenge?: Awaited<ReturnType<typeof checkAndGrantDailyBonus>>;
  courseCompleted?: AutoCompletedCourse | null;
  newBadges?: NewBadge[];
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return gameAuthFailure(userError);
    }

    const { difficulty, score, correctCount, totalRounds, durationMs } = params;
    const plausible = checkSpellStrike({ difficulty, score, correctCount, totalRounds, durationMs });
    if (!plausible.ok) {
      return { success: false, error: "Score invalide." };
    }

    const saved = await saveGameScore({
      userId: user.id, slug: "spell-strike", sessionId: params.sessionId,
      score, maxScore: correctCount, durationMs,
      difficulty: spellDifficultyToDb(difficulty), performance: gamePerformance.spellStrike(correctCount, totalRounds),
      recordEligible: score > 0 && correctCount > 0,
    });
    if (!saved.ok) return { success: false, error: saved.error, retryable: saved.retryable };
    const { rewards, playsToday, isNewPersonalBest, isNewGlobalBest } = saved.receipt;

    const dailyChallenge = await checkAndGrantDailyBonus(user.id, SLUG, {
      eligible: rewards.xpEarned > 0, earnedAt: saved.receipt.savedAt,
    });
    const courseCompleted = saved.receipt.replayed ? null : await autoCompleteCourseMissionForGame(user.id, SLUG, score);
    const newBadges = await syncBadgesSafely(user.id);
    const gameNewLevel = saved.receipt.level > saved.receipt.previousLevel ? saved.receipt.level : 0;
    const mergedNewLevel = Math.max(gameNewLevel, dailyChallenge.newLevel ?? 0) || undefined;

    revalidatePath(`/play/${SLUG}`);
    revalidatePath("/play");
    revalidatePath("/leaderboard");
    revalidatePath("/profile");
    revalidatePath("/home");
    revalidatePath("/quest");

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
      isNewPersonalBest,
      isNewGlobalBest,
      dailyChallenge,
      courseCompleted,
      newBadges,
    };
  } catch (error) {
    console.error("submitSpellStrikeScore", error);
    return interruptedGameSave;
  }
}
