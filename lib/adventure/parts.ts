export const partTitles = ["Découvrir", "S’entraîner", "Mission finale"] as const;

// The first two encounters introduce the language. The last two ask the player to use it independently.
export function partForStage(stage: number, total: number) {
  if (stage < 2) return 0;
  return stage < total - 2 ? 1 : 2;
}
