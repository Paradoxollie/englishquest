import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildCourseMissionPlan,
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

  const basePlans = entries.map((entry) => ({
    courseId: entry.courseId,
    entry,
    plan: buildCourseMissionPlan(entry),
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

      return [
        courseId,
        buildCourseMissionPlan(entry, {
          scoreTarget: benchmark.averageScore,
          targetSource: "community_average",
        }),
      ];
    })
  );
}

export async function getResolvedCourseMissionPlan(
  entry: CourseMissionPlanEntryInput
): Promise<CourseMissionPlan> {
  const plans = await getResolvedCourseMissionPlans([entry]);
  return plans[entry.courseId] ?? buildCourseMissionPlan(entry);
}
