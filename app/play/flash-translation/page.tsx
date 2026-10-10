import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlashTranslationGame } from "./flash-translation-game";

export const metadata: Metadata = {
  title: "Flash Translation",
  description: "Dix mots français, quatre traductions anglaises à chaque fois : réponds vite, le score est ton temps total.",
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
      />
    </GameShell>
  );
}
