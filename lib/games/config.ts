/**
 * Static game configuration for the UI.
 * 
 * IMPORTANT: This is STATIC CONFIG for display purposes only.
 * The actual game data should be stored in the Supabase `games` table
 * (see supabase/gamification.sql).
 * 
 * This config is used to:
 * - Render game cards on the /play page
 * - Define routes under /play/[slug]
 * - Display game information before games are fully implemented
 * 
 * TODO: Once the games table is populated in Supabase, fetch games
 * dynamically from the database instead of using this static config.
 */

import type { GameDifficulty } from "./types";

export type GameConfig = {
  slug: string;
  name: string;
  description: string;
  difficulty: GameDifficulty;
  tags: string[];
  icon: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
};

/**
 * Static array of games visible on the /play page.
 * 
 * The slugs here MUST match the routes under /play/[slug] that already exist.
 * 
 * This config is used for UI rendering only. The actual game data
 * (for scores, statistics, etc.) will come from the Supabase `games` table
 * once it's populated.
 */
export const games: GameConfig[] = [
  {
    slug: "enigma-scroll",
    name: "Enigma Scroll",
    description: "Devinez les mots cachés dans des énigmes. Améliorez votre vocabulaire en résolvant des mystères linguistiques.",
    difficulty: "easy",
    tags: ["Vocabulary", "Word Games"],
    icon: "📜",
    gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    slug: "brew-your-words",
    name: "Brew Your Words",
    description: "Construisez des phrases correctes sous pression temporelle. Maîtrisez la grammaire anglaise en créant des phrases parfaites.",
    difficulty: "medium",
    tags: ["Grammar", "Sentence Building"],
    icon: "⚗️",
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    slug: "echoes-of-lexicon",
    name: "Echoes of Lexicon",
    description: "Testez votre orthographe dans un style Spelling Bee. Épelez correctement les mots pour progresser.",
    difficulty: "medium",
    tags: ["Spelling", "Vocabulary"],
    icon: "🔤",
    gradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  {
    slug: "arcane-listening-trials",
    name: "Arcane Listening Trials",
    description: "Écoutez et comprenez des dialogues en anglais. Développez vos compétences d'écoute avec des défis progressifs.",
    difficulty: "hard",
    tags: ["Listening", "Comprehension"],
    icon: "👂",
    gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
  {
    slug: "speed-verb-challenge",
    name: "Speed Verb Challenge",
    description: "Conjuguez les verbes irréguliers anglais le plus rapidement possible. Testez votre vitesse et votre mémoire avec ce défi chronométré.",
    difficulty: "medium",
    tags: ["Grammar", "Verbs", "Speed"],
    icon: "⚡",
    gradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
];

/**
 * Get a game config by slug
 */
export function getGameBySlug(slug: string): GameConfig | undefined {
  return games.find((game) => game.slug === slug);
}

/**
 * Difficulty color mapping for UI badges
 */
export const difficultyColors: Record<GameDifficulty, string> = {
  easy: "bg-green-500",
  medium: "bg-amber-500",
  hard: "bg-red-500",
};


