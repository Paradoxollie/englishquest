import type { ExerciseAnswer } from "@/lib/courses/exercise-check";
export type { LiveProgress as LiveActivityProgress } from "@/lib/classes/live-shared";

export const LIVE_ACTIVITY_CHANNEL = "english-quest-class-activity";
type ResponseListener = (correct: boolean, answer?: ExerciseAnswer) => void;
let currentListener: ResponseListener | null = null;

/** Only the frame for an active class round installs a listener. Solo play has none. */
export function observeClassAnswers(listener: ResponseListener) {
  currentListener = listener;
  return () => {
    if (currentListener === listener) currentListener = null;
  };
}

export function recordClassAnswer(correct: boolean, answer?: ExerciseAnswer) {
  currentListener?.(correct, answer);
}

/** Only words that a bullet really touched count as a decision in Lexicon Blaster. */
export function recordClassHits(
  before: ReadonlyArray<{ id: string; isTarget: boolean }>,
  after: ReadonlyArray<{ id: string }>
) {
  if (!currentListener || before.length === after.length) return;
  const survivors = new Set(after.map((enemy) => enemy.id));
  for (const enemy of before) {
    if (!survivors.has(enemy.id)) currentListener(enemy.isTarget);
  }
}
