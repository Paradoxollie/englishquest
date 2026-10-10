import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SpaceLexGame } from "./space-lex-game";

export const metadata: Metadata = {
  title: "Lexicon Blaster",
  description: "Un shooter spatial où l'on tire sur les bons mots : familles de mots, connecteurs, synonymes, et des boss.",
};

export const dynamic = "force-dynamic";

const SLUG = "space-lex";

export default async function SpaceLexPage() {
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
      aside={<GameBoard slug={SLUG} userId={userId} buckets={[{ key: "all", label: "Tous" }]} />}
    >
      <SpaceLexGame
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
      />
    </GameShell>
  );
}
