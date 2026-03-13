import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getGameBySlug } from "@/lib/games/config";
import { getCourseMetadata, getCourseRewardProfile } from "./metadata";
import { getCourseById, paliers, type CourseType } from "./data";

export type CourseStatus = "locked" | "unlocked" | "in_progress" | "completed";

type DbCourseRecord = {
  id: string;
  course_number: number;
  title: string;
  description: string | null;
  reward_xp: number;
  reward_gold: number;
  required_xp: number;
};

type DbProgressRecord = {
  id: string;
  course_id: string;
  status: CourseStatus;
  best_score: number | null;
  completed_at: string | null;
  updated_at: string;
  created_at: string;
};

export type CourseRoadmapEntry = {
  databaseId: string | null;
  progressId: string | null;
  missionTelemetry: number | null;
  courseId: number;
  title: string;
  type: CourseType;
  description: string;
  status: CourseStatus;
  rewardXp: number;
  rewardGold: number;
  palierId: number;
  levelLabel: string;
  typeLabel: string;
  estimatedMinutes: number;
  summary: string;
  learningGoals: string[];
  focusTags: string[];
  recommendedGameSlugs: string[];
};

export type CourseRoadmap = {
  entries: CourseRoadmapEntry[];
  currentCourse: CourseRoadmapEntry | null;
  recommendedCourse: CourseRoadmapEntry | null;
  nextCourse: CourseRoadmapEntry | null;
  reviewCourse: CourseRoadmapEntry | null;
  completedCount: number;
  totalCourses: number;
  completionRate: number;
  currentPalier: {
    id: number;
    title: string;
    level: string;
    completedCount: number;
    totalCourses: number;
  } | null;
  recommendedGameSlugs: string[];
  studyPlan: string[];
};

function buildCourseDescription(courseNumber: number) {
  const metadata = getCourseMetadata(courseNumber);
  return metadata.summary;
}

function buildCatalogSeed() {
  return paliers.flatMap((palier) =>
    palier.courses.map((course, index) => {
      const rewards = getCourseRewardProfile(course.id);
      return {
        course_number: course.id,
        title: course.title,
        description: buildCourseDescription(course.id),
        required_xp: (palier.id - 1) * 250 + index * 30,
        reward_xp: rewards.xp,
        reward_gold: rewards.gold,
      };
    })
  );
}

async function ensureCourseCatalog(): Promise<DbCourseRecord[]> {
  const adminClient = createSupabaseAdminClient();
  const seedRows = buildCatalogSeed();
  const { data: existingCatalog, error: existingError } = await adminClient
    .from("courses")
    .select("id, course_number, title, description, reward_xp, reward_gold, required_xp")
    .order("course_number", { ascending: true });

  if (existingError) {
    throw existingError;
  }

  const existingEntries = (existingCatalog ?? []) as DbCourseRecord[];
  const existingByNumber = new Map(
    existingEntries.map((entry) => [entry.course_number, entry])
  );
  const needsSync =
    existingEntries.length !== seedRows.length ||
    seedRows.some((seed) => {
      const existing = existingByNumber.get(seed.course_number);
      return (
        !existing ||
        existing.title !== seed.title ||
        existing.description !== seed.description ||
        existing.reward_xp !== seed.reward_xp ||
        existing.reward_gold !== seed.reward_gold ||
        existing.required_xp !== seed.required_xp
      );
    });

  if (!needsSync) {
    return existingEntries;
  }

  const { error: upsertError } = await adminClient
    .from("courses")
    .upsert(seedRows, { onConflict: "course_number" });

  if (upsertError) {
    throw upsertError;
  }

  const { data, error } = await adminClient
    .from("courses")
    .select("id, course_number, title, description, reward_xp, reward_gold, required_xp")
    .order("course_number", { ascending: true });

  if (error || !data) {
    throw error ?? new Error("Unable to load courses catalog");
  }

  return data as DbCourseRecord[];
}

async function ensureUserProgressRows(
  userId: string,
  catalog: DbCourseRecord[]
): Promise<DbProgressRecord[]> {
  const adminClient = createSupabaseAdminClient();
  const { data: existingProgress, error: existingError } = await adminClient
    .from("user_course_progress")
    .select("id, course_id, status, best_score, completed_at, updated_at, created_at")
    .eq("user_id", userId);

  if (existingError) {
    throw existingError;
  }

  const progressRows = (existingProgress ?? []) as DbProgressRecord[];
  const existingCourseIds = new Set(progressRows.map((row) => row.course_id));

  if (progressRows.length === 0) {
    const initialRows = catalog.map((course, index) => ({
      user_id: userId,
      course_id: course.id,
      status: index === 0 ? "unlocked" : "locked",
    }));

    const { error: insertError } = await adminClient
      .from("user_course_progress")
      .insert(initialRows);

    if (insertError) {
      throw insertError;
    }
  } else if (existingCourseIds.size < catalog.length) {
    const missingRows = catalog
      .filter((course) => !existingCourseIds.has(course.id))
      .map((course) => ({
        user_id: userId,
        course_id: course.id,
        status: "locked" as CourseStatus,
      }));

    if (missingRows.length > 0) {
      const { error: insertError } = await adminClient
        .from("user_course_progress")
        .insert(missingRows);

      if (insertError) {
        throw insertError;
      }
    }
  }

  const { data: refreshedProgress, error: refreshError } = await adminClient
    .from("user_course_progress")
    .select("id, course_id, status, best_score, completed_at, updated_at, created_at")
    .eq("user_id", userId);

  if (refreshError || !refreshedProgress) {
    throw refreshError ?? new Error("Unable to refresh course progress");
  }

  const rows = refreshedProgress as DbProgressRecord[];
  const progressByCourseId = new Map(rows.map((row) => [row.course_id, row]));
  const hasAnyActiveStatus = rows.some((row) => row.status !== "locked");
  const updates: Array<{ id: string; status: CourseStatus }> = [];
  let previousEffectiveStatus: CourseStatus | null = null;

  for (const course of catalog) {
    const row = progressByCourseId.get(course.id);

    if (!row) {
      continue;
    }

    let nextStatus = row.status;

    if (course.course_number === 1 && !hasAnyActiveStatus && row.status === "locked") {
      nextStatus = "unlocked";
    } else if (
      previousEffectiveStatus === "completed" &&
      row.status === "locked"
    ) {
      nextStatus = "unlocked";
    }

    if (nextStatus !== row.status) {
      updates.push({ id: row.id, status: nextStatus });
      row.status = nextStatus;
    }

    previousEffectiveStatus = row.status;
  }

  if (updates.length > 0) {
    await Promise.all(
      updates.map((update) =>
        adminClient
          .from("user_course_progress")
          .update({ status: update.status })
          .eq("id", update.id)
      )
    );
  }

  return rows;
}

function buildRoadmapEntries(
  catalog: Array<DbCourseRecord | null>,
  progressMap: Map<number, DbProgressRecord | null>
): CourseRoadmapEntry[] {
  return paliers.flatMap((palier) =>
    palier.courses.map((course) => {
      const metadata = getCourseMetadata(course.id);
      const catalogEntry = catalog.find((entry) => entry?.course_number === course.id) ?? null;
      const progressEntry = progressMap.get(course.id) ?? null;
      const rewards = catalogEntry
        ? { xp: catalogEntry.reward_xp, gold: catalogEntry.reward_gold }
        : getCourseRewardProfile(course.id);

      return {
        databaseId: catalogEntry?.id ?? null,
        progressId: progressEntry?.id ?? null,
        missionTelemetry: progressEntry?.best_score ?? null,
        courseId: course.id,
        title: course.title,
        type: course.type,
        description: catalogEntry?.description ?? metadata.summary,
        status: progressEntry?.status ?? (course.id === 1 ? "unlocked" : "locked"),
        rewardXp: rewards.xp,
        rewardGold: rewards.gold,
        palierId: metadata.palierId,
        levelLabel: metadata.levelLabel,
        typeLabel: metadata.typeLabel,
        estimatedMinutes: metadata.estimatedMinutes,
        summary: metadata.summary,
        learningGoals: metadata.learningGoals,
        focusTags: metadata.focusTags,
        recommendedGameSlugs: metadata.recommendedGameSlugs,
      };
    })
  );
}

function getCurrentPalierSummary(entries: CourseRoadmapEntry[], focusCourse: CourseRoadmapEntry | null) {
  const palierId = focusCourse?.palierId ?? entries[0]?.palierId;
  if (!palierId) {
    return null;
  }

  const palier = paliers.find((entry) => entry.id === palierId);
  const palierEntries = entries.filter((entry) => entry.palierId === palierId);

  if (!palier || palierEntries.length === 0) {
    return null;
  }

  return {
    id: palier.id,
    title: palier.title,
    level: palier.level,
    completedCount: palierEntries.filter((entry) => entry.status === "completed").length,
    totalCourses: palierEntries.length,
  };
}

function buildStudyPlan(
  roadmap: Pick<CourseRoadmap, "recommendedCourse" | "nextCourse" | "recommendedGameSlugs" | "completedCount" | "totalCourses">
) {
  const recommendedCourse = roadmap.recommendedCourse;
  const recommendedGames = roadmap.recommendedGameSlugs
    .map((slug) => getGameBySlug(slug)?.name)
    .filter((name): name is string => Boolean(name));

  const steps: string[] = [];

  if (recommendedCourse) {
    steps.push(
      `Lire le cours ${recommendedCourse.courseId}: ${recommendedCourse.title}`
    );
  }

  if (recommendedGames.length > 0) {
    steps.push(`Ancrer la notion avec ${recommendedGames.slice(0, 2).join(" puis ")}`);
  }

  if (roadmap.nextCourse && roadmap.nextCourse.courseId !== recommendedCourse?.courseId) {
    steps.push(`Preparer la suite avec le cours ${roadmap.nextCourse.courseId}`);
  } else {
    steps.push(
      `Faire progresser le parcours (${roadmap.completedCount}/${roadmap.totalCourses} cours termines)`
    );
  }

  return steps.slice(0, 3);
}

export function buildGuestCourseRoadmap(): CourseRoadmap {
  const entries = buildRoadmapEntries([], new Map());
  const recommendedCourse =
    entries.find((entry) => entry.status === "in_progress") ??
    entries.find((entry) => entry.status === "unlocked") ??
    entries[0] ??
    null;
  const nextCourse =
    recommendedCourse ? entries.find((entry) => entry.courseId === recommendedCourse.courseId + 1) ?? null : null;
  const reviewCourse = null;

  const roadmap: CourseRoadmap = {
    entries,
    currentCourse: null,
    recommendedCourse,
    nextCourse,
    reviewCourse,
    completedCount: 0,
    totalCourses: entries.length,
    completionRate: 0,
    currentPalier: getCurrentPalierSummary(entries, recommendedCourse),
    recommendedGameSlugs: recommendedCourse?.recommendedGameSlugs ?? [],
    studyPlan: [],
  };

  roadmap.studyPlan = buildStudyPlan(roadmap);
  return roadmap;
}

export async function getUserCourseRoadmap(userId: string): Promise<CourseRoadmap> {
  try {
    const catalog = await ensureCourseCatalog();
    const progressRows = await ensureUserProgressRows(userId, catalog);
    const catalogByNumber = new Map(catalog.map((entry) => [entry.course_number, entry]));
    const progressByCourseId = new Map(progressRows.map((row) => [row.course_id, row]));
    const progressMap = new Map<number, DbProgressRecord | null>();

    for (const catalogEntry of catalog) {
      progressMap.set(
        catalogEntry.course_number,
        progressByCourseId.get(catalogEntry.id) ?? null
      );
    }

    const entries = buildRoadmapEntries(
      Array.from(catalogByNumber.values()),
      progressMap
    );

    const currentCourse =
      entries.find((entry) => entry.status === "in_progress") ?? null;
    const recommendedCourse =
      currentCourse ??
      entries.find((entry) => entry.status === "unlocked") ??
      entries.find((entry) => entry.status !== "completed") ??
      null;
    const nextCourse =
      recommendedCourse
        ? entries.find((entry) => entry.courseId === recommendedCourse.courseId + 1) ?? null
        : null;
    const reviewCourse =
      [...entries]
        .filter((entry) => entry.status === "completed")
        .sort((left, right) => right.courseId - left.courseId)[0] ?? null;
    const completedCount = entries.filter((entry) => entry.status === "completed").length;
    const completionRate = entries.length === 0 ? 0 : Math.round((completedCount / entries.length) * 100);

    const roadmap: CourseRoadmap = {
      entries,
      currentCourse,
      recommendedCourse,
      nextCourse,
      reviewCourse,
      completedCount,
      totalCourses: entries.length,
      completionRate,
      currentPalier: getCurrentPalierSummary(entries, recommendedCourse ?? currentCourse),
      recommendedGameSlugs: recommendedCourse?.recommendedGameSlugs ?? [],
      studyPlan: [],
    };

    roadmap.studyPlan = buildStudyPlan(roadmap);
    return roadmap;
  } catch {
    return buildGuestCourseRoadmap();
  }
}

export async function updateCourseProgressStatus(userId: string, courseNumber: number, status: CourseStatus) {
  const adminClient = createSupabaseAdminClient();
  const catalog = await ensureCourseCatalog();
  const progressRows = await ensureUserProgressRows(userId, catalog);
  const targetCourse = catalog.find((entry) => entry.course_number === courseNumber);

  if (!targetCourse) {
    throw new Error("Course not found");
  }

  const progressEntry = progressRows.find((row) => row.course_id === targetCourse.id);

  if (!progressEntry) {
    throw new Error("Progress entry not found");
  }

  if (progressEntry.status === "completed" && status === "in_progress") {
    return;
  }

  const previousCourse = catalog.find((entry) => entry.course_number === courseNumber - 1);
  const previousProgress = previousCourse
    ? progressRows.find((row) => row.course_id === previousCourse.id)
    : null;

  if (
    progressEntry.status === "locked" &&
    (status === "in_progress" || status === "completed") &&
    courseNumber !== 1 &&
    previousProgress?.status !== "completed"
  ) {
    return;
  }

  const nextCourse = catalog.find((entry) => entry.course_number === courseNumber + 1);
  const nextProgress = nextCourse
    ? progressRows.find((row) => row.course_id === nextCourse.id)
    : null;

  await adminClient
    .from("user_course_progress")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : progressEntry.completed_at,
    })
    .eq("id", progressEntry.id);

  if (status === "completed" && nextProgress && nextProgress.status === "locked") {
    await adminClient
      .from("user_course_progress")
      .update({ status: "unlocked" })
      .eq("id", nextProgress.id);
  }
}

export async function completeCourseAndGrantRewards(userId: string, courseNumber: number) {
  const adminClient = createSupabaseAdminClient();
  const catalog = await ensureCourseCatalog();
  const progressRows = await ensureUserProgressRows(userId, catalog);
  const targetCourse = catalog.find((entry) => entry.course_number === courseNumber);

  if (!targetCourse) {
    throw new Error("Course not found");
  }

  const progressEntry = progressRows.find((row) => row.course_id === targetCourse.id);

  if (!progressEntry) {
    throw new Error("Progress entry not found");
  }

  if (progressEntry.status !== "completed") {
    await updateCourseProgressStatus(userId, courseNumber, "completed");

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("xp, gold, level")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw profileError ?? new Error("Profile not found");
    }

    const currentCourse = getCourseById(courseNumber);
    const rewards = {
      xp: targetCourse.reward_xp ?? getCourseRewardProfile(courseNumber).xp,
      gold: targetCourse.reward_gold ?? getCourseRewardProfile(courseNumber).gold,
    };
    const newXP = (profile.xp ?? 0) + rewards.xp;
    const newGold = (profile.gold ?? 0) + rewards.gold;
    const newLevel = 1 + Math.floor(newXP / 200);

    await adminClient
      .from("profiles")
      .update({
        xp: newXP,
        gold: newGold,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return {
      courseTitle: currentCourse?.title ?? `Cours ${courseNumber}`,
      rewards,
      newLevel,
    };
  }

  return {
    courseTitle: getCourseById(courseNumber)?.title ?? `Cours ${courseNumber}`,
    rewards: {
      xp: 0,
      gold: 0,
    },
    newLevel: null,
  };
}
