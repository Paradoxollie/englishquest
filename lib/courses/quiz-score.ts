/** Règle du quiz utilisable par les interfaces sans importer le serveur. */
export const COURSE_QUIZ_PASS_RATIO = 0.8;

export function isCourseQuizScorePassing(score: number, total: number) {
  return total > 0 && score / total >= COURSE_QUIZ_PASS_RATIO;
}
