import { revalidatePath } from "next/cache";

export function revalidateCourseRoadmap() {
  revalidatePath("/tous-les-cours");
  revalidatePath("/tous-les-cours/parcours");
}
