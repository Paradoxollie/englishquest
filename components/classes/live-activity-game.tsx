"use client";

import dynamic from "next/dynamic";
import type { RushQuestion } from "@/lib/games/grammar-rush";
import type { GameSessionSlug } from "@/lib/games/game-session-rules";

const load = {
  "enigma-scroll": () => import("@/app/play/enigma-scroll/enigma-scroll-game").then(m => m.EnigmaScrollGame),
  "space-lex": () => import("@/app/play/space-lex/space-lex-game").then(m => m.SpaceLexGame),
  "speed-verb-challenge": () => import("@/app/play/speed-verb-challenge/speed-verb-game").then(m => m.SpeedVerbGame),
  wordfall: () => import("@/app/play/wordfall/wordfall-game").then(m => m.WordfallGame),
  "flash-translation": () => import("@/app/play/flash-translation/flash-translation-game").then(m => m.FlashTranslationGame),
  "grammar-rush": () => import("@/app/play/grammar-rush/grammar-rush-game").then(m => m.GrammarRushGame),
  flashback: () => import("@/app/play/flashback/flashback-game").then(m => m.FlashbackGame),
  "spell-strike": () => import("@/app/play/spell-strike/spell-strike-game").then(m => m.SpellStrikeGame),
  "echo-signal": () => import("@/app/play/echo-signal/echo-signal-game").then(m => m.EchoSignalGame),
};
export async function prepareLiveGame(slug: GameSessionSlug): Promise<void> {
  await load[slug]();
}
const Enigma = dynamic(load["enigma-scroll"]);
const Blaster = dynamic(load["space-lex"]);
const Verbs = dynamic(load["speed-verb-challenge"]);
const Wordfall = dynamic(load.wordfall);
const Translation = dynamic(load["flash-translation"]);
const Grammar = dynamic(load["grammar-rush"]);
const Flashback = dynamic(load.flashback);
const Spelling = dynamic(load["spell-strike"]);
const Echo = dynamic(load["echo-signal"]);

// Class progress is recorded by the surrounding session. Ordinary game scores and rewards are separate.
const options = { isLoggedIn: false, missionTarget: null, suggestedLevel: 1 } as const;

export function LiveGameActivity({ slug, questions, audioMap, lineStarts }: {
  slug: GameSessionSlug; questions?: RushQuestion[]; audioMap?: Record<string, string>; lineStarts?: Record<string, number[]>;
}) {
  switch (slug) {
    case "enigma-scroll": return <Enigma {...options} />;
    case "space-lex": return <Blaster {...options} />;
    case "speed-verb-challenge": return <Verbs {...options} />;
    case "wordfall": return <Wordfall {...options} />;
    case "flash-translation": return <Translation {...options} />;
    case "grammar-rush": return <Grammar {...options} queue={questions ?? []} questionPool={questions} levelLabel="chapitres 1 et 2" />;
    case "flashback": return <Flashback {...options} />;
    case "spell-strike": return <Spelling {...options} audioMap={audioMap} />;
    case "echo-signal": return <Echo {...options} audioMap={audioMap} lineStarts={lineStarts} />;
  }
}
