/**
 * Level & difficulty primitives shared across games and progression rewards.
 */

export type Difficulty = "easy" | "medium" | "hard";

/**
 * Calculate the player's level based on their total XP (200 XP per level).
 */
export function calculateLevelFromXP(xp: number): number {
  if (xp < 0) xp = 0;
  return 1 + Math.floor(xp / 200);
}
