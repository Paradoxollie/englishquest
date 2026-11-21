import { chapters, getChapterForCourse, getCourseShortName } from "@/lib/courses/chapters";
import { getCourseById } from "@/lib/courses/data";
import { getGameBySlug } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";
import type { LiveRound } from "@/lib/classes/live-shared";

export function describeRound(round: LiveRound) {
  if (round.kind === "game") {
    const game = getGameBySlug(round.slug)!;
    const { artworkSrc, hook, skill } = getGamePresentation(game);
    return { title: game.name, image: artworkSrc, detail: hook, category: skill };
  }
  const course = getCourseById(round.courseId)!;
  const chapter = getChapterForCourse(course.id);
  return {
    title: `Mission ${course.id} · ${getCourseShortName(course.title)}`,
    image: chapter.artSrc,
    detail: course.title,
    category: `Cours · ${chapter.level.split(" ")[0]}`,
  };
}

export const courseChoices = chapters.map((chapter) => ({
  label: `Chapitre ${chapter.id} · ${chapter.name}`,
  courses: chapter.courseIds.map((id) => ({ id, title: getCourseById(id)!.title })),
}));

export function durationLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (!minutes) return `${remainder} s`;
  return remainder ? `${minutes} min ${remainder} s` : `${minutes} min`;
}

const parisSessionDate = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});

export function sessionDate(timestamp: number) {
  return parisSessionDate.format(timestamp);
}
