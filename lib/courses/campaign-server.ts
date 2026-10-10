import {
  buildCourseMissionPlan,
  resolveMissionPrimaryGameAssignments,
  type CourseMissionPlan,
  type CourseMissionPlanEntryInput,
} from "@/lib/courses/campaign";

/**
 * Plans de mission pour une liste de cours.
 *
 * Les objectifs sont fixes (voir MISSION_TARGETS dans campaign.ts) : le même
 * cours demande le même score à tout le monde, ce qui rend la progression
 * lisible et stable. Le jeu principal de chaque cours est choisi en évitant de
 * répéter le même jeu deux cours de suite.
 */
export async function getResolvedCourseMissionPlans(
  entries: CourseMissionPlanEntryInput[]
): Promise<Record<number, CourseMissionPlan>> {
  if (entries.length === 0) {
    return {};
  }

  const assignments = resolveMissionPrimaryGameAssignments(entries);

  return Object.fromEntries(
    entries.map((entry) => [
      entry.courseId,
      buildCourseMissionPlan(entry, {
        primaryGameSlug: assignments[entry.courseId] ?? null,
      }),
    ])
  );
}

export async function getResolvedCourseMissionPlan(
  entry: CourseMissionPlanEntryInput
): Promise<CourseMissionPlan> {
  return buildCourseMissionPlan(entry);
}
