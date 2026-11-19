import { gameMetadata } from "@/lib/site/metadata";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { chapters, getChapterForCourse } from "@/lib/courses/chapters";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getCachedUserCourseRoadmap } from "@/lib/courses/roadmap-cache";
import { lessons } from "@/lib/courses/lessons";
import { getGameBySlug } from "@/lib/games/config";
import { buildRushPool, buildRushQueue } from "@/lib/games/grammar-rush-server";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { GrammarRushGame } from "./grammar-rush-game";

const SLUG = "grammar-rush";

export const metadata = gameMetadata(
  SLUG,
  "Quiz de grammaire anglaise · Grammar Rush",
  "Révise la grammaire des cours en répondant aux questions avant la fin du chrono. Enchaîne les bonnes réponses pour améliorer ton score.",
);

export const dynamic = "force-dynamic";
const GUEST_MAX_CHAPTER = 2;

export default async function GrammarRushPage({
  searchParams,
}: {
  searchParams: Promise<{ cours?: string }>;
}) {
  const params = await searchParams;
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const user = await getServerUser();
  const userId = user?.id ?? null;
  const mission = await getMissionForGame(userId, SLUG);

  // Niveau des questions : jusqu'au chapitre en cours (au moins le 1er), tout pour un invité limité au 2e.
  let maxChapter = GUEST_MAX_CHAPTER;
  // L'étoile d'entraînement (?cours=N) ne s'active que lorsque l'élève lance un entraînement sur ce cours.
  let practiceCourseId: number | null = null;
  let queueCourseId: number | null = mission?.courseId ?? null;
  const requestedCourse = Number(params.cours);
  const wantsCourse = Number.isInteger(requestedCourse) && Boolean(lessons[requestedCourse]);
  if (userId) {
    const roadmap = await getCachedUserCourseRoadmap(userId);
    const current = roadmap.currentCourse ?? roadmap.recommendedCourse;
    maxChapter = current ? getChapterForCourse(current.courseId).id : chapters.length;
    // Entraînement ciblé (?cours=N) : seulement sur un cours déjà ouvert pour ce joueur.
    const requested = wantsCourse ? roadmap.entries.find((entry) => entry.courseId === requestedCourse) : null;
    if (requested && requested.status !== "locked") {
      practiceCourseId = requestedCourse;
      queueCourseId = requestedCourse;
      maxChapter = Math.max(maxChapter, getChapterForCourse(requestedCourse).id);
    }
  } else if (wantsCourse) {
    // Les cours sont publics : un invité peut s'entraîner sur celui qu'il vient de lire.
    practiceCourseId = requestedCourse;
    queueCourseId = requestedCourse;
    maxChapter = Math.max(maxChapter, getChapterForCourse(requestedCourse).id);
  }
  const queue = buildRushQueue({ maxChapter, focusCourseId: queueCourseId });
  const questionPool = buildRushPool({ maxChapter });
  const focusTitle = queueCourseId ? lessons[queueCourseId]?.title ?? null : null;
  const levelLabel = focusTitle
    ? `chapitres 1 à ${maxChapter}, une question sur trois sur « ${focusTitle} »`
    : `chapitres 1 à ${maxChapter}`;

  return (
    <GameShell
      game={game}
      mission={mission}
      isLoggedIn={Boolean(user)}
      aside={<GameBoard slug={SLUG} userId={userId} buckets={[{ key: "all", label: "Tous" }]} />}
    >
      <GrammarRushGame
        queue={queue}
        questionPool={questionPool}
        queueFocusCourseId={queueCourseId}
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        levelLabel={levelLabel}
        focusCourseId={practiceCourseId}
      />
    </GameShell>
  );
}
