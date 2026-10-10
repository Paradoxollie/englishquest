import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { chapters, getChapterForCourse } from "@/lib/courses/chapters";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { getGameBySlug } from "@/lib/games/config";
import { buildRushQueue } from "@/lib/games/grammar-rush-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GrammarRushGame } from "./grammar-rush-game";

export const metadata: Metadata = {
  title: "Grammar Rush",
  description: "Soixante secondes, les questions des cours, quatre propositions : réponds vite et garde la série.",
};

export const dynamic = "force-dynamic";

const SLUG = "grammar-rush";
const GUEST_MAX_CHAPTER = 2;

export default async function GrammarRushPage() {
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  const mission = await getMissionForGame(userId, SLUG);

  // Niveau des questions : jusqu'au chapitre en cours (au moins le 1er), tout pour un invité limité au 2e.
  let maxChapter = GUEST_MAX_CHAPTER;
  if (userId) {
    const roadmap = await getUserCourseRoadmap(userId);
    const current = roadmap.currentCourse ?? roadmap.recommendedCourse;
    maxChapter = current ? getChapterForCourse(current.courseId).id : chapters.length;
  }
  const queue = buildRushQueue({ maxChapter, focusCourseId: mission?.courseId ?? null });
  const levelLabel = `chapitres 1 à ${maxChapter}`;

  return (
    <GameShell
      game={game}
      mission={mission}
      isLoggedIn={Boolean(user)}
      aside={<GameBoard slug={SLUG} userId={userId} buckets={[{ key: "all", label: "Tous" }]} />}
    >
      <GrammarRushGame
        queue={queue}
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        levelLabel={levelLabel}
      />
    </GameShell>
  );
}
