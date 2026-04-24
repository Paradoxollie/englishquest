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
    description:
      "Devine les mots caches dans des enigmes courtes. Tu progresses en vocabulaire en reliant indices, logique et contexte.",
    difficulty: "easy",
    tags: ["Vocabulaire", "Jeux de mots"],
    icon: "ES",
    gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    iconColor: "text-emerald-400",
  },
  {
    slug: "space-lex",
    name: "Lexicon Blaster",
    description:
      "Pilote ton vaisseau et verrouille les bons mots avant l'impact. Un mode arcade pour automatiser ton vocabulaire.",
    difficulty: "medium",
    tags: ["Vocabulaire", "Arcade", "Shoot'em up"],
    icon: "LB",
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-purple-600 to-indigo-600",
    iconColor: "text-purple-400",
  },
  {
    slug: "speed-verb-challenge",
    name: "Speed Verb Challenge",
    description:
      "Conjugue les verbes irreguliers anglais sous chrono. Tu travailles la vitesse, la memoire et les automatismes.",
    difficulty: "medium",
    tags: ["Grammaire", "Verbes", "Vitesse"],
    icon: "SV",
    gradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-amber-500 to-yellow-500",
    iconColor: "text-amber-400",
  },
  {
    slug: "wordfall",
    name: "Wordfall",
    description:
      "Tape les mots qui tombent avant qu'ils ne touchent le sol. En mode libre, invente autant de mots valides que possible.",
    difficulty: "easy",
    tags: ["Vocabulaire", "Saisie", "Vitesse"],
    icon: "WF",
    gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    iconColor: "text-cyan-400",
  },
  {
    slug: "flash-translation",
    name: "Flash Translation",
    description:
      "Trouve la bonne traduction le plus vite possible. Un duel de reflexes pour consolider les equivalences utiles.",
    difficulty: "medium",
    tags: ["Vocabulaire", "Reflexes", "Vitesse"],
    icon: "FT",
    gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(251, 146, 60, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-red-600 to-orange-600",
    iconColor: "text-red-400",
  },
  {
    slug: "flashback",
    name: "Flashback",
    description:
      "Memorise les mots, puis repere ceux que tu as deja vus. Un entrainement court pour renforcer la reconnaissance.",
    difficulty: "medium",
    tags: ["Vocabulaire", "Memoire", "Apprentissage"],
    icon: "FB",
    gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
    iconBg: "bg-gradient-to-br from-indigo-600 to-purple-600",
    iconColor: "text-indigo-400",
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
