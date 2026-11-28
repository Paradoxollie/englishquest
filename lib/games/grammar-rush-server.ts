import "server-only";
import { chapters } from "@/lib/courses/chapters";
import { courseExercises } from "@/lib/courses/exercises";
import nativeQuestions from "@/lib/placement/questions.json";
import { buildGrammarBank } from "./grammar-practice";
import { weaveRushQueue, type RushQuestion } from "./grammar-rush";

const questions = buildGrammarBank(nativeQuestions, courseExercises);

export function buildRushPool({ maxChapter }: { maxChapter: number }): RushQuestion[] {
  const allowed = new Set(chapters.filter(chapter => chapter.id <= Math.max(1, maxChapter)).flatMap(chapter => chapter.courseIds));
  return questions.filter(question => allowed.has(question.course));
}

export function buildRushQueue({ maxChapter, focusCourseId }: { maxChapter: number; focusCourseId: number | null }): RushQuestion[] {
  return weaveRushQueue(buildRushPool({ maxChapter }), focusCourseId);
}
