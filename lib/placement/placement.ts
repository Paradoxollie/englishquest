import "server-only";
import { isCoursePlacementSkip, COURSE_PLACEMENT_SKIP_MARK } from "@/lib/courses/mission-telemetry";
import { chapters } from "@/lib/courses/chapters";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import bank from "./questions.json";

/**
 * Test de niveau. Le joueur répond à six questions par chapitre, tirées des
 * quiz des cours de ce chapitre. Un chapitre est acquis à partir de quatre
 * bonnes réponses sur six. Le test s'arrête au premier chapitre non acquis,
 * et le joueur commence là. Les chapitres acquis sont marqués validés sur la
 * carte, sans récompense : on ne gagne pas d'XP pour ce qu'on savait déjà.
 */

export const PLACEMENT_QUESTIONS_PER_CHAPTER = 6;
export const PLACEMENT_PASS_COUNT = 4;
/** Dernier chapitre testable : réussir le 4 place au chapitre 5. */
export const PLACEMENT_LAST_TESTED_CHAPTER = 4;
/** Marqueur dans best_score : cours acquis au test de niveau, pas joué. */
export const PLACEMENT_SKIP_MARK = COURSE_PLACEMENT_SKIP_MARK;

type BankQuestion = {
  id: string;
  course: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export type PlacementQuestion = {
  id: string;
  question: string;
  options: string[];
};

export type PlacementStep = {
  chapter: number;
  chapterName: string;
  level: string;
  questions: PlacementQuestion[];
};

const questions = bank as BankQuestion[];
const byId = new Map(questions.map((question) => [question.id, question]));

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function isPlacementSkip(bestScore: number | null | undefined) {
  return isCoursePlacementSkip(bestScore);
}

/** Six questions d'un chapitre, chacune venant d'un cours différent. */
export function buildPlacementStep(chapterId: number): PlacementStep | null {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter || chapterId > PLACEMENT_LAST_TESTED_CHAPTER) {
    return null;
  }
  const courseIds = shuffle(chapter.courseIds).slice(0, PLACEMENT_QUESTIONS_PER_CHAPTER);
  const picked: PlacementQuestion[] = [];
  for (const courseId of courseIds) {
    const pool = questions.filter((question) => question.course === courseId);
    const choice = shuffle(pool)[0];
    if (choice) {
      picked.push({ id: choice.id, question: choice.question, options: choice.options });
    }
  }
  return { chapter: chapter.id, chapterName: chapter.name, level: chapter.level, questions: picked };
}

export function gradePlacementStep(answers: Record<string, number>, chapterId: number) {
  const invalid = { correct: 0, total: 0, passed: false, valid: false, corrections: [] as { id: string; correctAnswer: number }[] };
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter || chapterId > PLACEMENT_LAST_TESTED_CHAPTER || !answers || typeof answers !== "object" || Array.isArray(answers)
    || Object.keys(answers).length !== PLACEMENT_QUESTIONS_PER_CHAPTER) return invalid;
  const allowedCourses = new Set(chapter.courseIds);
  const seenCourses = new Set<number>();
  let correct = 0;
  let total = 0;
  const corrections: { id: string; correctAnswer: number }[] = [];
  for (const [id, answer] of Object.entries(answers)) {
    const question = byId.get(id);
    if (!question || !allowedCourses.has(question.course) || seenCourses.has(question.course)
      || !Number.isInteger(answer) || answer < 0 || answer >= question.options.length) return invalid;
    seenCourses.add(question.course);
    total += 1;
    if (question.correctAnswer === answer) {
      correct += 1;
    }
    corrections.push({ id, correctAnswer: question.correctAnswer });
  }
  return { correct, total, passed: correct >= PLACEMENT_PASS_COUNT, valid: true, corrections };
}

/**
 * Ouvre les chapitres acquis et rattache les vrais quiz invités dans la même
 * transaction. Les notes antérieures et les récompenses déjà versées sont conservées.
 */
export async function applyPlacement(userId: string, chapterId: number, results: { course: number; score: number }[] = []) {
  await getUserCourseRoadmap(userId); // Initialise les 50 entrées du compte avant la transaction.
  const { data, error } = await createSupabaseAdminClient().rpc("apply_verified_placement", {
    p_user_id: userId, p_chapter: chapterId, p_results: results,
  });
  if (error) throw error;
  const target = chapters.find((item) => item.id === data);
  if (!target) throw new Error("Le chapitre conseillé est indisponible.");
  return { chapterId: target.id, chapterName: target.name, level: target.level, firstCourseId: target.courseIds[0] };
}

/** Le joueur a-t-il déjà passé le test (ou déjà avancé sur la carte) ? */
export async function getPlacementStatus(userId: string): Promise<{ taken: boolean; chapter: number | null }> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("profiles").select("placement_chapter, placement_at").eq("id", userId).maybeSingle();
  if (error || !data) {
    return { taken: false, chapter: null };
  }
  const row = data as { placement_chapter?: number | null; placement_at?: string | null };
  return { taken: Boolean(row.placement_at), chapter: row.placement_chapter ?? null };
}
