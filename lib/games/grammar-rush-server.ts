import "server-only";
import { chapters } from "@/lib/courses/chapters";
import bank from "@/lib/placement/questions.json";
import type { RushQuestion } from "./grammar-rush";

type BankQuestion = { id: string; course: number; question: string; options: string[]; correctAnswer: number };

const questions = bank as BankQuestion[];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * File de questions pour une partie. `maxChapter` borne le niveau (tout ce
 * qui est au-dessus est exclu) ; `focusCourseId` fait revenir les questions
 * du cours de la mission en cours une fois sur trois.
 */
export function buildRushQueue({ maxChapter, focusCourseId }: { maxChapter: number; focusCourseId: number | null }): RushQuestion[] {
  const allowedCourses = new Set(chapters.filter((chapter) => chapter.id <= Math.max(1, maxChapter)).flatMap((chapter) => chapter.courseIds));
  const general = shuffle(questions.filter((question) => allowedCourses.has(question.course) && question.course !== focusCourseId));
  const focus = focusCourseId ? shuffle(questions.filter((question) => question.course === focusCourseId)) : [];

  const queue: RushQuestion[] = [];
  let g = 0;
  let f = 0;
  while (queue.length < 60 && (g < general.length || f < focus.length)) {
    const takeFocus = focus.length > 0 && f < focus.length && queue.length % 3 === 1;
    const next = takeFocus ? focus[f++] : general[g++] ?? focus[f++];
    if (next) queue.push(next);
  }
  return queue;
}
