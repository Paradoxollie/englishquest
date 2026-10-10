"use server";

import { revalidatePath } from "next/cache";
import { gradeChapterExam, isChapterCompleted, recordChapterExam } from "@/lib/exams/exams";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ExamResult = {
  correct: number;
  total: number;
  passed: boolean;
  corrections: { id: string; correctAnswer: number; question: string; answer: string }[];
  rewards: { xp: number; gold: number };
  newLevel: number | null;
  firstPass: boolean;
  saved: boolean;
};

export async function submitChapterExamAction(
  chapter: number,
  answers: Record<string, number>
): Promise<ExamResult | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Connecte-toi pour passer l'examen." };
  }
  if (!(await isChapterCompleted(user.id, chapter))) {
    return { error: "Valide d'abord les dix missions du chapitre." };
  }

  const graded = gradeChapterExam(answers);
  if (graded.total === 0) {
    return { error: "Aucune réponse reçue." };
  }
  const record = await recordChapterExam(user.id, chapter, graded.correct, graded.total);
  revalidatePath("/quest");
  revalidatePath("/home");
  return { ...graded, ...record };
}
