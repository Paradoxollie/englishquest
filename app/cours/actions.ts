"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  completeCourseAndGrantRewards,
  getUserCourseRoadmap,
  updateCourseProgressStatus,
} from "@/lib/courses/progress";
import {
  getUserCourseMissionState,
  recordCourseReadingCheckpoint,
  submitCourseQuizResult,
} from "@/lib/courses/mission-state";

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

    await updateCourseProgressStatus(userId, courseNumber, "in_progress");
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
    await updateCourseProgressStatus(userId, courseNumber, "in_progress");
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
  score: number;
  total: number;
}) {
  try {
    const userId = await getAuthenticatedUserId();

    if (
      !userId ||
      !Number.isFinite(params.courseNumber) ||
      !Number.isFinite(params.score) ||
      !Number.isFinite(params.total)
    ) {
      return { success: false };
    }

    const missionState = await submitCourseQuizResult(
      userId,
      params.courseNumber,
      params.score,
      params.total
    );

    revalidateCourseSurfaces(params.courseNumber);

    return {
      success: true,
      missionState,
    };
  } catch (error) {
    console.error("submitCourseQuizAction failed", error);
    return { success: false };
  }
}
