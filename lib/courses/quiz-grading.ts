import "server-only";
import bank from "@/lib/placement/questions.json";

/**
 * Correction du quiz de cours côté serveur.
 *
 * Le navigateur envoie, pour chaque question, l'indice de la réponse choisie
 * dans la liste d'origine (avant mélange). Le serveur recalcule la note à
 * partir de la banque de questions, synchronisée avec les cours par
 * scripts/tests/course-question-invariants.cjs. Une copie incomplète, une
 * question d'un autre cours ou un choix inexistant est refusé.
 */

export type CourseQuizAnswer = { id: number; choice: number };

type BankQuestion = { id: string; course: number; question: string; options: string[]; correctAnswer: number };

const questions = bank as BankQuestion[];

export function gradeCourseQuiz(
  courseNumber: number,
  answers: unknown
): { score: number; total: number } | null {
  if (!Number.isInteger(courseNumber) || !Array.isArray(answers)) {
    return null;
  }

  const courseQuestions = questions.filter((question) => question.course === courseNumber);
  if (courseQuestions.length === 0 || answers.length !== courseQuestions.length) {
    return null;
  }

  const byLocalId = new Map(
    courseQuestions.map((question) => [Number(question.id.split("-")[1]), question])
  );
  const seen = new Set<number>();
  let score = 0;

  for (const raw of answers) {
    if (!raw || typeof raw !== "object") return null;
    const { id, choice } = raw as Partial<CourseQuizAnswer>;
    if (!Number.isInteger(id) || !Number.isInteger(choice)) return null;
    const question = byLocalId.get(id as number);
    if (!question || seen.has(id as number)) return null;
    if ((choice as number) < 0 || (choice as number) >= question.options.length) return null;
    seen.add(id as number);
    if (choice === question.correctAnswer) score += 1;
  }

  return { score, total: courseQuestions.length };
}
