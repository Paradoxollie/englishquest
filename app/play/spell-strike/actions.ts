"use server";

import { revalidatePath } from "next/cache";
import { autoCompleteCourseMissionForGame, type AutoCompletedCourse } from "@/lib/courses/mission-auto-complete";
import { consumeGameSession } from "@/lib/games/game-session-server";
import { checkSpellStrike } from "@/lib/games/score-plausibility";
import { spellDifficultyToDb, type SpellDifficulty } from "@/lib/games/spellStrike";
import { syncBadgesSafely, type NewBadge } from "@/lib/profile/badges-server";
import { checkAndGrantDailyBonus } from "@/lib/profile/daily-challenge";
import { computeGameRewards, gamePerformance } from "@/lib/profile/economy";
import { countPlaysToday, grantProfileRewards } from "@/lib/profile/economy-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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
      return { success: false, error: "Tu dois être connecté pour enregistrer ton score." };
    }

    const { difficulty, score, correctCount, totalRounds, durationMs } = params;
    const plausible = checkSpellStrike({ difficulty, score, correctCount, totalRounds, durationMs });
    if (!plausible.ok) {
      return { success: false, error: "Score invalide." };
    }

    const sessionCheck = await consumeGameSession({
      sessionId: params.sessionId,
      userId: user.id,
      slug: SLUG,
      claimedDurationMs: durationMs,
    });
    if (!sessionCheck.ok) {
      return { success: false, error: sessionCheck.error };
    }

    const dbDifficulty = spellDifficultyToDb(difficulty);
    const adminClient = createSupabaseAdminClient();
    const { data: game } = await adminClient
      .from("games")
      .select("id")
      .eq("slug", SLUG)
      .maybeSingle();

    if (!game) {
      return { success: false, error: "Jeu introuvable." };
    }

    const [{ data: personalBest }, { data: globalTop }, playsToday] = await Promise.all([
      adminClient
        .from("game_scores")
        .select("score")
        .eq("user_id", user.id)
        .eq("game_id", game.id)
        .eq("difficulty", dbDifficulty)
        .order("score", { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminClient
        .from("game_scores")
        .select("score")
        .eq("game_id", game.id)
        .eq("difficulty", dbDifficulty)
        .order("score", { ascending: false })
        .limit(1)
        .maybeSingle(),
      countPlaysToday(adminClient, user.id, game.id),
    ]);

    const { error: insertError } = await adminClient.from("game_scores").insert({
      user_id: user.id,
      game_id: game.id,
      score,
      max_score: correctCount,
      duration_ms: durationMs,
      difficulty: dbDifficulty,
    });

    if (insertError) {
      console.error("submitSpellStrikeScore insertError", insertError);
      return { success: false, error: "Impossible d'enregistrer le score." };
    }

    const hasScore = score > 0 && correctCount > 0;
    const isNewPersonalBest = hasScore && (!personalBest || score > personalBest.score);
    const isNewGlobalBest = hasScore && (!globalTop || score > globalTop.score);

    const rewards = computeGameRewards({
      performance: gamePerformance.spellStrike(correctCount, totalRounds),
      difficulty: dbDifficulty,
      playsToday,
      isNewPersonalBest,
      isNewGlobalBest,
    });

    const balances = await grantProfileRewards(adminClient, user.id, {
      xp: rewards.xpEarned,
      gold: rewards.goldEarned,
    });

    const dailyChallenge = await checkAndGrantDailyBonus(user.id, SLUG, {
      eligible: rewards.xpEarned > 0,
    });
    const courseCompleted = await autoCompleteCourseMissionForGame(user.id, SLUG, score);
    const newBadges = await syncBadgesSafely(user.id);
    const gameNewLevel = balances.level > balances.previousLevel ? balances.level : 0;
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
    return { success: false, error: "Une erreur est survenue." };
  }
}
