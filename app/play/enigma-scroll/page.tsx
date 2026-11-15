import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EnigmaScrollGame } from "./enigma-scroll-game";

export const metadata: Metadata = {
  title: "Enigma Scroll",
  description: "Trouve le mot anglais caché en quelques essais : les lettres se colorent pour te guider, et chaque mot se termine par sa traduction.",
};

export const dynamic = "force-dynamic";

const SLUG = "enigma-scroll";

export default async function EnigmaScrollPage() {
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
            { key: "easy", label: "4 lettres", difficulty: "easy" },
            { key: "medium", label: "5 lettres", difficulty: "medium" },
            { key: "hard", label: "6 lettres", difficulty: "hard" },
          ]}
        />
      }
    >
      <EnigmaScrollGame
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        suggestedLevel={suggestedLevel}
      />
    </GameShell>
  );
}
