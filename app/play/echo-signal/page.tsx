import { gameMetadata } from "@/lib/site/metadata";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { dialogueLineStarts, resolveAudioMap } from "@/lib/games/audio-manifest-server";
import { getGameBySlug } from "@/lib/games/config";
import { ECHO_SIGNAL_SCENARIOS } from "@/lib/games/echoSignal";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { EchoSignalGame } from "./echo-signal-game";

const SLUG = "echo-signal";

export const metadata = gameMetadata(
  SLUG,
  "Compréhension orale en anglais · Echo Signal",
  "Capte de courtes transmissions radio en anglais (annonces, dialogues, messages) et réponds juste aux questions de compréhension.",
);

export const dynamic = "force-dynamic";

export default async function EchoSignalPage() {
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
    "echo-signal",
    ECHO_SIGNAL_SCENARIOS.map((scenario) => scenario.id)
  );

  return (
    <GameShell
      game={game}
      mission={mission}
      isLoggedIn={Boolean(user)}
      aside={<GameBoard slug={SLUG} userId={userId} />}
    >
      <EchoSignalGame
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        suggestedLevel={suggestedLevel}
        audioMap={audioMap}
        lineStarts={dialogueLineStarts}
      />
    </GameShell>
  );
}
