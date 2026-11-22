import type { EchoScenario } from "@/lib/games/echoSignal";
import type { RushQuestion } from "@/lib/games/grammar-rush";

export type RadioMessage = { speaker: "Maya" | "Sam"; line: string; file: string };
export type GameAnswer = { id: string; value: string };
export type QuizForm = { ticket: string; questions: { id: string; prompt: string; options: string[] }[] };
export type QuizSubmission = { ticket: string; answers: GameAnswer[] };
export type ComicPhase = "story" | "lesson" | "question" | "help";
export type Draft = {
  index: number; opened: boolean; sheet: boolean; choice: string; tiles: number[];
  phase?: ComicPhase; beat?: number; retryHint?: string;
  gameAnswers: GameAnswer[]; quiz: { ticket?: string; answers: GameAnswer[]; page?: number; retryIds?: string[] }; shuffle: number; replaying: boolean;
};
export type AccountDraft = { version: number; data: Draft | null };
export type PassageGame = { type: "rush"; questions: RushQuestion[] } | { type: "echo"; scenario: EchoScenario; radio: RadioMessage };
export type Activity = {
  mode: "choice" | "order" | "write" | "game" | "quiz";
  title: string; prompt: string;
  englishCue?: string;
  document?: { label: string; text: string };
  radio?: RadioMessage;
  lesson?: { rule: string; example: string; parts?: [word: string, meaning: string][]; say?: string };
  options?: string[];
  game?: PassageGame;
};
export type AuthoredActivity = Activity & { accept: string[]; hint: string; explain: string };

export function learnerActivity(step: AuthoredActivity): Activity {
  const { mode, title, prompt, englishCue, document, lesson, radio, options, game } = step;
  return { mode, title, prompt, englishCue, document, lesson, radio, options, game };
}

export function recordingPath(message: RadioMessage) {
  return `/audio/passage/${message.file}.mp3`;
}
