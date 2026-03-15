import { revalidateTag } from "next/cache";
import { COURSE_MISSION_BENCHMARKS_TAG } from "@/lib/courses/cache";

export function revalidateCourseMissionBenchmarks() {
  revalidateTag(COURSE_MISSION_BENCHMARKS_TAG, "max");
}
