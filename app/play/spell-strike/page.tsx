import { gameMetadata } from "@/lib/site/metadata";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { resolveAudioMap } from "@/lib/games/audio-manifest-server";
import { getGameBySlug } from "@/lib/games/config";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { SPELL_STRIKE_WORDS } from "@/lib/games/spellStrike";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { SpellStrikeGame } from "./spell-strike-game";

const SLUG = "spell-strike";

export const metadata = gameMetadata(
  SLUG,
  "Dictée de mots anglais · Spell Strike",
  "Entraîne ton oreille et ton orthographe avec une dictée interactive. Écoute un mot en anglais, utilise l’indice si besoin et écris ta réponse.",
);

export const dynamic = "force-dynamic";

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
    SPELL_STRIKE_WORDS.flatMap((entry) => [entry.id, `${entry.id}-sentence`])
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
