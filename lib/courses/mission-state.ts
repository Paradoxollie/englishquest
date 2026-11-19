import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getUserCourseChallengeProgress } from "@/lib/courses/mission-progress";
import { getUserCourseRoadmap, type CourseRoadmapEntry } from "@/lib/courses/progress";
import { isCourseQuizScorePassing } from "./quiz-score";
import {
  clampMissionNumber,
  decodeCourseMissionTelemetry,
  encodeCourseMissionTelemetry,
  encodePlacementTelemetry,
  isCoursePlacementSkip,
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

  const adminClient = createSupabaseAdminClient();
  // A reading checkpoint or a second tab must not overwrite a better quiz.
  let previous = entry.missionTelemetry;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const updated = updater(decodeCourseMissionTelemetry(previous));
    const next = isCoursePlacementSkip(previous) && !isCourseQuizScorePassing(updated.quizScore, updated.quizTotal)
      ? encodePlacementTelemetry(updated) : encodeCourseMissionTelemetry(updated);
    if (next === previous) return refreshMissionState(userId, courseNumber);
    let update = adminClient.from("user_course_progress").update({ best_score: next }).eq("id", entry.progressId);
    update = previous == null ? update.is("best_score", null) : update.eq("best_score", previous);
    const { data, error } = await update.select("id").maybeSingle();
    if (error) throw error;
    if (data) return refreshMissionState(userId, courseNumber);
    const latest = await adminClient.from("user_course_progress").select("best_score").eq("id", entry.progressId).single();
    if (latest.error) throw latest.error;
    previous = latest.data.best_score;
  }
  throw new Error("La progression vient de changer. Réessaie la sauvegarde.");
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
