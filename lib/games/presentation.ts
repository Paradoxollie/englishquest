import { ART } from "@/lib/art";
import type { GameConfig } from "./config";

export type GamePresentation = {
  mark: string;
  emblem: "scroll" | "crosshair" | "bolt" | "tiles" | "arrows" | "memory";
  /** Compétence travaillée, en un mot ou deux. */
  skill: string;
  /** Ce qu'on fait dans le jeu, en une phrase courte. */
  hook: string;
  /** Durée typique d'une partie. */
  duration: string;
  primary: string;
  secondary: string;
  /** Visuel 3:2 du jeu, servi depuis public/art/ s'il existe. */
  artworkSrc: string;
  imageAlt: string;
};

const manualPresentations: Record<string, GamePresentation> = {
  "enigma-scroll": {
    mark: "ES",
    emblem: "scroll",
    skill: "Orthographe",
    hook: "Devine le mot caché en six essais, lettre par lettre.",
    duration: "3 min",
    primary: "#5bd39a",
    secondary: "#a8ecc9",
    artworkSrc: "/art/game-enigma-scroll.jpg",
    imageAlt: "Illustration d'un parchemin pour Enigma Scroll.",
  },
  "space-lex": {
    mark: "LB",
    emblem: "crosshair",
    skill: "Lexique",
    hook: "Tire sur les mots de la bonne famille, laisse passer les autres.",
    duration: "5 min",
    primary: "#f472b6",
    secondary: "#fbcfe8",
    artworkSrc: "/art/game-space-lex.jpg",
    imageAlt: "Illustration d'un vaisseau pour Lexicon Blaster.",
  },
  "speed-verb-challenge": {
    mark: "SV",
    emblem: "bolt",
    skill: "Conjugaison",
    hook: "Les verbes irréguliers sous chrono, en trois formes.",
    duration: "2 min",
    primary: "#f2b53a",
    secondary: "#fde5a8",
    artworkSrc: "/art/game-speed-verb-challenge.jpg",
    imageAlt: "Illustration d'un sprint pour Speed Verb Challenge.",
  },
  wordfall: {
    mark: "WF",
    emblem: "tiles",
    skill: "Vocabulaire",
    hook: "Tape le mot et sa traduction avant qu'il ne touche le sol.",
    duration: "4 min",
    primary: "#3ec6e8",
    secondary: "#a9e6f5",
    artworkSrc: "/art/game-wordfall.jpg",
    imageAlt: "Illustration de mots qui tombent pour Wordfall.",
  },
  "flash-translation": {
    mark: "FT",
    emblem: "arrows",
    skill: "Réflexes",
    hook: "La bonne traduction parmi quatre, le plus vite possible.",
    duration: "2 min",
    primary: "#ff8a5b",
    secondary: "#ffc7ad",
    artworkSrc: "/art/game-flash-translation.jpg",
    imageAlt: "Illustration d'un duel de traduction pour Flash Translation.",
  },
  "grammar-rush": {
    mark: "GR",
    emblem: "scroll",
    skill: "Grammaire",
    hook: "Les questions des cours, sous chrono.",
    duration: "1 min",
    primary: "#2dd4bf",
    secondary: "#99f6e4",
    artworkSrc: "/art/game-grammar-rush.jpg",
    imageAlt: "Illustration pour Grammar Rush.",
  },
  flashback: {
    mark: "FB",
    emblem: "memory",
    skill: "Mémoire",
    hook: "Ce mot, tu l'as déjà vu ou pas ? Décide vite.",
    duration: "3 min",
    primary: "#a78bfa",
    secondary: "#d6c9ff",
    artworkSrc: "/art/game-flashback.jpg",
    imageAlt: "Illustration de cartes mémoire pour Flashback.",
  },
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
    skill: "Anglais",
    hook: "Une partie courte pour s'entraîner.",
    duration: "3 min",
    primary: "#3ec6e8",
    secondary: "#a9e6f5",
    artworkSrc: ART.heroGames,
    imageAlt: "Illustration English Quest.",
  };
}
