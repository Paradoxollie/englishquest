import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { lessons } from "@/lib/courses/lessons";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { getUserCourseRoadmap } from "@/lib/courses/progress";

/**
 * La mission en cours qui porte sur un jeu donné, pour l'afficher dans le jeu.
 * Null si le joueur n'est pas connecté, n'a pas de mission en cours sur ce jeu,
 * ou n'a pas encore validé le quiz (le défi de jeu n'est pas encore ouvert).
 */
export type GameMissionInfo = {
  courseId: number;
  courseTitle: string;
  scoreTarget: number;
  scoreDirection: "higher" | "lower";
  challengeCompact: string;
  challengeLabel: string;
  quizPassed: boolean;
  alreadyReached: boolean;
  rewardXp: number;
  rewardGold: number;
};

export async function getMissionForGame(userId: string | null, gameSlug: string): Promise<GameMissionInfo | null> {
  if (!userId) {
    return null;
  }

  try {
    const roadmap = await getUserCourseRoadmap(userId);
    const active = roadmap.entries.find((entry) => entry.status === "in_progress") ?? roadmap.currentCourse;
    if (!active || active.status === "locked" || active.status === "completed") {
      return null;
    }

    const plans = await getResolvedCourseMissionPlans([active]);
    const plan = plans[active.courseId];
    if (!plan || plan.primaryGameSlug !== gameSlug) {
      return null;
    }

    const state = await getUserCourseMissionState(userId, active);

    return {
      courseId: active.courseId,
      courseTitle: lessons[active.courseId]?.title ?? active.title,
      scoreTarget: plan.scoreTarget,
      scoreDirection: plan.scoreDirection,
      challengeCompact: plan.gameChallengeCompact,
      challengeLabel: plan.gameChallengeLabel,
      quizPassed: state.quizPassed,
      alreadyReached: state.gameChallengeReached,
      rewardXp: active.rewardXp,
      rewardGold: active.rewardGold,
    };
  } catch (error) {
    console.error("getMissionForGame failed", error);
    return null;
  }
}
