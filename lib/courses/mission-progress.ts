import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

export type CourseChallengeProgress = {
  bestScore: number | null;
  reached: boolean;
};

export async function getUserCourseChallengeProgress(
  userId: string,
  entry: CourseRoadmapEntry
): Promise<CourseChallengeProgress> {
  try {
    const mission = getCourseMissionPlan(entry);

    if (!mission.primaryGameSlug) {
      return {
        bestScore: null,
        reached: true,
      };
    }

    const adminClient = createSupabaseAdminClient();
    const { data: game } = await adminClient
      .from("games")
      .select("id")
      .eq("slug", mission.primaryGameSlug)
      .maybeSingle();

    if (!game) {
      return {
        bestScore: null,
        reached: false,
      };
    }

    const { data: bestScoreRow } = await adminClient
      .from("game_scores")
      .select("score")
      .eq("user_id", userId)
      .eq("game_id", game.id)
      .order("score", { ascending: mission.scoreDirection === "lower" })
      .limit(1)
      .maybeSingle();

    const bestScore = bestScoreRow?.score ?? null;

    if (bestScore === null) {
      return {
        bestScore: null,
        reached: false,
      };
    }

    return {
      bestScore,
      reached:
        mission.scoreDirection === "lower"
          ? bestScore <= mission.scoreTarget
          : bestScore >= mission.scoreTarget,
    };
  } catch {
    return {
      bestScore: null,
      reached: false,
    };
  }
}
