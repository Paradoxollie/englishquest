"use server";

import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { recordGrammarRushPractice, type PracticeResult } from "@/lib/courses/practice-server";
import { syncBadgesSafely, type NewBadge } from "@/lib/profile/badges-server";
import { checkAndGrantDailyBonus } from "@/lib/profile/daily-challenge";
import { isValidRushResult } from "@/lib/games/grammar-rush";
import { gamePerformance } from "@/lib/profile/economy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { gameAuthFailure, interruptedGameSave, saveGameScore } from "@/lib/games/score-settlement";
import { checkGrammarRush } from "@/lib/games/score-plausibility";

const SLUG = "grammar-rush";
const DIFFICULTY = "medium" as const;

export async function submitGrammarRushScore(params: {
  score: number;
  correct: number;
  attempts: number;
  durationMs: number;
  /** Cours ciblé (?cours=N) et bonnes réponses sur ses questions pendant la partie. */
  focusCourseId?: number | null;
  focusCorrect?: number;
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
  courseCompleted?: AutoCompletedCourse | null;
  practice?: PracticeResult | null;
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
  if (!isValidRushResult(params) || !checkGrammarRush(params).ok) return { success: false, error: "Les résultats de cette partie sont incohérents." };
  const { score, correct, attempts, durationMs } = params;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }, error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return gameAuthFailure(userError);
    }
    const saved = await saveGameScore({
      userId: user.id, slug: "grammar-rush", sessionId: params.sessionId,
      score, maxScore: attempts, durationMs,
      difficulty: DIFFICULTY, performance: gamePerformance.grammarRush(correct),
      recordEligible: score > 0,
      focus: { course: params.focusCourseId ?? null, correct: params.focusCorrect ?? 0 },
    });
    if (!saved.ok) return { success: false, error: saved.error, retryable: saved.retryable };
    const { rewards, playsToday, isNewPersonalBest, isNewGlobalBest } = saved.receipt;
    const dailyChallenge = await checkAndGrantDailyBonus(user.id, SLUG, {
      eligible: rewards.xpEarned > 0, earnedAt: saved.receipt.savedAt,
    });
    const courseCompleted = saved.receipt.replayed ? null : await autoCompleteCourseMissionForGame(user.id, SLUG, score);
    // Étoile d'entraînement : seulement quand la partie était ouverte sur un cours.
    const practice =
      params.focusCourseId != null
        ? await recordGrammarRushPractice(user.id, {
            focusCourseId: params.focusCourseId,
            focusCorrect: params.focusCorrect ?? 0,
            correct,
            attempts,
          })
        : null;
    const newBadges = await syncBadgesSafely(user.id);
    const gameNewLevel = saved.receipt.level > saved.receipt.previousLevel ? saved.receipt.level : 0;
    const mergedNewLevel = Math.max(gameNewLevel, dailyChallenge.newLevel ?? 0) || undefined;

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
      practice,
      newBadges,
    };
  } catch (error) {
    console.error("submitGrammarRushScore", error);
    return interruptedGameSave;
  }
}
