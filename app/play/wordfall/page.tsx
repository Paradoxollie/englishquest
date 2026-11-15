import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WordfallGame } from "./wordfall-game";

export const metadata: Metadata = {
  title: "Wordfall",
  description: "Des mots tombent, tape la bonne réponse avant la zone rouge. Vocabulaire anglais-français ou mot libre.",
};

export const dynamic = "force-dynamic";

const SLUG = "wordfall";

export default async function WordfallPage() {
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
          buckets={[
            { key: "exact", label: "Vocabulaire", difficulty: "easy" },
            { key: "free", label: "Mot libre", difficulty: "hard" },
          ]}
        />
      }
    >
      <WordfallGame
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        suggestedLevel={suggestedLevel}
      />
    </GameShell>
  );
}
