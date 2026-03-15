import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { COURSE_MISSION_BENCHMARKS_TAG } from "@/lib/courses/cache";
import {
  buildCourseMissionPlan,
  resolveMissionPrimaryGameAssignments,
  type CourseMissionPlan,
  type CourseMissionPlanEntryInput,
} from "@/lib/courses/campaign";

type GameBenchmark = {
  medianScore: number | null;
  sampleSize: number;
};

function buildSlugKey(slugs: string[]) {
  return [...new Set(slugs)].sort().join(",");
}

function computeMedian(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middleIndex];
  }

  return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
}

function computeProgressDifficultyRatio(
  entry: CourseMissionPlanEntryInput,
  mission: CourseMissionPlan
) {
  const overallProgress = Math.max(0, entry.courseId - 1);

  if (mission.scoreDirection === "lower") {
    return 0.01 + overallProgress * 0.0015;
  }

  if (mission.primaryGameSlug === "flashback") {
    return 0.03 + overallProgress * 0.004;
  }

  if (mission.primaryGameSlug === "speed-verb-challenge") {
    return 0.08 + overallProgress * 0.008;
  }

  if (mission.primaryGameSlug === "space-lex") {
    return 0.07 + overallProgress * 0.008;
  }

  if (mission.primaryGameSlug === "enigma-scroll") {
    return 0.075 + overallProgress * 0.009;
  }

  if (mission.primaryGameSlug === "wordfall") {
    return 0.05 + overallProgress * 0.006;
  }

  return 0.05 + overallProgress * 0.006;
}

function computeAbsoluteDifficultyFloor(
  baselineScore: number,
  mission: CourseMissionPlan
) {
  if (mission.scoreDirection === "lower") {
    return Math.max(100, baselineScore * 0.004);
  }

  if (mission.primaryGameSlug === "flashback") {
    return 1;
  }

  if (mission.primaryGameSlug === "speed-verb-challenge") {
    return Math.max(1, baselineScore * 0.08);
  }

  if (mission.primaryGameSlug === "space-lex") {
    return Math.max(5, baselineScore * 0.08);
  }

  if (mission.primaryGameSlug === "enigma-scroll") {
    return Math.max(4, baselineScore * 0.08);
  }

  if (mission.primaryGameSlug === "wordfall") {
    return Math.max(20, baselineScore * 0.045);
  }

  return Math.max(3, baselineScore * 0.05);
}

function computeProgressOffset(
  entry: CourseMissionPlanEntryInput,
  baselineScore: number,
  mission: CourseMissionPlan
) {
  const overallProgress = Math.max(0, entry.courseId - 1);

  if (mission.scoreDirection === "lower") {
    return overallProgress * 20;
  }

  if (mission.primaryGameSlug === "flashback") {
    return overallProgress * 0.2;
  }

  if (mission.primaryGameSlug === "speed-verb-challenge") {
    return overallProgress * 0.2;
  }

  if (baselineScore >= 1200) {
    return overallProgress * 8;
  }

  if (baselineScore >= 200) {
    return overallProgress * 3;
  }

  if (baselineScore >= 40) {
    return overallProgress * 1;
  }

  return overallProgress * 0.2;
}

function applyMissionRamp(
  entry: CourseMissionPlanEntryInput,
  baselineScore: number,
  mission: CourseMissionPlan
) {
  const difficultyRatio = computeProgressDifficultyRatio(entry, mission);
  const absoluteFloor = computeAbsoluteDifficultyFloor(baselineScore, mission);
  const progressionOffset = computeProgressOffset(entry, baselineScore, mission);
  const difficultyDelta =
    Math.max(absoluteFloor, baselineScore * difficultyRatio) + progressionOffset;

  if (mission.scoreDirection === "lower") {
    return baselineScore - difficultyDelta;
  }

  return baselineScore + difficultyDelta;
}

async function getBenchmarksForSlugKeyUncached(
  slugKey: string
): Promise<Record<string, GameBenchmark>> {
  if (!slugKey) {
    return {};
  }

  const slugs = slugKey.split(",").filter(Boolean);
  if (slugs.length === 0) {
    return {};
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data: games } = await adminClient
      .from("games")
      .select("id, slug")
      .in("slug", slugs);

    if (!games || games.length === 0) {
      return {};
    }

    const gameIds = games.map((game) => game.id);
    const gameIdToSlug = new Map(games.map((game) => [game.id, game.slug]));
    const { data: scores } = await adminClient
      .from("game_scores")
      .select("game_id, score")
      .in("game_id", gameIds);

    const scoreBuckets = new Map<string, number[]>();

    for (const scoreRow of scores ?? []) {
      if (typeof scoreRow.score !== "number" || !Number.isFinite(scoreRow.score)) {
        continue;
      }

      const slug = gameIdToSlug.get(scoreRow.game_id);
      if (!slug) {
        continue;
      }

      const current = scoreBuckets.get(slug) ?? [];
      current.push(scoreRow.score);
      scoreBuckets.set(slug, current);
    }

    const benchmarks: Record<string, GameBenchmark> = {};
    for (const slug of slugs) {
      const scoresForGame = scoreBuckets.get(slug) ?? [];
      benchmarks[slug] = scoresForGame.length > 0
        ? {
            medianScore: computeMedian(scoresForGame),
            sampleSize: scoresForGame.length,
          }
        : {
            medianScore: null,
            sampleSize: 0,
          };
    }

    return benchmarks;
  } catch {
    return {};
  }
}

const getBenchmarksForSlugKey = unstable_cache(
  async (slugKey: string) => getBenchmarksForSlugKeyUncached(slugKey),
  ["course-mission-benchmarks"],
  {
    revalidate: 300,
    tags: [COURSE_MISSION_BENCHMARKS_TAG],
  }
);

export async function getResolvedCourseMissionPlans(
  entries: CourseMissionPlanEntryInput[]
): Promise<Record<number, CourseMissionPlan>> {
  if (entries.length === 0) {
    return {};
  }

  const missionGameAssignments = resolveMissionPrimaryGameAssignments(entries);
  const basePlans = entries.map((entry) => ({
    courseId: entry.courseId,
    entry,
    plan: buildCourseMissionPlan(entry, {
      primaryGameSlug: missionGameAssignments[entry.courseId] ?? null,
    }),
  }));
  const slugKey = buildSlugKey(
    basePlans
      .map((item) => item.plan.primaryGameSlug)
      .filter((slug): slug is string => Boolean(slug))
  );
  const benchmarks = await getBenchmarksForSlugKey(slugKey);

  return Object.fromEntries(
    basePlans.map(({ courseId, entry, plan }) => {
      const benchmark = plan.primaryGameSlug
        ? benchmarks[plan.primaryGameSlug]
        : null;

      if (benchmark?.medianScore == null) {
        return [courseId, plan];
      }

      const rampedTarget = applyMissionRamp(entry, benchmark.medianScore, plan);

      return [
        courseId,
        buildCourseMissionPlan(entry, {
          primaryGameSlug: plan.primaryGameSlug,
          scoreTarget: rampedTarget,
          targetSource: "community_median",
        }),
      ];
    })
  );
}

export async function getResolvedCourseMissionPlan(
  entry: CourseMissionPlanEntryInput
): Promise<CourseMissionPlan> {
  const plan = buildCourseMissionPlan(entry);

  if (!plan.primaryGameSlug) {
    return plan;
  }

  const benchmarks = await getBenchmarksForSlugKey(plan.primaryGameSlug);
  const benchmark = benchmarks[plan.primaryGameSlug];

  if (benchmark?.medianScore == null) {
    return plan;
  }

  const rampedTarget = applyMissionRamp(entry, benchmark.medianScore, plan);

  return buildCourseMissionPlan(entry, {
    primaryGameSlug: plan.primaryGameSlug,
    scoreTarget: rampedTarget,
    targetSource: "community_median",
  });
}
