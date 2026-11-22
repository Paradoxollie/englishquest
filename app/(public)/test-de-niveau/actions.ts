"use server";

import { revalidatePath } from "next/cache";
import { revalidateCourseRoadmap } from "@/lib/courses/revalidate-roadmap";
import {
  PLACEMENT_LAST_TESTED_CHAPTER,
  applyPlacement,
  buildPlacementStep,
  gradePlacementStep,
  type PlacementStep,
} from "@/lib/placement/placement";
import { chapters } from "@/lib/courses/chapters";
import { createPlacementStepToken, createPlacementToken, readPlacementStepToken } from "@/lib/placement/placement-token";
import { getGuestProgress, keepGuestPlacement } from "@/lib/courses/guest-progress-server";
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
  nextToken?: string;
  retainedHigherChapter?: boolean;
};

export async function submitPlacementStepAction(
  chapter: number,
  answers: Record<string, number>,
  previousStep?: string
): Promise<PlacementStepResult | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (chapter !== 1 && readPlacementStepToken(previousStep) !== chapter) {
    return { error: "Recommence le test depuis le premier chapitre pour retrouver ta série." };
  }
  const graded = gradePlacementStep(answers, chapter);
  if (!graded.valid) {
    return { error: "Réponds aux six questions de la série du chapitre affiché." };
  }

  if (graded.passed && chapter < PLACEMENT_LAST_TESTED_CHAPTER) {
    return { ...graded, next: buildPlacementStep(chapter + 1), nextToken: createPlacementStepToken(chapter + 1), placed: null };
  }

  const placedChapter = graded.passed ? chapter + 1 : chapter;
  if (!user) {
    const token = createPlacementToken(placedChapter);
    const retained = await keepGuestPlacement(token);
    const target = chapters.find((item) => item.id === retained) ?? chapters[0];
    revalidateCourseRoadmap();
    revalidatePath("/tous-les-cours");
    return {
      ...graded,
      next: null,
      placed: { chapterId: target.id, chapterName: target.name, level: target.level, firstCourseId: target.courseIds[0] },
      retainedHigherChapter: target.id > placedChapter,
      guestToken: token,
    };
  }
  const placed = await applyPlacement(user.id, placedChapter);
  revalidateCourseRoadmap();
  revalidatePath("/home");
  return { ...graded, next: null, placed, retainedHigherChapter: placed.chapterId > placedChapter };
}

export async function restartPlacementAction(): Promise<PlacementStep | null> {
  return buildPlacementStep(1);
}

export async function restoreGuestPlacementAction(token: string) {
  const chapter = await keepGuestPlacement(token);
  if (chapter !== null) {
    revalidateCourseRoadmap();
    revalidatePath("/tous-les-cours");
  }
  return chapter;
}

export async function confirmGuestPlacementAction(chapter: number) {
  return ((await getGuestProgress()).placementChapter ?? 0) >= chapter;
}
