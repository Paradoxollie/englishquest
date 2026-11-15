/**
 * Codage de `user_course_progress.best_score`.
 *
 * La colonne garde la progression d'une mission dans un seul entier :
 * 9 000 000 + 1 000 000 si le cours a été lu + total du quiz × 1 000 + score
 * du meilleur quiz. La valeur 8 000 000 marque un cours acquis au test de
 * niveau, sans avoir été joué.
 *
 * Module pur, sans dépendance serveur : importable depuis les composants
 * client, les pages serveur et les tests.
 */

export const COURSE_MISSION_TELEMETRY_MAGIC = 9_000_000;
const COURSE_MISSION_TELEMETRY_READ_FLAG = 1_000_000;
const COURSE_MISSION_TELEMETRY_TOTAL_FACTOR = 1_000;

/** Même valeur que PLACEMENT_SKIP_MARK (lib/placement/placement.ts), vérifiée par les tests. */
export const COURSE_PLACEMENT_SKIP_MARK = 8_000_000;

export type DecodedCourseMissionTelemetry = {
  readingCheckpointReached: boolean;
  quizScore: number;
  quizTotal: number;
};

export function clampMissionNumber(value: number) {
  return Math.max(0, Math.min(999, Math.floor(value)));
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

/** Cours validé par le test de niveau, pas joué. */
export function isCoursePlacementSkip(value: number | null | undefined) {
  return typeof value === "number" && value === COURSE_PLACEMENT_SKIP_MARK;
}
