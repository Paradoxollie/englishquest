import type { EchoScenario } from "@/lib/games/echoSignal";
import type { RushQuestion } from "@/lib/games/grammar-rush";

export type RadioMessage = { speaker: "Maya" | "Sam"; line: string; file: string; collection?: "spell-strike" };
export type GameAnswer = { id: string; value: string };
export type QuizForm = { ticket: string; questions: { id: string; prompt: string; options: string[] }[] };
export type QuizSubmission = { ticket: string; answers: GameAnswer[] };
export type ComicPhase = "story" | "lesson" | "question" | "help";
export type BoardPicture = "inventory" | "shelter" | "film" | "letter" | "lanterns" | "cloakroom" | "automata" | "mirrors" | "roof" | "frame" | "fruit" | "supplies" | "meal" | "cargo";
export type Clue = { label: string; text: string };
export type Draft = {
  index: number; opened: boolean; sheet: boolean; choice: string; tiles: number[];
  phase?: ComicPhase; beat?: number; retryHint?: string; clue?: number;
  gameAnswers: GameAnswer[]; quiz: { ticket?: string; answers: GameAnswer[]; page?: number; retryIds?: string[] }; shuffle: number; replaying: boolean;
};
export type AccountDraft = { version: number; data: Draft | null };
export type PassageGame = { type: "rush"; questions: RushQuestion[] } | { type: "echo"; scenario: EchoScenario; radio: RadioMessage };
export type Activity = {
  mode: "choice" | "order" | "write" | "spot" | "delivery" | "evidence" | "route" | "game" | "quiz";
  title: string; prompt: string;
  englishCue?: string;
  document?: { label: string; text: string; lang?: "en" | "fr" };
  radio?: RadioMessage;
  lesson?: { rule: string; example: string; parts?: [word: string, meaning: string][]; say?: string };
  options?: string[];
  spots?: { picture: BoardPicture; points: [x: number, y: number][]; labels?: string[] };
  delivery?: { picture: BoardPicture; destinations: string[] };
  clues?: Clue[];
  reply?: { speaker: RadioMessage["speaker"]; line: string };
  legacyQuiz?: boolean;
  game?: PassageGame;
};
export type AuthoredActivity = Activity & { accept: string[]; hint: string; explain: string };

export function learnerActivity(step: AuthoredActivity): Activity {
  const { mode, title, prompt, englishCue, document, lesson, radio, options, spots, delivery, clues, reply, legacyQuiz, game } = step;
  return { mode, title, prompt, englishCue, document, lesson, radio, options, spots, delivery, clues, reply, legacyQuiz, game };
}

export function boardAnswer(step: Activity, choice: string, tiles: number[]) {
  if (step.mode === "evidence") {
    const pinned = new Set(tiles);
    if (tiles.length !== 2 || pinned.size !== 2 || !tiles.every(i => step.clues?.[i]) || !step.options?.includes(choice)) return "";
    return `${[...pinned].sort((a, b) => a - b).join("+")} | ${choice}`;
  }
  if (step.mode === "delivery") {
    const item = step.options?.[tiles[0]];
    return tiles.length === 1 && item && step.delivery?.destinations.includes(choice) ? `${item} | ${choice}` : "";
  }
  return choice;
}

export function recordingPath(message: RadioMessage) {
  return `/audio/${message.collection ?? "passage"}/${message.file}.mp3`;
}
