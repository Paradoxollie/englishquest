import "server-only";
import { chapters, getChapterForCourse } from "@/lib/courses/chapters";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { levelFromChapter, type GameLevel } from "@/lib/games/levels";

/**
 * Niveau de vocabulaire d'un joueur connecté : celui du chapitre en cours
 * (même règle que Grammar Rush). Null pour un invité ou si la progression
 * ne peut pas être lue : le jeu propose alors le sélecteur de niveau.
 */
export async function getPlayerGameLevel(userId: string | null): Promise<GameLevel | null> {
  if (!userId) return null;
  try {
    const roadmap = await getUserCourseRoadmap(userId);
    const current = roadmap.currentCourse ?? roadmap.recommendedCourse;
    const chapterId = current ? getChapterForCourse(current.courseId).id : chapters.length;
    return levelFromChapter(chapterId);
  } catch (error) {
    console.error("getPlayerGameLevel failed", error);
    return null;
  }
}
