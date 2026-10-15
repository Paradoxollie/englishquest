import "server-only";
import bank from "@/lib/placement/questions.json";
import type { ExerciseItem, McqItem } from "./exercise-check";
import { courseExercises } from "./exercises";

/**
 * Exercices supplémentaires d'un cours (lib/courses/exercises/courseN.json)
 * et banque complète d'un cours pour le quiz : les dix questions du cours
 * (identifiants 1 à 10) plus les exercices x1 à x13.
 */

type BankQuestion = { id: string; course: number; question: string; options: string[]; correctAnswer: number };

const cache = new Map<number, ExerciseItem[]>();

export function getCourseExtraExercises(courseNumber: number): ExerciseItem[] {
  if (!Number.isInteger(courseNumber) || courseNumber < 1 || courseNumber > 50) return [];
  const known = cache.get(courseNumber);
  if (known) return known;
  const data = courseExercises[courseNumber];
  const items: ExerciseItem[] = data && data.course === courseNumber && Array.isArray(data.items) ? data.items : [];
  cache.set(courseNumber, items);
  return items;
}

/** Les dix questions d'origine du cours, au format des exercices. */
export function getCourseNativeQuestions(courseNumber: number): McqItem[] {
  return (bank as BankQuestion[])
    .filter((question) => question.course === courseNumber && /^\d+-\d+$/.test(question.id))
    .map((question) => ({
      id: question.id.split("-")[1],
      type: "mcq" as const,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: "",
    }));
}

export function getCourseQuizPool(courseNumber: number): ExerciseItem[] {
  return [...getCourseNativeQuestions(courseNumber), ...getCourseExtraExercises(courseNumber)];
}
