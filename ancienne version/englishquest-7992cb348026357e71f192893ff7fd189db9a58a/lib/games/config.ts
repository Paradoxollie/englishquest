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
    tags: ["Vocabulaire", "Jeux de mots"],
    icon: "📜",
    gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    iconColor: "text-emerald-400",
  },
  {
    slug: "brew-your-words",
    name: "Brew Your Words",
    description: "Construisez des phrases correctes sous pression temporelle. Maîtrisez la grammaire anglaise en créant des phrases parfaites.",
    difficulty: "medium",
    tags: ["Grammaire", "Construction de phrases"],
    icon: "⚗️",
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
    iconColor: "text-purple-400",
  },
  {
    slug: "echoes-of-lexicon",
    name: "Echoes of Lexicon",
    description: "Testez votre orthographe dans un style Spelling Bee. Épelez correctement les mots pour progresser.",
    difficulty: "medium",
    tags: ["Orthographe", "Vocabulaire"],
    icon: "🔤",
    gradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    iconColor: "text-yellow-400",
  },
  {
    slug: "space-lex",
    name: "Tir Lex Spatial",
    description: "Plongez dans une aventure spatiale épique ! Pilotez votre vaisseau et tirez sur les mots correspondant aux missions lexicales. Défiez votre vocabulaire anglais dans un jeu d'arcade palpitant où chaque mot compte.",
    difficulty: "medium",
    tags: ["Vocabulaire", "Arcade", "Tir"],
    icon: "🚀",
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-purple-600 to-indigo-600",
    iconColor: "text-purple-400",
  },
  {
    slug: "speed-verb-challenge",
    name: "Speed Verb Challenge",
    description: "Conjuguez les verbes irréguliers anglais le plus rapidement possible. Testez votre vitesse et votre mémoire avec ce défi chronométré.",
    difficulty: "medium",
    tags: ["Grammaire", "Verbes", "Vitesse"],
    icon: "⚡",
    gradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-amber-500 to-yellow-500",
    iconColor: "text-amber-400",
  },
  {
    slug: "wordfall",
    name: "Wordfall",
    description: "Tapez les mots qui tombent avant qu'ils touchent le sol. En mode libre, inventez autant de mots valides que possible !",
    difficulty: "easy",
    tags: ["Vocabulaire", "Frappe", "Vitesse"],
    icon: "📝",
    gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    iconColor: "text-cyan-400",
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


