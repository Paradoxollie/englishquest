import "server-only";
import { chapters } from "@/lib/courses/chapters";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { getChapterExamReward, getLevelFromXP } from "@/lib/profile/economy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import bank from "@/lib/placement/questions.json";

/**
 * Examen de chapitre : quinze questions tirées des dix cours du chapitre,
 * deux au plus par cours, réussi à partir de douze bonnes réponses. Ouvert
 * quand les dix missions du chapitre sont validées. Récompense versée une
 * seule fois, à la première réussite ; on peut le repasser pour le score.
 */

export const EXAM_QUESTION_COUNT = 15;
export const EXAM_PASS_COUNT = 12;

type BankQuestion = { id: string; course: number; question: string; options: string[]; correctAnswer: number };

export type ExamQuestion = { id: string; question: string; options: string[] };

export type ChapterExamRecord = {
  chapter: number;
  bestCorrect: number;
  total: number;
  attempts: number;
  passedAt: string | null;
};

export type ChapterExamStatus = "locked" | "open" | "passed";

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

export function buildChapterExam(chapterId: number): ExamQuestion[] {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) return [];
  const perCourse = new Map<number, BankQuestion[]>();
  for (const courseId of chapter.courseIds) {
    perCourse.set(courseId, shuffle(questions.filter((question) => question.course === courseId)));
  }
  const picked: BankQuestion[] = [];
  // Un tour à une question par cours, puis un second tour jusqu'à quinze.
  for (let round = 0; round < 2 && picked.length < EXAM_QUESTION_COUNT; round += 1) {
    for (const courseId of shuffle(chapter.courseIds)) {
      if (picked.length >= EXAM_QUESTION_COUNT) break;
      const pool = perCourse.get(courseId) ?? [];
      const next = pool[round];
      if (next) picked.push(next);
    }
  }
  return shuffle(picked).map((question) => ({ id: question.id, question: question.question, options: question.options }));
}

export function gradeChapterExam(answers: Record<string, number>) {
  let correct = 0;
  let total = 0;
  const corrections: { id: string; correctAnswer: number; question: string; answer: string }[] = [];
  for (const [id, answer] of Object.entries(answers)) {
    const question = byId.get(id);
    if (!question) continue;
    total += 1;
    const isRight = question.correctAnswer === answer;
    if (isRight) correct += 1;
    else corrections.push({ id, correctAnswer: question.correctAnswer, question: question.question, answer: question.options[question.correctAnswer] });
  }
  return { correct, total, passed: correct >= EXAM_PASS_COUNT, corrections };
}

/** Résultats du joueur pour tous les chapitres. Table absente : liste vide. */
export async function getUserChapterExams(userId: string): Promise<ChapterExamRecord[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("chapter_exams")
    .select("chapter, best_correct, total, attempts, passed_at")
    .eq("user_id", userId);
  if (error || !data) {
    if (error && error.code !== "42P01") console.error("getUserChapterExams", error);
    return [];
  }
  return (data as { chapter: number; best_correct: number; total: number; attempts: number; passed_at: string | null }[]).map(
    (row) => ({ chapter: row.chapter, bestCorrect: row.best_correct, total: row.total, attempts: row.attempts, passedAt: row.passed_at })
  );
}

export function examStatus(record: ChapterExamRecord | undefined, chapterCompleted: boolean): ChapterExamStatus {
  if (record?.passedAt) return "passed";
  return chapterCompleted ? "open" : "locked";
}

export async function isChapterCompleted(userId: string, chapterId: number) {
  const roadmap = await getUserCourseRoadmap(userId);
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) return false;
  return chapter.courseIds.every((courseId) => roadmap.entries.find((entry) => entry.courseId === courseId)?.status === "completed");
}

/**
 * Enregistre une tentative. Verse la récompense à la première réussite.
 * Retourne la récompense versée (0 si déjà réussi ou raté).
 */
export async function recordChapterExam(userId: string, chapterId: number, correct: number, total: number) {
  const admin = createSupabaseAdminClient();
  const passed = correct >= EXAM_PASS_COUNT;
  const now = new Date().toISOString();

  const { data: existing } = await admin
    .from("chapter_exams")
    .select("id, best_correct, attempts, passed_at")
    .eq("user_id", userId)
    .eq("chapter", chapterId)
    .maybeSingle();

  const row = existing as { id: string; best_correct: number; attempts: number; passed_at: string | null } | null;
  const firstPass = passed && !row?.passed_at;

  const payload = {
    user_id: userId,
    chapter: chapterId,
    best_correct: Math.max(row?.best_correct ?? 0, correct),
    total,
    attempts: (row?.attempts ?? 0) + 1,
    passed_at: row?.passed_at ?? (passed ? now : null),
    updated_at: now,
  };

  const { error } = row
    ? await admin.from("chapter_exams").update(payload).eq("id", row.id)
    : await admin.from("chapter_exams").insert(payload);
  if (error) {
    console.error("recordChapterExam", error);
    return { rewards: { xp: 0, gold: 0 }, newLevel: null, saved: false, firstPass: false };
  }

  if (!firstPass) {
    return { rewards: { xp: 0, gold: 0 }, newLevel: null, saved: true, firstPass: false };
  }

  const rewards = getChapterExamReward(chapterId);
  const { data: profile } = await admin.from("profiles").select("xp, gold, level").eq("id", userId).single();
  const newXP = (profile?.xp ?? 0) + rewards.xp;
  const newGold = (profile?.gold ?? 0) + rewards.gold;
  const newLevel = getLevelFromXP(newXP);
  await admin.from("profiles").update({ xp: newXP, gold: newGold, level: newLevel, updated_at: now }).eq("id", userId);

  return { rewards, newLevel: newLevel > (profile?.level ?? 1) ? newLevel : null, saved: true, firstPass: true };
}
