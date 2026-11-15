import "server-only";
import { QUIZ_SIZE, isExerciseAnswerCorrect, type ExerciseAnswer } from "./exercise-check";
import { getCourseQuizPool } from "./exercises-server";

/**
 * Correction du quiz de cours côté serveur.
 *
 * Le navigateur tire une série de dix exercices dans la banque du cours (les
 * dix questions d'origine et les exercices supplémentaires) et envoie, pour
 * chacun, l'indice d'origine choisi (QCM) ou le texte saisi (phrase à
 * compléter, phrase à remettre dans l'ordre). Le serveur recalcule la note.
 * Une série incomplète, un exercice d'un autre cours, un doublon ou un choix
 * inexistant est refusé.
 */

/** Ancien format (identifiant numérique) accepté : pages encore ouvertes avant la mise à jour. */
export type CourseQuizAnswer = { id: string | number; choice?: number; text?: string };

const MAX_TEXT_LENGTH = 200;

export function gradeCourseQuiz(
  courseNumber: number,
  answers: unknown
): { score: number; total: number } | null {
  if (!Number.isInteger(courseNumber) || !Array.isArray(answers)) {
    return null;
  }

  const pool = getCourseQuizPool(courseNumber);
  const expected = Math.min(QUIZ_SIZE, pool.length);
  if (pool.length === 0 || answers.length !== expected) {
    return null;
  }

  const byId = new Map(pool.map((item) => [item.id, item]));
  const seen = new Set<string>();
  let score = 0;

  for (const raw of answers) {
    if (!raw || typeof raw !== "object") return null;
    const { id, choice, text } = raw as Partial<CourseQuizAnswer>;
    if (typeof id !== "string" && !Number.isInteger(id)) return null;
    const key = String(id);
    const item = byId.get(key);
    if (!item || seen.has(key)) return null;
    seen.add(key);

    const answer: ExerciseAnswer = { id: key };
    if (item.type === "mcq") {
      if (!Number.isInteger(choice) || (choice as number) < 0 || (choice as number) >= item.options.length) return null;
      answer.choice = choice as number;
    } else {
      if (typeof text !== "string" || text.length > MAX_TEXT_LENGTH) return null;
      answer.text = text;
    }
    if (isExerciseAnswerCorrect(item, answer)) score += 1;
  }

  return { score, total: expected };
}
