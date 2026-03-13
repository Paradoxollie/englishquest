import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getUserCourseChallengeProgress } from "@/lib/courses/mission-progress";
import { getUserCourseRoadmap, type CourseRoadmapEntry } from "@/lib/courses/progress";

const COURSE_MISSION_TELEMETRY_MAGIC = 9_000_000;
const COURSE_MISSION_TELEMETRY_READ_FLAG = 1_000_000;
const COURSE_MISSION_TELEMETRY_TOTAL_FACTOR = 1_000;

export const COURSE_QUIZ_PASS_RATIO = 0.8;

type DecodedCourseMissionTelemetry = {
  readingCheckpointReached: boolean;
  quizScore: number;
  quizTotal: number;
};

export type CourseMissionState = {
  readingCheckpointReached: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  quizAccuracy: number | null;
  quizPassed: boolean;
  bestGameScore: number | null;
  gameChallengeReached: boolean;
  readyToComplete: boolean;
};

function clampMissionNumber(value: number) {
  return Math.max(0, Math.min(999, Math.floor(value)));
}

export function isCourseQuizScorePassing(score: number, total: number) {
  if (total <= 0) {
    return false;
  }

  return score / total >= COURSE_QUIZ_PASS_RATIO;
}

export function decodeCourseMissionTelemetry(
  value: number | null | undefined
): DecodedCourseMissionTelemetry {
  if (typeof value !== "number" || value < COURSE_MISSION_TELEMETRY_MAGIC) {
    return {
      readingCheckpointReached: false,
      quizScore: 0,
      quizTotal: 0,
    };
  }

  const payload = value - COURSE_MISSION_TELEMETRY_MAGIC;
  const readingCheckpointReached =
    Math.floor(payload / COURSE_MISSION_TELEMETRY_READ_FLAG) > 0;
  const quizPayload = payload % COURSE_MISSION_TELEMETRY_READ_FLAG;
  const quizTotal = Math.floor(quizPayload / COURSE_MISSION_TELEMETRY_TOTAL_FACTOR);
  const quizScore = quizPayload % COURSE_MISSION_TELEMETRY_TOTAL_FACTOR;

  return {
    readingCheckpointReached,
    quizScore,
    quizTotal,
  };
}

export function encodeCourseMissionTelemetry(
  telemetry: DecodedCourseMissionTelemetry
) {
  return (
    COURSE_MISSION_TELEMETRY_MAGIC +
    (telemetry.readingCheckpointReached ? COURSE_MISSION_TELEMETRY_READ_FLAG : 0) +
    clampMissionNumber(telemetry.quizTotal) * COURSE_MISSION_TELEMETRY_TOTAL_FACTOR +
    clampMissionNumber(telemetry.quizScore)
  );
}

function buildCourseMissionState(
  telemetry: DecodedCourseMissionTelemetry,
  gameChallenge: Awaited<ReturnType<typeof getUserCourseChallengeProgress>>
): CourseMissionState {
  const hasQuizResult = telemetry.quizTotal > 0;
  const quizAccuracy = hasQuizResult
    ? Math.round((telemetry.quizScore / telemetry.quizTotal) * 100)
    : null;
  const quizPassed = hasQuizResult
    ? isCourseQuizScorePassing(telemetry.quizScore, telemetry.quizTotal)
    : false;
  const readingCheckpointReached =
    telemetry.readingCheckpointReached || hasQuizResult;

  return {
    readingCheckpointReached,
    quizScore: hasQuizResult ? telemetry.quizScore : null,
    quizTotal: hasQuizResult ? telemetry.quizTotal : null,
    quizAccuracy,
    quizPassed,
    bestGameScore: gameChallenge.bestScore,
    gameChallengeReached: gameChallenge.reached,
    readyToComplete: quizPassed && gameChallenge.reached,
  };
}

function buildFallbackCourseMissionState(entry: CourseRoadmapEntry): CourseMissionState {
  const telemetry = decodeCourseMissionTelemetry(entry.missionTelemetry);
  const mission = getCourseMissionPlan(entry);
  const hasQuizResult = telemetry.quizTotal > 0;
  const quizAccuracy = hasQuizResult
    ? Math.round((telemetry.quizScore / telemetry.quizTotal) * 100)
    : null;
  const quizPassed = hasQuizResult
    ? isCourseQuizScorePassing(telemetry.quizScore, telemetry.quizTotal)
    : false;

  return {
    readingCheckpointReached: telemetry.readingCheckpointReached || hasQuizResult,
    quizScore: hasQuizResult ? telemetry.quizScore : null,
    quizTotal: hasQuizResult ? telemetry.quizTotal : null,
    quizAccuracy,
    quizPassed,
    bestGameScore: null,
    gameChallengeReached: !mission.primaryGameSlug,
    readyToComplete: quizPassed && !mission.primaryGameSlug,
  };
}

async function refreshMissionState(userId: string, courseNumber: number) {
  const roadmap = await getUserCourseRoadmap(userId);
  const entry = roadmap.entries.find((item) => item.courseId === courseNumber) ?? null;

  if (!entry) {
    return null;
  }

  return getUserCourseMissionState(userId, entry);
}

async function updateCourseMissionTelemetry(
  userId: string,
  courseNumber: number,
  updater: (current: DecodedCourseMissionTelemetry) => DecodedCourseMissionTelemetry
) {
  const roadmap = await getUserCourseRoadmap(userId);
  const entry = roadmap.entries.find((item) => item.courseId === courseNumber) ?? null;

  if (!entry?.progressId || entry.status === "locked") {
    return null;
  }

  const current = decodeCourseMissionTelemetry(entry.missionTelemetry);
  const next = updater(current);
  const adminClient = createSupabaseAdminClient();

  await adminClient
    .from("user_course_progress")
    .update({
      best_score: encodeCourseMissionTelemetry(next),
    })
    .eq("id", entry.progressId);

  return refreshMissionState(userId, courseNumber);
}

export async function getUserCourseMissionState(
  userId: string,
  entry: CourseRoadmapEntry
): Promise<CourseMissionState> {
  try {
    const telemetry = decodeCourseMissionTelemetry(entry.missionTelemetry);
    const gameChallenge = await getUserCourseChallengeProgress(userId, entry);

    return buildCourseMissionState(telemetry, gameChallenge);
  } catch {
    return buildFallbackCourseMissionState(entry);
  }
}

export async function recordCourseReadingCheckpoint(
  userId: string,
  courseNumber: number
) {
  return updateCourseMissionTelemetry(userId, courseNumber, (current) => {
    if (current.readingCheckpointReached) {
      return current;
    }

    return {
      ...current,
      readingCheckpointReached: true,
    };
  });
}

export async function submitCourseQuizResult(
  userId: string,
  courseNumber: number,
  score: number,
  total: number
) {
  return updateCourseMissionTelemetry(userId, courseNumber, (current) => {
    const normalizedScore = clampMissionNumber(score);
    const normalizedTotal = Math.max(normalizedScore, clampMissionNumber(total));
    const currentAccuracy =
      current.quizTotal > 0 ? current.quizScore / current.quizTotal : -1;
    const nextAccuracy =
      normalizedTotal > 0 ? normalizedScore / normalizedTotal : -1;
    const shouldReplaceBest =
      nextAccuracy > currentAccuracy ||
      (nextAccuracy === currentAccuracy && normalizedScore > current.quizScore);

    return {
      readingCheckpointReached: true,
      quizScore: shouldReplaceBest ? normalizedScore : current.quizScore,
      quizTotal: shouldReplaceBest ? normalizedTotal : current.quizTotal,
    };
  });
}
