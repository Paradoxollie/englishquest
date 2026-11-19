import { gameMetadata } from "@/lib/site/metadata";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { SpeedVerbGame } from "./speed-verb-game";

const SLUG = "speed-verb-challenge";

export const metadata = gameMetadata(
  SLUG,
  "Verbes irréguliers anglais · Speed Verb Challenge",
  "Conjugue les verbes irréguliers anglais contre la montre : prétérit, participe passé, traduction.",
);

export const dynamic = "force-dynamic";

export default async function SpeedVerbChallengePage() {
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const user = await getServerUser();
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
