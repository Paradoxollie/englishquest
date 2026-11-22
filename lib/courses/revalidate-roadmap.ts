import { revalidatePath } from "next/cache";

export function revalidateCourseRoadmap() {
  revalidatePath("/quest");
  revalidatePath("/tous-les-cours/parcours");
}
