"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  completeCourseAndGrantRewards,
  getUserCourseRoadmap,
  launchCourseMission,
} from "@/lib/courses/progress";
import { gradeCourseQuiz, type CourseQuizAnswer } from "@/lib/courses/quiz-grading";
import {
  getUserCourseMissionState,
  recordCourseReadingCheckpoint,
  submitCourseQuizResult,
} from "@/lib/courses/mission-state";
import { syncBadgesSafely } from "@/lib/profile/badges-server";

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function revalidateCourseSurfaces(courseNumber: number) {
  revalidatePath(`/cours/${courseNumber}`);
  revalidatePath("/home");
  revalidatePath("/quest");
  revalidatePath("/play");
  revalidatePath("/tous-les-cours");
}

export async function startCourseAction(formData: FormData) {
  try {
    const courseNumber = Number(formData.get("courseNumber"));
    const userId = await getAuthenticatedUserId();

    if (!userId || !Number.isFinite(courseNumber)) {
      return;
    }

    await launchCourseMission(userId, courseNumber);
    revalidateCourseSurfaces(courseNumber);
  } catch (error) {
    console.error("startCourseAction failed", error);
  }
}

export async function launchCourseMissionAction(formData: FormData) {
  const courseNumber = Number(formData.get("courseNumber"));
  if (!Number.isFinite(courseNumber)) {
    redirect("/quest");
  }

  const destination = `/cours/${courseNumber}`;
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    revalidateCourseSurfaces(courseNumber);
    redirect(destination);
  }

  try {
    await launchCourseMission(userId, courseNumber);
    revalidateCourseSurfaces(courseNumber);
  } catch (error) {
    console.error("launchCourseMissionAction failed", error);
  }

  redirect(destination);
}

export async function completeCourseAction(formData: FormData) {
  const courseNumber = Number(formData.get("courseNumber"));

  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !Number.isFinite(courseNumber)) {
      return;
    }

    const roadmap = await getUserCourseRoadmap(userId);
    const roadmapEntry = roadmap.entries.find((entry) => entry.courseId === courseNumber);

    if (!roadmapEntry) {
      return;
    }

    const missionState = await getUserCourseMissionState(userId, roadmapEntry);

    if (!missionState.readyToComplete) {
      revalidateCourseSurfaces(courseNumber);
      return;
    }

    await completeCourseAndGrantRewards(userId, courseNumber);
    revalidateCourseSurfaces(courseNumber);
  } catch (error) {
    console.error("completeCourseAction failed", error);
    if (Number.isFinite(courseNumber)) {
      revalidateCourseSurfaces(courseNumber);
    }
  }
}

export async function recordCourseCheckpointAction(courseNumber: number) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !Number.isFinite(courseNumber)) {
      return { success: false };
    }

    const missionState = await recordCourseReadingCheckpoint(userId, courseNumber);
    revalidateCourseSurfaces(courseNumber);

    return {
      success: true,
      missionState,
    };
  } catch (error) {
    console.error("recordCourseCheckpointAction failed", error);
    return { success: false };
  }
}

export async function submitCourseQuizAction(params: {
  courseNumber: number;
  answers: CourseQuizAnswer[];
}) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !Number.isFinite(params.courseNumber)) {
      return { success: false };
    }

    // La note est recalculée ici à partir des réponses : le navigateur ne fixe plus son score.
    const graded = gradeCourseQuiz(params.courseNumber, params.answers);
    if (!graded) {
      return { success: false };
    }

    const missionState = await submitCourseQuizResult(
      userId,
      params.courseNumber,
      graded.score,
      graded.total
    );

    // Quiz réussi : la mission se valide tout de suite. Le défi de jeu est un bonus.
    let courseCompleted: { xp: number; gold: number; newLevel: number | null } | null = null;
    if (missionState?.readyToComplete) {
      const result = await completeCourseAndGrantRewards(userId, params.courseNumber);
      if (result.rewards.xp > 0 || result.rewards.gold > 0) {
        courseCompleted = { ...result.rewards, newLevel: result.newLevel };
      }
    }
    // Après la validation : mission, chapitre, niveau ou quiz parfait peuvent débloquer un badge.
    const newBadges = await syncBadgesSafely(userId);

    revalidateCourseSurfaces(params.courseNumber);

    return {
      success: true,
      missionState,
      courseCompleted,
      newBadges,
    };
  } catch (error) {
    console.error("submitCourseQuizAction failed", error);
    return { success: false };
  }
}
