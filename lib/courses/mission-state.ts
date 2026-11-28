import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getUserCourseChallengeProgress } from "@/lib/courses/mission-progress";
import { getUserCourseRoadmap, type CourseRoadmapEntry } from "@/lib/courses/progress";
import { isCourseQuizScorePassing } from "./quiz-score";
import {
  decodeCourseMissionTelemetry,
  encodeCourseMissionTelemetry,
  type DecodedCourseMissionTelemetry,
} from "./mission-telemetry";
export { isCourseQuizScorePassing };
export { COURSE_QUIZ_PASS_RATIO } from "./quiz-score";
// Le codage de best_score vit dans un module pur, partagé avec les étoiles et les badges.
export { decodeCourseMissionTelemetry, encodeCourseMissionTelemetry };

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
    // Le quiz à 80 % valide la mission ; le jeu est un entraînement, il ne bloque plus.
    readyToComplete: quizPassed,
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
    readyToComplete: quizPassed,
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

/** The history receipt and the mission's best mark are written in one transaction. */
export async function recordLearningCheckpoint(
  userId: string,
  courseNumber: number,
  quiz?: { attemptId: string; score: number; total: number },
  refresh = true,
) {
  const { data: countsForMission, error } = await createSupabaseAdminClient().rpc("record_learning_checkpoint", {
    p_user: userId, p_course: courseNumber, p_attempt: quiz?.attemptId ?? null,
    p_score: quiz?.score ?? null, p_total: quiz?.total ?? null,
  });
  if (error) throw error;
  return countsForMission && refresh ? refreshMissionState(userId, courseNumber) : null;
}
