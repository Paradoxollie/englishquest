/**
 * TypeScript types for the gamification data model.
 * 
 * These types match the database tables defined in supabase/gamification.sql
 * and should be kept in sync with the SQL schema.
 */

/**
 * Game difficulty levels
 */
export type GameDifficulty = "easy" | "medium" | "hard";

/**
 * Game definition from the games table.
 * This represents a playable game in the system.
 */
export type Game = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  difficulty: GameDifficulty;
  created_at: string;
  updated_at: string;
};

/**
 * Game score from the game_scores table.
 * This represents a single game play session result.
 */
export type GameScore = {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  max_score: number | null;
  duration_ms: number | null;
  created_at: string;
};

/**
 * Extended game score with game information (for joins)
 */
export type GameScoreWithGame = GameScore & {
  game: Game;
};


