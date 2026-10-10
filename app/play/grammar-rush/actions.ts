"use server";

import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { checkAndGrantDailyBonus } from "@/lib/profile/daily-challenge";
import { computeGameRewards, gamePerformance } from "@/lib/profile/economy";
import { countPlaysToday } from "@/lib/profile/economy-server";
import { calculateLevelFromXP } from "@/lib/profile/leveling";
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
  const score = Math.max(0, Math.min(5000, Math.round(Number(params.score) || 0)));
  const correct = Math.max(0, Math.min(200, Math.round(Number(params.correct) || 0)));
  const attempts = Math.max(correct, Math.min(300, Math.round(Number(params.attempts) || 0)));
  const durationMs = Math.max(0, Math.min(10 * 60 * 1000, Math.round(Number(params.durationMs) || 0)));

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Connecte-toi pour enregistrer ton score." };
    }

    const admin = createSupabaseAdminClient();
    const { data: game } = await admin.from("games").select("id").eq("slug", SLUG).maybeSingle();
    if (!game) {
      return { success: false, error: "Le jeu n'est pas encore déclaré dans la base (migration 2026-10-10_04)." };
    }

    const [{ data: personalBest }, { data: globalBest }] = await Promise.all([
      admin.from("game_scores").select("score").eq("user_id", user.id).eq("game_id", game.id).order("score", { ascending: false }).limit(1).maybeSingle(),
      admin.from("game_scores").select("score").eq("game_id", game.id).order("score", { ascending: false }).limit(1).maybeSingle(),
    ]);
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

    const { data: profile } = await admin.from("profiles").select("xp, gold, level").eq("id", user.id).single();
    if (!profile) {
      return { success: true, rewards: { xpEarned: 0, goldEarned: 0 } };
    }
    const newXP = (profile.xp ?? 0) + rewards.xpEarned;
    const newGold = (profile.gold ?? 0) + rewards.goldEarned;
    const newLevel = calculateLevelFromXP(newXP);
    await admin.from("profiles").update({ xp: newXP, gold: newGold, level: newLevel, updated_at: new Date().toISOString() }).eq("id", user.id);

    const [dailyChallenge, courseCompleted] = await Promise.all([
      checkAndGrantDailyBonus(user.id, SLUG),
      autoCompleteCourseMissionForGame(user.id, SLUG, score),
    ]);

    return {
      success: true,
      rewards: { xpEarned: rewards.xpEarned, goldEarned: rewards.goldEarned, newLevel: newLevel > (profile.level ?? 1) ? newLevel : undefined },
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
