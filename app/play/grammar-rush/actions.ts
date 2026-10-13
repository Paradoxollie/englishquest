"use server";

import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { checkAndGrantDailyBonus } from "@/lib/profile/daily-challenge";
import { isValidRushResult } from "@/lib/games/grammar-rush";
import { computeGameRewards, gamePerformance } from "@/lib/profile/economy";
import { countPlaysToday, grantProfileRewards } from "@/lib/profile/economy-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SLUG = "grammar-rush";
const DIFFICULTY = "medium" as const;

export async function submitGrammarRushScore(params: {
  score: number;
  correct: number;
  attempts: number;
  durationMs: number;
}): Promise<{
  success: boolean;
  error?: string;
  rewards?: { xpEarned: number; goldEarned: number; newLevel?: number };
  isNewPersonalBest?: boolean;
  isNewGlobalBest?: boolean;
  courseCompleted?: AutoCompletedCourse | null;
  dailyChallenge?: {
    dailyPlayedGames: string[];
    requiredGames: string[];
    bonusGranted: boolean;
    xpBonus: number;
    goldBonus: number;
    dailyGoalReached: boolean;
  };
}> {
  if (!isValidRushResult(params)) return { success: false, error: "Les résultats de cette partie sont incohérents." };
  const { score, correct, attempts, durationMs } = params;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Connecte-toi pour enregistrer ton score." };
    }

    const admin = createSupabaseAdminClient();
    const { data: game, error: gameError } = await admin.from("games").select("id").eq("slug", SLUG).maybeSingle();
    if (gameError) throw gameError;
    if (!game) {
      return { success: false, error: "Le jeu n'est pas encore déclaré dans la base (migration 2026-10-10_04)." };
    }

    const [personalBestResult, globalBestResult] = await Promise.all([
      admin.from("game_scores").select("score").eq("user_id", user.id).eq("game_id", game.id).order("score", { ascending: false }).limit(1).maybeSingle(),
      admin.from("game_scores").select("score").eq("game_id", game.id).order("score", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (personalBestResult.error) throw personalBestResult.error;
    if (globalBestResult.error) throw globalBestResult.error;
    const personalBest = personalBestResult.data;
    const globalBest = globalBestResult.data;
    const isNewPersonalBest = score > (personalBest?.score ?? 0);
    const isNewGlobalBest = score > (globalBest?.score ?? 0);

    const playsToday = await countPlaysToday(admin, user.id, game.id);
    const rewards = computeGameRewards({
      performance: gamePerformance.grammarRush(correct),
      difficulty: DIFFICULTY,
      playsToday,
      isNewPersonalBest,
      isNewGlobalBest,
    });

    const { error: insertError } = await admin.from("game_scores").insert({
      user_id: user.id,
      game_id: game.id,
      score,
      max_score: attempts,
      duration_ms: durationMs,
      difficulty: DIFFICULTY,
    });
    if (insertError) {
      console.error("grammar-rush insert", insertError);
      return { success: false, error: "Le score n'a pas pu être enregistré." };
    }

    const balances = await grantProfileRewards(admin, user.id, { xp: rewards.xpEarned, gold: rewards.goldEarned });
    const dailyChallenge = await checkAndGrantDailyBonus(user.id, SLUG);
    const courseCompleted = await autoCompleteCourseMissionForGame(user.id, SLUG, score);

    return {
      success: true,
      rewards: { xpEarned: rewards.xpEarned, goldEarned: rewards.goldEarned, newLevel: balances.level > balances.previousLevel ? balances.level : undefined },
      isNewPersonalBest,
      isNewGlobalBest,
      dailyChallenge,
      courseCompleted,
    };
  } catch (error) {
    console.error("submitGrammarRushScore", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}
