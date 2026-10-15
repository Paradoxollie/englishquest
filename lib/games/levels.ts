/**
 * Niveaux de vocabulaire des jeux : un niveau par chapitre de l'aventure.
 *
 * 1 = A1 (chapitre 1), 2 = A2, 3 = B1, 4 = B2, 5 = C1 (chapitre 5).
 * Module pur, partagé par les moteurs, les pages serveur et les jeux.
 */

export type GameLevel = 1 | 2 | 3 | 4 | 5;

export const GAME_LEVEL_VALUES: readonly GameLevel[] = [1, 2, 3, 4, 5];

export const GAME_LEVELS: readonly { value: GameLevel; label: string; cefr: string }[] = [
  { value: 1, label: "Débutant", cefr: "A1" },
  { value: 2, label: "Élémentaire", cefr: "A2" },
  { value: 3, label: "Intermédiaire", cefr: "B1" },
  { value: 4, label: "Avancé", cefr: "B2" },
  { value: 5, label: "Expert", cefr: "C1" },
];

/** Niveau proposé aux invités. */
export const DEFAULT_GAME_LEVEL: GameLevel = 1;

export function isGameLevel(value: unknown): value is GameLevel {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function normalizeGameLevel(value: unknown, fallback: GameLevel = DEFAULT_GAME_LEVEL): GameLevel {
  const number = typeof value === "string" ? Number(value) : value;
  return isGameLevel(number) ? number : fallback;
}

/** Chapitre de l'aventure (1 à 5) vers niveau de jeu, borné. */
export function levelFromChapter(chapterId: number): GameLevel {
  if (!Number.isFinite(chapterId)) return DEFAULT_GAME_LEVEL;
  return normalizeGameLevel(Math.min(5, Math.max(1, Math.round(chapterId))));
}

export function getGameLevelLabel(level: GameLevel): string {
  const entry = GAME_LEVELS.find((item) => item.value === level);
  return entry ? `${entry.label} (${entry.cefr})` : "";
}

/** Part des mots tirés au niveau du joueur ; le reste vient du niveau inférieur. */
export const MAIN_LEVEL_SHARE = 0.7;

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Les éléments du niveau du joueur et du niveau juste en dessous. */
export function levelPool<T extends { level: GameLevel }>(items: readonly T[], level: GameLevel): T[] {
  return items.filter((item) => item.level === level || item.level === level - 1);
}

/**
 * Tire `count` éléments distincts : environ 70 % au niveau du joueur, 30 % au
 * niveau inférieur (tout au niveau 1 pour un débutant). Si un niveau manque
 * d'éléments, l'autre complète, puis les niveaux voisins.
 */
export function pickByLevel<T extends { level: GameLevel }>(
  items: readonly T[],
  level: GameLevel,
  count: number,
  rng: () => number = Math.random
): T[] {
  const total = Math.max(0, Math.floor(count));
  if (total === 0) return [];
  const main = shuffle(items.filter((item) => item.level === level), rng);
  const below = shuffle(items.filter((item) => item.level === level - 1), rng);
  const wantedBelow = level === 1 ? 0 : Math.round(total * (1 - MAIN_LEVEL_SHARE));
  const belowCount = Math.min(wantedBelow, below.length);
  const mainCount = Math.min(total - belowCount, main.length);
  const picked: T[] = [...below.slice(0, belowCount), ...main.slice(0, mainCount)];
  if (picked.length < total) {
    picked.push(...below.slice(belowCount, belowCount + total - picked.length));
  }
  if (picked.length < total) {
    // Niveaux voisins, du plus proche au plus éloigné.
    const used = new Set(picked);
    const others = shuffle(items.filter((item) => !used.has(item)), rng)
      .sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));
    picked.push(...others.slice(0, total - picked.length));
  }
  return shuffle(picked.slice(0, total), rng);
}

/** Tire un élément selon la même règle (70 % niveau du joueur, 30 % niveau inférieur). */
export function pickOneByLevel<T extends { level: GameLevel }>(
  items: readonly T[],
  level: GameLevel,
  rng: () => number = Math.random
): T | null {
  const main = items.filter((item) => item.level === level);
  const below = items.filter((item) => item.level === level - 1);
  const useBelow = level > 1 && below.length > 0 && (main.length === 0 || rng() >= MAIN_LEVEL_SHARE);
  const pool = useBelow ? below : main.length > 0 ? main : below;
  if (pool.length > 0) return pool[Math.floor(rng() * pool.length)] ?? null;
  if (items.length === 0) return null;
  const nearest = Math.min(...items.map((item) => Math.abs(item.level - level)));
  const fallback = items.filter((item) => Math.abs(item.level - level) === nearest);
  return fallback[Math.floor(rng() * fallback.length)] ?? null;
}
