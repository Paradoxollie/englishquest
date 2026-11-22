export const partTitles = ["Découvrir", "S’entraîner", "Mission finale"] as const;

// An episode opens with two guided discoveries and closes with a written task and a quiz.
export function partForStage(stage: number, total: number) {
  if (stage < 2) return 0;
  return stage < total - 2 ? 1 : 2;
}
