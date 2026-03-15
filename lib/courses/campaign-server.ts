import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildCourseMissionPlan,
  resolveMissionPrimaryGameAssignments,
  type CourseMissionPlan,
  type CourseMissionPlanEntryInput,
} from "@/lib/courses/campaign";

type GameBenchmark = {
  averageScore: number | null;
  sampleSize: number;
};

function buildSlugKey(slugs: string[]) {
  return [...new Set(slugs)].sort().join(",");
}

function applyMissionRamp(
  entry: CourseMissionPlanEntryInput,
  averageScore: number,
  mission: CourseMissionPlan
) {
  const chapterProgress = Math.max(0, entry.palierId - 1);
  const withinPalierIndex = (entry.courseId - 1) % 10;

  if (mission.scoreDirection === "lower") {
    const reductionFactor = Math.max(
      0.84,
      1 - chapterProgress * 0.012 - withinPalierIndex * 0.0035
    );
    return Math.min(averageScore - 100, averageScore * reductionFactor);
  }

  const increaseFactor = 1 + chapterProgress * 0.02 + withinPalierIndex * 0.006;

  if (mission.primaryGameSlug === "flashback") {
    return Math.max(
      averageScore + 1 + chapterProgress * 0.8 + withinPalierIndex * 0.35,
      averageScore * increaseFactor
    );
  }

  if (mission.primaryGameSlug === "speed-verb-challenge") {
    return Math.max(
      averageScore + 6 + chapterProgress * 2 + withinPalierIndex * 0.8,
      averageScore * (1 + chapterProgress * 0.05 + withinPalierIndex * 0.012)
    );
  }

  if (mission.primaryGameSlug === "enigma-scroll") {
    return Math.max(
      averageScore + 8 + chapterProgress * 3 + withinPalierIndex * 1.2,
      averageScore * (1 + chapterProgress * 0.05 + withinPalierIndex * 0.012)
    );
  }

  if (mission.primaryGameSlug === "space-lex") {
    return Math.max(
      averageScore + 10 + chapterProgress * 4 + withinPalierIndex * 1.5,
      averageScore * (1 + chapterProgress * 0.05 + withinPalierIndex * 0.015)
    );
  }

  return Math.max(averageScore + 10, averageScore * increaseFactor);
}

async function getBenchmarksForSlugKey(
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

    const accumulators = new Map<string, { total: number; count: number }>();

    for (const scoreRow of scores ?? []) {
      if (typeof scoreRow.score !== "number" || !Number.isFinite(scoreRow.score)) {
        continue;
      }

      const slug = gameIdToSlug.get(scoreRow.game_id);
      if (!slug) {
        continue;
      }

      const current = accumulators.get(slug) ?? { total: 0, count: 0 };
      current.total += scoreRow.score;
      current.count += 1;
      accumulators.set(slug, current);
    }

    const benchmarks: Record<string, GameBenchmark> = {};
    for (const slug of slugs) {
      const accumulator = accumulators.get(slug);
      benchmarks[slug] = accumulator
        ? {
            averageScore: accumulator.total / accumulator.count,
            sampleSize: accumulator.count,
          }
        : {
            averageScore: null,
            sampleSize: 0,
          };
    }

    return benchmarks;
  } catch {
    return {};
  }
}

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

      if (benchmark?.averageScore == null) {
        return [courseId, plan];
      }

      const rampedTarget = applyMissionRamp(entry, benchmark.averageScore, plan);

      return [
        courseId,
        buildCourseMissionPlan(entry, {
          scoreTarget: rampedTarget,
          targetSource: "community_average",
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

  if (benchmark?.averageScore == null) {
    return plan;
  }

  const rampedTarget = applyMissionRamp(entry, benchmark.averageScore, plan);

  return buildCourseMissionPlan(entry, {
    primaryGameSlug: plan.primaryGameSlug,
    scoreTarget: rampedTarget,
    targetSource: "community_average",
  });
}
