"use server";

import { revalidatePath } from "next/cache";
import {
  PLACEMENT_LAST_TESTED_CHAPTER,
  applyPlacement,
  buildPlacementStep,
  gradePlacementStep,
  type PlacementStep,
} from "@/lib/placement/placement";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlacementStepResult = {
  correct: number;
  total: number;
  passed: boolean;
  corrections: { id: string; correctAnswer: number }[];
  next: PlacementStep | null;
  placed: { chapterId: number; chapterName: string; level: string; firstCourseId: number } | null;
};

export async function submitPlacementStepAction(
  chapter: number,
  answers: Record<string, number>
): Promise<PlacementStepResult | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Connecte-toi pour passer le test." };
  }

  const graded = gradePlacementStep(answers, chapter);
  if (!graded.valid) {
    return { error: "Réponds aux six questions de la série du chapitre affiché." };
  }

  if (graded.passed && chapter < PLACEMENT_LAST_TESTED_CHAPTER) {
    return { ...graded, next: buildPlacementStep(chapter + 1), placed: null };
  }

  const placedChapter = graded.passed ? chapter + 1 : chapter;
  const placed = await applyPlacement(user.id, placedChapter);
  revalidatePath("/quest");
  revalidatePath("/home");
  return { ...graded, next: null, placed };
}

export async function restartPlacementAction(): Promise<PlacementStep | null> {
  return buildPlacementStep(1);
}
