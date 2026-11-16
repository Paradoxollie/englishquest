import type { Difficulty } from "@/lib/profile/leveling";

export type LeaderboardScoreFormat = "points" | "seconds";
export type LeaderboardScoreOrder = "asc" | "desc";

export type GameLeaderboardBucketConfig = {
  key: string;
  label: string;
  difficulty?: Difficulty;
};

export type GameLeaderboardMeta = {
  slug: string;
  hasDifficultyTabs: boolean;
  scoreOrder: LeaderboardScoreOrder;
  format: LeaderboardScoreFormat;
  boardTitle: string;
  buckets: GameLeaderboardBucketConfig[];
};

const DEFAULT_DIFFICULTY_BUCKETS: GameLeaderboardBucketConfig[] = [
  { key: "easy", label: "Facile", difficulty: "easy" },
  { key: "medium", label: "Moyen", difficulty: "medium" },
  { key: "hard", label: "Difficile", difficulty: "hard" },
];

const SINGLE_BUCKET: GameLeaderboardBucketConfig[] = [{ key: "all", label: "Tous" }];

const GAME_LEADERBOARD_META: Record<string, GameLeaderboardMeta> = {
  "enigma-scroll": {
    slug: "enigma-scroll",
    hasDifficultyTabs: true,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: [
      { key: "easy", label: "4 lettres", difficulty: "easy" },
      { key: "medium", label: "5 lettres", difficulty: "medium" },
      { key: "hard", label: "6 lettres", difficulty: "hard" },
    ],
  },
  "space-lex": {
    slug: "space-lex",
    hasDifficultyTabs: false,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: SINGLE_BUCKET,
  },
  "speed-verb-challenge": {
    slug: "speed-verb-challenge",
    hasDifficultyTabs: true,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: DEFAULT_DIFFICULTY_BUCKETS,
  },
  wordfall: {
    slug: "wordfall",
    hasDifficultyTabs: true,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: [
      { key: "exact", label: "Vocabulaire", difficulty: "easy" },
      { key: "free", label: "Mot libre", difficulty: "hard" },
    ],
  },
  "flash-translation": {
    slug: "flash-translation",
    hasDifficultyTabs: false,
    scoreOrder: "asc",
    format: "seconds",
    boardTitle: "Meilleurs temps",
    buckets: SINGLE_BUCKET,
  },
  "grammar-rush": {
    slug: "grammar-rush",
    hasDifficultyTabs: false,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: SINGLE_BUCKET,
  },
  flashback: {
    slug: "flashback",
    hasDifficultyTabs: false,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: SINGLE_BUCKET,
  },
  "spell-strike": {
    slug: "spell-strike",
    hasDifficultyTabs: true,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: DEFAULT_DIFFICULTY_BUCKETS,
  },
  "echo-signal": {
    slug: "echo-signal",
    hasDifficultyTabs: true,
    scoreOrder: "desc",
    format: "points",
    boardTitle: "Classement",
    buckets: DEFAULT_DIFFICULTY_BUCKETS,
  },
};

export function getGameLeaderboardMeta(slug: string): GameLeaderboardMeta {
  return (
    GAME_LEADERBOARD_META[slug] ?? {
      slug,
      hasDifficultyTabs: false,
      scoreOrder: "desc",
      format: "points",
      boardTitle: "Classement",
      buckets: SINGLE_BUCKET,
    }
  );
}

export function formatLeaderboardScore(format: LeaderboardScoreFormat, score: number): string {
  if (format === "seconds") {
    return `${(score / 1000).toFixed(2)} s`;
  }
  return score.toLocaleString("fr-FR");
}
