import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { chapters } from "@/lib/courses/chapters";
import { decodeCourseMissionTelemetry, isCoursePlacementSkip } from "@/lib/courses/mission-telemetry";
import {
  BADGE_GAMES,
  BADGES,
  evaluateBadges,
  getBadgeDefinition,
  type BadgeDefinition,
  type BadgeStats,
  type BadgeTier,
} from "@/lib/profile/badges";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any, any, any>;

export type EarnedBadge = {
  key: string;
  name: string;
  description: string;
  tier: BadgeTier;
  earnedAt: string;
};

export type NewBadge = { key: string; name: string; tier: BadgeTier };

export type BadgeSyncResult = {
  all: EarnedBadge[];
  newlyEarned: NewBadge[];
  stats: BadgeStats;
};

type ProgressRow = {
  status: string;
  best_score: number | null;
  courses: { course_number: number } | Array<{ course_number: number }> | null;
};

type BadgeRow = { badge_key: string; earned_at: string };

function relatedCourseNumber(row: ProgressRow) {
  const course = Array.isArray(row.courses) ? row.courses[0] ?? null : row.courses;
  return course?.course_number ?? null;
}

function logSoftError(scope: string, error: unknown) {
  if (error) console.error(`[badges] ${scope}`, error);
}

async function headCount(query: PromiseLike<{ count: number | null; error: unknown }>, scope: string) {
  const { count, error } = await query;
  // Compter trop peu ne retire jamais un badge : en cas d'erreur, on continue avec 0.
  logSoftError(scope, error);
  return error ? 0 : count ?? 0;
}

/**
 * Photographie des statistiques utiles aux badges. Une dizaine de requêtes
 * légères (comptages sans lignes), lancées en parallèle.
 */
export async function computeBadgeStats(userId: string, admin: AdminClient = createSupabaseAdminClient()): Promise<BadgeStats> {
  const [profileResult, progressResult, gamesResult, gamesPlayed, examsPassed] = await Promise.all([
    // « * » : les colonnes du test de niveau peuvent manquer si sa migration n'est pas passée.
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin.from("user_course_progress").select("status, best_score, courses ( course_number )").eq("user_id", userId),
    admin.from("games").select("id, slug"),
    headCount(admin.from("game_scores").select("id", { count: "exact", head: true }).eq("user_id", userId), "game count"),
    headCount(
      admin.from("chapter_exams").select("id", { count: "exact", head: true }).eq("user_id", userId).not("passed_at", "is", null),
      "exam count"
    ),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (!profileResult.data) throw new Error("Profile not found");
  if (progressResult.error) throw progressResult.error;
  logSoftError("games", gamesResult.error);

  const profile = profileResult.data as {
    xp?: number | null;
    level?: number | null;
    daily_streak?: number | null;
    best_daily_streak?: number | null;
    placement_at?: string | null;
  };

  const gameIds = new Map(((gamesResult.data ?? []) as Array<{ id: string; slug: string }>).map((game) => [game.slug, game.id]));
  const perGame = await Promise.all(
    BADGE_GAMES.map(async (game) => {
      const gameId = gameIds.get(game.slug);
      if (!gameId) return [game.slug, 0] as const;
      const played = await headCount(
        admin.from("game_scores").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("game_id", gameId),
        `count ${game.slug}`
      );
      return [game.slug, played] as const;
    })
  );

  const completedCourses = new Set<number>();
  let missionsCompleted = 0;
  let perfectQuizzes = 0;
  for (const row of (progressResult.data ?? []) as ProgressRow[]) {
    const courseNumber = relatedCourseNumber(row);
    const telemetry = decodeCourseMissionTelemetry(row.best_score);
    if (telemetry.quizTotal > 0 && telemetry.quizScore >= telemetry.quizTotal) perfectQuizzes += 1;
    if (row.status !== "completed" || courseNumber == null) continue;
    completedCourses.add(courseNumber);
    if (!isCoursePlacementSkip(row.best_score)) missionsCompleted += 1;
  }
  // Un chapitre est terminé quand ses dix missions sont validées sur la carte,
  // comme pour l'ouverture de l'examen (le test de niveau compte).
  const chaptersCompleted = chapters
    .filter((chapter) => chapter.courseIds.length > 0 && chapter.courseIds.every((courseId) => completedCourses.has(courseId)))
    .map((chapter) => chapter.id);

  return {
    missionsCompleted,
    chaptersCompleted,
    examsPassed,
    gamesPlayed,
    gamesPlayedBySlug: Object.fromEntries(perGame),
    dailyStreak: profile.daily_streak ?? 0,
    bestDailyStreak: typeof profile.best_daily_streak === "number" ? profile.best_daily_streak : null,
    level: profile.level ?? 1,
    totalXp: profile.xp ?? 0,
    perfectQuizzes,
    placementTaken: Boolean(profile.placement_at),
  };
}

function toEarnedBadge(row: BadgeRow): EarnedBadge | null {
  const definition = getBadgeDefinition(row.badge_key);
  if (!definition) return null;
  return {
    key: definition.key,
    name: definition.name,
    description: definition.description,
    tier: definition.tier,
    earnedAt: row.earned_at,
  };
}

function sortByMostRecent(badges: EarnedBadge[]) {
  return [...badges].sort((left, right) => right.earnedAt.localeCompare(left.earnedAt) || left.key.localeCompare(right.key));
}

/**
 * Attribue les badges mérités et pas encore obtenus. Deux synchronisations
 * simultanées n'attribuent un badge qu'une fois (on conflict do nothing) et
 * seul l'appel qui l'a réellement inséré le renvoie comme nouveau.
 */
export async function syncBadges(userId: string, admin: AdminClient = createSupabaseAdminClient()): Promise<BadgeSyncResult> {
  const [stats, existingResult] = await Promise.all([
    computeBadgeStats(userId, admin),
    admin.from("user_badges").select("badge_key, earned_at").eq("user_id", userId),
  ]);
  if (existingResult.error) throw existingResult.error;

  const existing = (existingResult.data ?? []) as BadgeRow[];
  const owned = new Set(existing.map((row) => row.badge_key));
  const fresh = evaluateBadges(stats).filter((key) => !owned.has(key));
  let inserted: BadgeRow[] = [];

  if (fresh.length > 0) {
    const { data, error } = await admin
      .from("user_badges")
      .upsert(
        fresh.map((key) => ({ user_id: userId, badge_key: key })),
        { onConflict: "user_id,badge_key", ignoreDuplicates: true }
      )
      .select("badge_key, earned_at");
    if (error) throw error;
    inserted = (data ?? []) as BadgeRow[];
  }

  const insertedKeys = new Set(inserted.map((row) => row.badge_key));
  const all = sortByMostRecent(
    [...existing, ...inserted].map(toEarnedBadge).filter((badge): badge is EarnedBadge => Boolean(badge))
  );
  // Ordre des définitions : du plus simple au plus rare.
  const newlyEarned = BADGES.filter((badge: BadgeDefinition) => insertedKeys.has(badge.key)).map((badge) => ({
    key: badge.key,
    name: badge.name,
    tier: badge.tier,
  }));
  return { all, newlyEarned, stats };
}

/**
 * Version sans risque pour les actions de score : un badge ne fait jamais
 * échouer l'enregistrement d'une partie. Renvoie les badges nouvellement obtenus.
 */
export async function syncBadgesSafely(userId: string): Promise<NewBadge[]> {
  try {
    return (await syncBadges(userId)).newlyEarned;
  } catch (error) {
    console.error("[badges] sync failed", error);
    return [];
  }
}

/** Badges obtenus, du plus récent au plus ancien. Table absente : liste vide. */
export async function getUserBadges(userId: string, admin: AdminClient = createSupabaseAdminClient()): Promise<EarnedBadge[]> {
  const { data, error } = await admin.from("user_badges").select("badge_key, earned_at").eq("user_id", userId);
  if (error) {
    console.error("[badges] read failed", error);
    return [];
  }
  return sortByMostRecent(((data ?? []) as BadgeRow[]).map(toEarnedBadge).filter((badge): badge is EarnedBadge => Boolean(badge)));
}

/**
 * Pour les pages (accueil, profil) : synchronise pour rattraper les badges
 * gagnés ailleurs (test de niveau, mission validée depuis la carte), puis
 * renvoie la liste. En cas d'échec, simple lecture.
 */
export async function loadBadgesWithSync(userId: string): Promise<{ all: EarnedBadge[]; newlyEarned: NewBadge[]; stats: BadgeStats | null }> {
  try {
    return await syncBadges(userId);
  } catch (error) {
    console.error("[badges] page sync failed", error);
    return { all: await getUserBadges(userId), newlyEarned: [], stats: null };
  }
}
