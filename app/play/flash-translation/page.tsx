import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlashTranslationGame } from "./flash-translation-game";

export const metadata: Metadata = {
  title: "Flash Translation",
  description: "Dix mots français à ton niveau, quatre traductions anglaises à chaque fois : réponds vite, le score est ton temps total.",
};

export const dynamic = "force-dynamic";

const SLUG = "flash-translation";

export default async function FlashTranslationPage() {
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
