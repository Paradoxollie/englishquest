import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { resolveAudioMap } from "@/lib/games/audio-manifest-server";
import { getGameBySlug } from "@/lib/games/config";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { SPELL_STRIKE_WORDS } from "@/lib/games/spellStrike";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { SpellStrikeGame } from "./spell-strike-game";

export const metadata: Metadata = {
  title: "Spell Strike",
  description:
    "Écoute chaque mot anglais, appuie sur l'indice de contexte et écris son orthographe exacte sans faute.",
};

export const dynamic = "force-dynamic";

const SLUG = "spell-strike";

export default async function SpellStrikePage() {
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const user = await getServerUser();
  const userId = user?.id ?? null;
  const [mission, suggestedLevel] = await Promise.all([
    getMissionForGame(userId, SLUG),
    getPlayerGameLevel(userId),
  ]);
  const audioMap = resolveAudioMap(
    "spell-strike",
    SPELL_STRIKE_WORDS.map((entry) => entry.id)
  );

  return (
    <GameShell
      game={game}
      mission={mission}
      isLoggedIn={Boolean(user)}
      aside={<GameBoard slug={SLUG} userId={userId} />}
    >
      <SpellStrikeGame
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        suggestedLevel={suggestedLevel}
        audioMap={audioMap}
      />
    </GameShell>
  );
}
