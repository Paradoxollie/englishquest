import type { GameConfig } from "./config";

const manualPresentations = {
  "enigma-scroll": {
    mark: "ES",
    emblem: "scroll",
    mode: "Mystere lexical",
    hook: "Trouve le mot cache avant la fin de la piste.",
    action: "Decouvrir / deduire",
    primary: "#22c55e",
    secondary: "#86efac",
  },
  "space-lex": {
    mark: "LB",
    emblem: "crosshair",
    mode: "Arcade cosmique",
    hook: "Verrouille les bons mots avant la collision.",
    action: "Viser / eliminer",
    primary: "#8b5cf6",
    secondary: "#c4b5fd",
  },
  "speed-verb-challenge": {
    mark: "SV",
    emblem: "bolt",
    mode: "Sprint grammaire",
    hook: "Conjugue vite et garde ton combo en vie.",
    action: "Conjuguer / enchainer",
    primary: "#f59e0b",
    secondary: "#fde68a",
  },
  wordfall: {
    mark: "WF",
    emblem: "tiles",
    mode: "Pression clavier",
    hook: "Tape sous tension et nettoie l'ecran avant l'impact.",
    action: "Taper / survivre",
    primary: "#06b6d4",
    secondary: "#67e8f9",
  },
  "flash-translation": {
    mark: "FT",
    emblem: "arrows",
    mode: "Duel de reflexe",
    hook: "Choisis la bonne traduction avant le buzzer.",
    action: "Traduire / reagir",
    primary: "#f97316",
    secondary: "#fdba74",
  },
  flashback: {
    mark: "FB",
    emblem: "memory",
    mode: "Memoire tactique",
    hook: "Repere les mots deja vus et securise la serie.",
    action: "Memoriser / confirmer",
    primary: "#7c3aed",
    secondary: "#c4b5fd",
  },
} satisfies Record<
  string,
  {
    mark: string;
    emblem: "scroll" | "crosshair" | "bolt" | "tiles" | "arrows" | "memory";
    mode: string;
    hook: string;
    action: string;
    primary: string;
    secondary: string;
  }
>;

export type GamePresentation = {
  mark: string;
  emblem: "scroll" | "crosshair" | "bolt" | "tiles" | "arrows" | "memory";
  mode: string;
  hook: string;
  action: string;
  primary: string;
  secondary: string;
};

export function getGameMark(game: Pick<GameConfig, "slug" | "name">): string {
  const manual = manualPresentations[game.slug]?.mark;
  if (manual) {
    return manual;
  }

  const words = game.name
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function getGamePresentation(game: Pick<GameConfig, "slug" | "name">): GamePresentation {
  const manual = manualPresentations[game.slug];
  if (manual) {
    return manual;
  }

  return {
    mark: getGameMark(game),
    emblem: "scroll",
    mode: "Mode express",
    hook: "Entre dans une session courte et utile pour consolider ton anglais.",
    action: "Jouer / progresser",
    primary: "#38bdf8",
    secondary: "#bae6fd",
  };
}
