import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { completeCourseAndGrantRewards, getUserCourseRoadmap } from "@/lib/courses/progress";
import { lessons } from "@/lib/courses/lessons";

export type AutoCompletedCourse = {
  courseNumber: number;
  courseTitle: string;
  rewards: { xp: number; gold: number };
  newLevel: number | null;
};

/**
 * Appelé après l'enregistrement d'un score de jeu.
 *
 * Si le joueur a un cours en cours dont le défi porte sur ce jeu, que le quiz
 * est validé et que le score atteint l'objectif, le cours est validé et les
 * récompenses du cours sont versées. On renvoie le détail pour l'écran de fin.
 */
export async function autoCompleteCourseMissionForGame(
  userId: string,
  gameSlug: string,
  score: number
): Promise<AutoCompletedCourse | null> {
  try {
    const roadmap = await getUserCourseRoadmap(userId);
    const candidates = roadmap.entries.filter((entry) => entry.status === "in_progress");

    for (const entry of candidates) {
      const plan = getCourseMissionPlan(entry);
      if (plan.primaryGameSlug !== gameSlug) {
        continue;
      }

      const reached =
        plan.scoreDirection === "lower" ? score <= plan.scoreTarget : score >= plan.scoreTarget;
      if (!reached) {
        continue;
      }

      const state = await getUserCourseMissionState(userId, entry);
      if (!state.quizPassed) {
        continue;
      }

      const result = await completeCourseAndGrantRewards(userId, entry.courseId);
      if (result.rewards.xp === 0 && result.rewards.gold === 0) {
        continue;
      }

      return {
        courseNumber: entry.courseId,
        courseTitle: lessons[entry.courseId]?.title ?? result.courseTitle,
        rewards: result.rewards,
        newLevel: result.newLevel,
      };
    }
  } catch (error) {
    console.error("autoCompleteCourseMissionForGame failed", error);
  }

  return null;
}
