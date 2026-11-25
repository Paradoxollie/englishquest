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
    hook: "Devine un mot anglais de quatre à six lettres grâce aux couleurs, puis découvre sa traduction.",
    duration: "3 min",
    primary: "#5bd39a",
    secondary: "#a8ecc9",
    artworkSrc: "/art/bd/heros-jeu-enigma-scroll.jpg",
    imageAlt: "Maya et Sam, détectives, examinent une grille de lettres à la loupe.",
  },
  "space-lex": {
    mark: "LB",
    emblem: "crosshair",
    skill: "Vocabulaire",
    hook: "Révise le vocabulaire anglais par thème dans un jeu de tir gratuit. Quand la mission demande un aliment, vise « apple » !",
    duration: "5 min",
    primary: "#f472b6",
    secondary: "#fbcfe8",
    artworkSrc: "/art/bd/heros-jeu-space-lex.jpg",
    imageAlt: "Maya et Sam pilotent une petite fusée et tirent sur des bulles de mots.",
  },
  "speed-verb-challenge": {
    mark: "SV",
    emblem: "bolt",
    skill: "Conjugaison",
    hook: "Quel est le prétérit de go ? Retrouve les formes des verbes irréguliers anglais avant la fin du chrono.",
    duration: "2 min",
    primary: "#f2b53a",
    secondary: "#fde5a8",
    artworkSrc: "/art/bd/heros-jeu-speed-verb-challenge.jpg",
    imageAlt: "Maya et Sam font la course devant un grand chronomètre.",
  },
  wordfall: {
    mark: "WF",
    emblem: "tiles",
    skill: "Vocabulaire",
    hook: "Traduis chaque mot français en anglais avant que son bloc touche la ligne rouge, ou essaie le mode libre avec une initiale.",
    duration: "4 min",
    primary: "#3ec6e8",
    secondary: "#a9e6f5",
    artworkSrc: "/art/bd/heros-jeu-wordfall.jpg",
    imageAlt: "Des blocs de mots tombent du ciel sur Maya et Sam, ordinateurs en main.",
  },
  "flash-translation": {
    mark: "FT",
    emblem: "arrows",
    skill: "Traduction",
    hook: "Pour chaque mot français, choisis la bonne traduction anglaise parmi quatre propositions.",
    duration: "2 min",
    primary: "#ff8a5b",
    secondary: "#ffc7ad",
    artworkSrc: "/art/bd/heros-jeu-flash-translation.jpg",
    imageAlt: "Sam frappe le buzzer d'un jeu télévisé, Maya l'encourage.",
  },
  "grammar-rush": {
    mark: "GR",
    emblem: "scroll",
    skill: "Grammaire",
    hook: "Tu as une minute pour compléter des phrases en anglais et choisir la bonne forme grammaticale.",
    duration: "1 min",
    primary: "#2dd4bf",
    secondary: "#99f6e4",
    artworkSrc: "/art/bd/heros-jeu-grammar-rush.jpg",
    imageAlt: "Maya et Sam se disputent la réponse sur le plateau d'un jeu télévisé.",
  },
  flashback: {
    mark: "FB",
    emblem: "memory",
    skill: "Mémoire",
    hook: "Repère les mots anglais qui reviennent et retrouve leur traduction pour exercer ta mémoire.",
    duration: "3 min",
    primary: "#a78bfa",
    secondary: "#d6c9ff",
    artworkSrc: "/art/bd/heros-jeu-flashback.jpg",
    imageAlt: "Maya reconnaît une image sur un mur de cartes, Sam cherche dans sa mémoire.",
  },
  "spell-strike": {
    mark: "SS",
    emblem: "bolt",
    skill: "Orthographe",
    hook: "Écoute un mot en anglais et tape-le comme dans une dictée. Un indice de contexte peut t’aider.",
    duration: "2 min",
    primary: "#facc15",
    secondary: "#fde68a",
    artworkSrc: "/art/bd/heros-jeu-spell-strike-v3.jpg",
    imageAlt: "Maya dicte un mot au micro pendant que Sam l'écrit au crayon sur une feuille.",
  },
  "echo-signal": {
    mark: "EC",
    emblem: "arrows",
    skill: "Écoute",
    hook: "Écoute une annonce ou un dialogue en anglais, puis retrouve les informations demandées.",
    duration: "3 min",
    primary: "#38bdf8",
    secondary: "#bae6fd",
    artworkSrc: "/art/bd/heros-jeu-echo-signal-v3.jpg",
    imageAlt: "Sur un toit de Londres, Maya règle une radio ancienne pendant que Sam écoute au casque.",
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
    artworkSrc: ART.heroHome,
    imageAlt: "Illustration English Quest.",
  };
}
