import { gameMetadata } from "@/lib/site/metadata";
import Link from "next/link";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { SpeedVerbGame } from "./speed-verb-game";

const SLUG = "speed-verb-challenge";

export const metadata = gameMetadata(
  SLUG,
  "Jeu sur les verbes irréguliers anglais · Speed Verb Challenge",
  "Retrouve le prétérit et le participe passé des verbes irréguliers anglais dans un jeu de conjugaison contre la montre. Commence en mode facile, sans compte.",
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
      <p className="mt-4"><Link href="/cours/11#section-quelques-verbes-irreguliers" className="eq-text-link">Revoir cinq verbes irréguliers et leurs exemples au prétérit</Link></p>
    </GameShell>
  );
}
