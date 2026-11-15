/**
 * Étoiles de mission : de 0 à 3 par cours.
 *
 * 1. Mission validée : le cours est terminé en jouant (pas acquis au test de
 *    niveau) et son meilleur quiz atteint 80 %.
 * 2. Quiz parfait : le meilleur quiz du cours est à 10 sur 10.
 * 3. Entraînement ciblé : dans Grammar Rush ouvert sur ce cours, au moins
 *    cinq bonnes réponses sur ses questions dans une même partie.
 *
 * Module pur, sans dépendance serveur.
 */

import { decodeCourseMissionTelemetry, isCoursePlacementSkip } from "./mission-telemetry";
import { isCourseQuizScorePassing } from "./quiz-score";

export const STARS_PER_MISSION = 3;
/** Bonnes réponses sur le cours ciblé, dans une même partie, pour l'étoile d'entraînement. */
export const PRACTICE_STAR_TARGET = 5;

export type MissionStars = {
  validated: boolean;
  perfectQuiz: boolean;
  practice: boolean;
  count: number;
};

export const NO_MISSION_STARS: MissionStars = { validated: false, perfectQuiz: false, practice: false, count: 0 };

export type MissionStarInput = {
  completed: boolean;
  placementSkip: boolean;
  quizScore: number | null | undefined;
  quizTotal: number | null | undefined;
  practiceBest: number | null | undefined;
};

export function computeMissionStars(input: MissionStarInput): MissionStars {
  const total = Number.isFinite(input.quizTotal) ? Math.max(0, input.quizTotal as number) : 0;
  const score = Number.isFinite(input.quizScore) ? Math.max(0, input.quizScore as number) : 0;
  const hasQuiz = total > 0;
  // Une mission terminée avant le quiz serveur n'a pas de note : elle reste validée.
  const validated = input.completed && !input.placementSkip && (!hasQuiz || isCourseQuizScorePassing(score, total));
  const perfectQuiz = hasQuiz && score >= total;
  const practice = (input.practiceBest ?? 0) >= PRACTICE_STAR_TARGET;
  return {
    validated,
    perfectQuiz,
    practice,
    count: Number(validated) + Number(perfectQuiz) + Number(practice),
  };
}

/** Étoiles d'une entrée de la carte (statut et best_score codé). */
export function getMissionStars(
  entry: { status: string; missionTelemetry: number | null | undefined },
  practiceBest: number | null | undefined
): MissionStars {
  const telemetry = decodeCourseMissionTelemetry(entry.missionTelemetry);
  return computeMissionStars({
    completed: entry.status === "completed",
    placementSkip: isCoursePlacementSkip(entry.missionTelemetry),
    quizScore: telemetry.quizScore,
    quizTotal: telemetry.quizTotal,
    practiceBest,
  });
}

export function sumStars(list: Array<Pick<MissionStars, "count">>) {
  return list.reduce((total, stars) => total + stars.count, 0);
}

/** Phrase lisible par un lecteur d'écran : « 2 étoiles sur 3 : mission validée, quiz 10 sur 10 ». */
export function describeMissionStars(stars: MissionStars) {
  const parts = [
    stars.validated ? "mission validée" : null,
    stars.perfectQuiz ? "quiz 10 sur 10" : null,
    stars.practice ? "entraînement ciblé réussi" : null,
  ].filter((part): part is string => Boolean(part));
  const head = `${stars.count} étoile${stars.count > 1 ? "s" : ""} sur ${STARS_PER_MISSION}`;
  return parts.length > 0 ? `${head} : ${parts.join(", ")}` : head;
}
