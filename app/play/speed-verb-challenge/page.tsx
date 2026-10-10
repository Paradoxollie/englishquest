import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SpeedVerbGame } from "./speed-verb-game";

export const metadata: Metadata = {
  title: "Speed Verb Challenge",
  description: "Conjugue les verbes irréguliers anglais contre la montre : prétérit, participe passé, traduction.",
};

export const dynamic = "force-dynamic";

const SLUG = "speed-verb-challenge";

export default async function SpeedVerbChallengePage() {
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

  return (
    <GameShell
      game={game}
      mission={mission}
      isLoggedIn={Boolean(user)}
      aside={
        <GameBoard
          slug={SLUG}
          userId={userId}
          buckets={[
            { key: "easy", label: "Facile", difficulty: "easy" },
            { key: "medium", label: "Moyen", difficulty: "medium" },
            { key: "hard", label: "Difficile", difficulty: "hard" },
          ]}
        />
      }
    >
      <SpeedVerbGame isLoggedIn={Boolean(user)} missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null} />
    </GameShell>
  );
}
