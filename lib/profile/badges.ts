/**
 * Badges d'English Quest.
 *
 * Un badge récompense un cap franchi : missions, chapitres, examens, parties,
 * jours de suite, niveaux. Chaque définition sait mesurer où en est le joueur
 * (valeur actuelle et cible), ce qui sert à la fois à attribuer le badge et à
 * afficher la progression des badges verrouillés.
 *
 * Module pur : aucune dépendance serveur, testable hors ligne.
 */

import { getLevelFromXP } from "./economy";

export type BadgeTier = "bronze" | "argent" | "or";

export type BadgeCategory =
  | "mission"
  | "chapitre"
  | "examen"
  | "partie"
  | "jeu"
  | "serie"
  | "niveau"
  | "quiz"
  | "test";

export type BadgeStats = {
  /** Missions validées en jouant (les cours acquis au test de niveau ne comptent pas). */
  missionsCompleted: number;
  /** Chapitres dont les dix missions sont validées sur la carte. */
  chaptersCompleted: number[];
  examsPassed: number;
  gamesPlayed: number;
  gamesPlayedBySlug: Record<string, number>;
  dailyStreak: number;
  bestDailyStreak: number | null;
  level: number;
  totalXp: number;
  /** Cours dont le meilleur quiz est à 10 sur 10. */
  perfectQuizzes: number;
  placementTaken: boolean;
};

export type BadgeDefinition = {
  key: string;
  name: string;
  /** Comment l'obtenir, à la deuxième personne. */
  description: string;
  tier: BadgeTier;
  category: BadgeCategory;
  target: number;
  measure: (stats: BadgeStats) => number;
};

export type BadgeProgress = {
  current: number;
  target: number;
  earned: boolean;
  percent: number;
};

/** Les sept jeux, avec le nom de leur badge « 10 parties ». */
export const BADGE_GAMES = [
  { slug: "speed-verb-challenge", name: "Speed Verb Challenge", badgeName: "Verbes en rafale" },
  { slug: "enigma-scroll", name: "Enigma Scroll", badgeName: "Décodeur" },
  { slug: "wordfall", name: "Wordfall", badgeName: "Pluie de mots" },
  { slug: "space-lex", name: "Lexicon Blaster", badgeName: "Pilote lexical" },
  { slug: "flash-translation", name: "Flash Translation", badgeName: "Traducteur éclair" },
  { slug: "flashback", name: "Flashback", badgeName: "Mémoire vive" },
  { slug: "grammar-rush", name: "Grammar Rush", badgeName: "Grammaire express" },
] as const;

export const GAME_BADGE_TARGET = 10;

const CHAPTER_BADGES: Array<{ chapter: number; name: string; chapterName: string; tier: BadgeTier }> = [
  { chapter: 1, name: "Fondations posées", chapterName: "Fondations", tier: "bronze" },
  { chapter: 2, name: "Élan pris", chapterName: "Élan", tier: "bronze" },
  { chapter: 3, name: "Connexion établie", chapterName: "Connexion", tier: "argent" },
  { chapter: 4, name: "Tacticien", chapterName: "Tactique", tier: "argent" },
  { chapter: 5, name: "Maîtrise totale", chapterName: "Maîtrise", tier: "or" },
];

function count(value: number | null | undefined) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value as number)) : 0;
}

export function getGameBadgeKey(slug: string) {
  return `game_${slug.replace(/-/g, "_")}`;
}

function distinctGamesPlayed(stats: BadgeStats) {
  return BADGE_GAMES.filter((game) => count(stats.gamesPlayedBySlug[game.slug]) > 0).length;
}

export const BADGES: readonly BadgeDefinition[] = [
  // Missions
  { key: "mission_1", name: "Premier pas", description: "Valide ta première mission.", tier: "bronze", category: "mission", target: 1, measure: (s) => count(s.missionsCompleted) },
  { key: "missions_5", name: "En route", description: "Valide 5 missions.", tier: "bronze", category: "mission", target: 5, measure: (s) => count(s.missionsCompleted) },
  { key: "missions_25", name: "Mi-parcours", description: "Valide 25 missions.", tier: "argent", category: "mission", target: 25, measure: (s) => count(s.missionsCompleted) },
  { key: "missions_50", name: "Carte complète", description: "Valide les 50 missions de la carte.", tier: "or", category: "mission", target: 50, measure: (s) => count(s.missionsCompleted) },

  // Chapitres
  ...CHAPTER_BADGES.map(
    (chapter): BadgeDefinition => ({
      key: `chapter_${chapter.chapter}`,
      name: chapter.name,
      description: `Termine le chapitre ${chapter.chapter}, ${chapter.chapterName} : ses dix missions validées.`,
      tier: chapter.tier,
      category: "chapitre",
      target: 1,
      measure: (s) => (s.chaptersCompleted.includes(chapter.chapter) ? 1 : 0),
    })
  ),

  // Examens
  { key: "exam_1", name: "Boss vaincu", description: "Réussis un examen de chapitre : 12 bonnes réponses sur 15.", tier: "argent", category: "examen", target: 1, measure: (s) => count(s.examsPassed) },

  // Parties
  { key: "games_10", name: "Échauffé", description: "Joue 10 parties, tous jeux confondus.", tier: "bronze", category: "partie", target: 10, measure: (s) => count(s.gamesPlayed) },
  { key: "games_100", name: "Infatigable", description: "Joue 100 parties, tous jeux confondus.", tier: "argent", category: "partie", target: 100, measure: (s) => count(s.gamesPlayed) },
  ...BADGE_GAMES.map(
    (game): BadgeDefinition => ({
      key: getGameBadgeKey(game.slug),
      name: game.badgeName,
      description: `Joue ${GAME_BADGE_TARGET} parties de ${game.name}.`,
      tier: "bronze",
      category: "jeu",
      target: GAME_BADGE_TARGET,
      measure: (s) => count(s.gamesPlayedBySlug[game.slug]),
    })
  ),
  { key: "all_games", name: "Touche-à-tout", description: `Joue au moins une partie de chacun des ${BADGE_GAMES.length} jeux.`, tier: "argent", category: "jeu", target: BADGE_GAMES.length, measure: distinctGamesPlayed },

  // Jours de suite
  { key: "streak_3", name: "Régulier", description: "Joue 3 jours de suite.", tier: "bronze", category: "serie", target: 3, measure: (s) => Math.max(count(s.dailyStreak), count(s.bestDailyStreak)) },
  { key: "streak_7", name: "Semaine parfaite", description: "Joue 7 jours de suite.", tier: "argent", category: "serie", target: 7, measure: (s) => Math.max(count(s.dailyStreak), count(s.bestDailyStreak)) },
  { key: "streak_30", name: "Inarrêtable", description: "Joue 30 jours de suite.", tier: "or", category: "serie", target: 30, measure: (s) => Math.max(count(s.dailyStreak), count(s.bestDailyStreak)) },

  // Niveaux
  { key: "level_5", name: "Décollage", description: "Atteins le niveau 5.", tier: "bronze", category: "niveau", target: 5, measure: (s) => Math.max(count(s.level), getLevelFromXP(count(s.totalXp))) },
  { key: "level_10", name: "Altitude", description: "Atteins le niveau 10.", tier: "argent", category: "niveau", target: 10, measure: (s) => Math.max(count(s.level), getLevelFromXP(count(s.totalXp))) },
  { key: "level_20", name: "Sommet", description: "Atteins le niveau 20.", tier: "or", category: "niveau", target: 20, measure: (s) => Math.max(count(s.level), getLevelFromXP(count(s.totalXp))) },

  // Quiz et test de niveau
  { key: "perfect_quiz", name: "Sans faute", description: "Obtiens 10 sur 10 au quiz d'un cours.", tier: "bronze", category: "quiz", target: 1, measure: (s) => count(s.perfectQuizzes) },
  { key: "placement", name: "Point de départ", description: "Passe le test de niveau.", tier: "bronze", category: "test", target: 1, measure: (s) => (s.placementTaken ? 1 : 0) },
];

const BADGES_BY_KEY = new Map(BADGES.map((badge) => [badge.key, badge]));

export const BADGE_TIER_LABELS: Record<BadgeTier, string> = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
};

export function getBadgeDefinition(key: string): BadgeDefinition | null {
  return BADGES_BY_KEY.get(key) ?? null;
}

export function emptyBadgeStats(): BadgeStats {
  return {
    missionsCompleted: 0,
    chaptersCompleted: [],
    examsPassed: 0,
    gamesPlayed: 0,
    gamesPlayedBySlug: {},
    dailyStreak: 0,
    bestDailyStreak: null,
    level: 1,
    totalXp: 0,
    perfectQuizzes: 0,
    placementTaken: false,
  };
}

export function getBadgeProgress(badge: BadgeDefinition, stats: BadgeStats): BadgeProgress {
  const raw = badge.measure(stats);
  const current = Math.min(badge.target, Math.max(0, Number.isFinite(raw) ? raw : 0));
  return {
    current,
    target: badge.target,
    earned: current >= badge.target,
    percent: Math.round((current / badge.target) * 100),
  };
}

/** Clés des badges mérités avec ces statistiques, dans l'ordre des définitions. */
export function evaluateBadges(stats: BadgeStats): string[] {
  return BADGES.filter((badge) => getBadgeProgress(badge, stats).earned).map((badge) => badge.key);
}
