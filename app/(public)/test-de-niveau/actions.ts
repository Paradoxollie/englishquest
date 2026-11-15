"use server";

import { revalidatePath } from "next/cache";
import {
  PLACEMENT_LAST_TESTED_CHAPTER,
  applyPlacement,
  buildPlacementStep,
  gradePlacementStep,
  type PlacementStep,
} from "@/lib/placement/placement";
import { chapters } from "@/lib/courses/chapters";
import { createPlacementToken } from "@/lib/placement/placement-token";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlacementStepResult = {
  correct: number;
  total: number;
  passed: boolean;
  corrections: { id: string; correctAnswer: number }[];
  next: PlacementStep | null;
  placed: { chapterId: number; chapterName: string; level: string; firstCourseId: number } | null;
  /** Sans compte : résultat signé, à présenter à l'inscription. */
  guestToken?: string | null;
};

export async function submitPlacementStepAction(
  chapter: number,
  answers: Record<string, number>
): Promise<PlacementStepResult | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const graded = gradePlacementStep(answers, chapter);
  if (!graded.valid) {
    return { error: "Réponds aux six questions de la série du chapitre affiché." };
  }

  if (graded.passed && chapter < PLACEMENT_LAST_TESTED_CHAPTER) {
    return { ...graded, next: buildPlacementStep(chapter + 1), placed: null };
  }

  const placedChapter = graded.passed ? chapter + 1 : chapter;
  if (!user) {
    // Sans compte, rien n'est enregistré : le résultat signé attend l'inscription.
    const target = chapters.find((item) => item.id === placedChapter) ?? chapters[0];
    return {
      ...graded,
      next: null,
      placed: { chapterId: target.id, chapterName: target.name, level: target.level, firstCourseId: target.courseIds[0] },
      guestToken: createPlacementToken(target.id),
    };
  }
  const placed = await applyPlacement(user.id, placedChapter);
  revalidatePath("/quest");
  revalidatePath("/home");
  return { ...graded, next: null, placed };
}

export async function restartPlacementAction(): Promise<PlacementStep | null> {
  return buildPlacementStep(1);
}
