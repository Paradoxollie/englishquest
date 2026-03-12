"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  completeCourseAndGrantRewards,
  updateCourseProgressStatus,
} from "@/lib/courses/progress";

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

  await completeCourseAndGrantRewards(userId, courseNumber);
  revalidateCourseSurfaces(courseNumber);
}
