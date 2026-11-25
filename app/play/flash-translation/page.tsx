import { gameMetadata } from "@/lib/site/metadata";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { FlashTranslationGame } from "./flash-translation-game";

const SLUG = "flash-translation";

export const metadata = gameMetadata(
  SLUG,
  "Jeu de traduction du français vers l’anglais · Flash Translation",
  "Dix mots français à ton niveau, quatre traductions anglaises à chaque fois : réponds vite, le score est ton temps total.",
);

export const dynamic = "force-dynamic";

export default async function FlashTranslationPage() {
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const user = await getServerUser();
  const userId = user?.id ?? null;
  const [mission, suggestedLevel] = await Promise.all([getMissionForGame(userId, SLUG), getPlayerGameLevel(userId)]);

  return (
    <GameShell
      game={game}
      mission={mission}
      isLoggedIn={Boolean(user)}
      aside={
        <GameBoard
          slug={SLUG}
          userId={userId}
          scoreOrder="asc"
          format="seconds"
          title="Meilleurs temps"
          buckets={[{ key: "all", label: "Tous" }]}
        />
      }
    >
      <FlashTranslationGame
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        suggestedLevel={suggestedLevel}
      />
    </GameShell>
  );
}
