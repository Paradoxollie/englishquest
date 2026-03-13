"use server";

import { revalidatePath } from "next/cache";
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
  const courseNumber = Number(formData.get("courseNumber"));
  const userId = await getAuthenticatedUserId();

  if (!userId || !Number.isFinite(courseNumber)) {
    return;
  }

  await updateCourseProgressStatus(userId, courseNumber, "in_progress");
  revalidateCourseSurfaces(courseNumber);
}

export async function completeCourseAction(formData: FormData) {
  const courseNumber = Number(formData.get("courseNumber"));
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
}

export async function recordCourseCheckpointAction(courseNumber: number) {
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
}

export async function submitCourseQuizAction(params: {
  courseNumber: number;
  score: number;
  total: number;
}) {
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
}
