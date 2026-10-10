import { getGameBySlug } from "@/lib/games/config";
import { lessons } from "@/lib/courses/lessons";
import { getCourseMetadata, getCourseRewardProfile } from "@/lib/courses/metadata";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

export type CourseMissionPlan = {
  objective: string;
  validationLabel: string;
  scoreTarget: number;
  scoreDirection: "higher" | "lower";
  gameChallengeLabel: string;
  gameChallengeCompact: string;
  gameChallengeAction: string;
  primaryGameSlug: string | null;
  primaryGameName: string | null;
  primaryGameTagline: string | null;
};

export type CourseMissionPlanEntryInput = Pick<
  CourseRoadmapEntry,
  "courseId" | "summary" | "recommendedGameSlugs" | "palierId" | "rewardXp"
>;

type CourseMissionGameSelectionInput = Pick<
  CourseMissionPlanEntryInput,
  "courseId" | "recommendedGameSlugs" | "palierId" | "rewardXp" | "summary"
>;

type ChallengeDefinition = {
  scoreDirection: "higher" | "lower";
  metric: "points" | "time" | "words";
  target: number;
  label: (target: number) => string;
  compact: (target: number) => string;
  action: string;
};

/**
 * Objectifs de mission fixes, par palier et par position dans le palier.
 *
 * Chaque jeu a sa propre échelle de score (voir lib/games/*). Les valeurs
 * ci-dessous correspondent à une partie "correcte" au palier 1 et à une
 * partie solide au palier 5. Elles se règlent ici, à un seul endroit.
 *
 * - base : objectif du premier cours du palier 1
 * - perPalier : ajouté à chaque palier
 * - perCourse : ajouté à chaque cours dans le palier (0 à 9)
 */
export const MISSION_TARGETS: Record<
  string,
  { base: number; perPalier: number; perCourse: number }
> = {
  // Points : difficulté × combo, environ 120 points pour 25 verbes justes.
  "speed-verb-challenge": { base: 40, perPalier: 25, perCourse: 2.5 },
  // Points : environ 25 points par mot trouvé.
  "enigma-scroll": { base: 80, perPalier: 40, perCourse: 4 },
  // Points : 10 à 15 points par mot attrapé, combos jusqu'à ×3.
  wordfall: { base: 100, perPalier: 50, perCourse: 5 },
  // Points : 10 × niveau par mot, bonus de vague.
  "space-lex": { base: 250, perPalier: 120, perCourse: 12 },
  // Mots : nombre de bonnes décisions avant 3 erreurs.
  flashback: { base: 10, perPalier: 4, perCourse: 0.5 },
  // Temps total (ms) pour 10 manches, le plus bas possible.
  "flash-translation": { base: 24000, perPalier: -2000, perCourse: -150 },
  // Points : 10 à 25 par bonne réponse selon la série, environ 15 réponses en une minute.
  "grammar-rush": { base: 120, perPalier: 40, perCourse: 5 },
};

function computeFixedTarget(
  gameSlug: string,
  entry: Pick<CourseRoadmapEntry, "courseId" | "palierId">
) {
  const scale = MISSION_TARGETS[gameSlug] ?? { base: 100, perPalier: 50, perCourse: 5 };
  const palierIndex = Math.max(0, Math.min(4, entry.palierId - 1));
  const withinPalierIndex = Math.max(0, (entry.courseId - 1) % 10);
  return scale.base + palierIndex * scale.perPalier + withinPalierIndex * scale.perCourse;
}

const recentMissionGameMemory = 2;

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function pickMissionGameSlug(
  recommendedGameSlugs: string[],
  recentGameSlugs: string[]
) {
  const candidates = unique(recommendedGameSlugs).filter((slug) => Boolean(getGameBySlug(slug)));

  if (candidates.length === 0) {
    return null;
  }

  const freshCandidate = candidates.find((slug) => !recentGameSlugs.includes(slug));
  if (freshCandidate) {
    return freshCandidate;
  }

  const latestGameSlug = recentGameSlugs[recentGameSlugs.length - 1];
  const nonConsecutiveCandidate = candidates.find((slug) => slug !== latestGameSlug);
  return nonConsecutiveCandidate ?? candidates[0];
}

function buildSyntheticMissionEntry(courseId: number): CourseMissionPlanEntryInput {
  const metadata = getCourseMetadata(courseId);
  const rewards = getCourseRewardProfile(courseId);

  return {
    courseId,
    summary: metadata.summary,
    recommendedGameSlugs: metadata.recommendedGameSlugs,
    palierId: metadata.palierId,
    rewardXp: rewards.xp,
  };
}

export function resolveMissionPrimaryGameAssignments(
  entries: CourseMissionGameSelectionInput[]
): Record<number, string | null> {
  const sortedEntries = [...entries].sort((left, right) => left.courseId - right.courseId);
  const recentGameSlugs: string[] = [];
  const assignments: Record<number, string | null> = {};

  for (const entry of sortedEntries) {
    const selectedGameSlug = pickMissionGameSlug(entry.recommendedGameSlugs, recentGameSlugs);
    assignments[entry.courseId] = selectedGameSlug;

    if (selectedGameSlug) {
      recentGameSlugs.push(selectedGameSlug);
      if (recentGameSlugs.length > recentMissionGameMemory) {
        recentGameSlugs.shift();
      }
    }
  }

  return assignments;
}

function resolveStandalonePrimaryGameSlug(
  entry: CourseMissionGameSelectionInput
) {
  const campaignEntries = Array.from({ length: Math.max(1, entry.courseId) }, (_, index) => {
    const courseId = index + 1;
    return courseId === entry.courseId ? entry : buildSyntheticMissionEntry(courseId);
  });

  return resolveMissionPrimaryGameAssignments(campaignEntries)[entry.courseId] ?? null;
}

function formatSeconds(milliseconds: number) {
  const seconds = milliseconds / 1000;
  return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1).replace(".", ",")} s`;
}

function normalizeTarget(metric: ChallengeDefinition["metric"], value: number) {
  if (metric === "time") {
    return Math.max(4000, Math.round(value / 100) * 100);
  }

  if (metric === "words") {
    return Math.max(3, Math.round(value));
  }

  if (value < 40) {
    return Math.max(10, Math.round(value));
  }

  if (value < 120) {
    return Math.max(15, Math.round(value / 5) * 5);
  }

  if (value < 300) {
    return Math.max(25, Math.round(value / 10) * 10);
  }

  if (value < 1200) {
    return Math.max(50, Math.round(value / 25) * 25);
  }

  return Math.max(100, Math.round(value / 25) * 25);
}

function getChallengeDefinition(
  entry: Pick<CourseRoadmapEntry, "courseId" | "palierId">,
  gameSlug: string | null
): ChallengeDefinition {
  const target = computeFixedTarget(gameSlug ?? "default", entry);

  switch (gameSlug) {
    case "flash-translation":
      return {
        scoreDirection: "lower",
        metric: "time",
        target,
        label: (value) => `Boucle les 10 manches en ${formatSeconds(value)} ou moins.`,
        compact: (value) => `${formatSeconds(value)} max`,
        action: "viser la vitesse",
      };
    case "flashback":
      return {
        scoreDirection: "higher",
        metric: "words",
        target,
        label: (value) => `Reconnais ${value} mots sans faire 3 erreurs.`,
        compact: (value) => `${value} mots`,
        action: "tenir la mémoire",
      };
    case "space-lex":
      return {
        scoreDirection: "higher",
        metric: "points",
        target,
        label: (value) => `Atteins ${value} points dans l'arène.`,
        compact: (value) => `${value} pts`,
        action: "tenir l'arène",
      };
    case "enigma-scroll":
      return {
        scoreDirection: "higher",
        metric: "points",
        target,
        label: (value) => `Dépasse ${value} points en devinant les mots.`,
        compact: (value) => `${value} pts`,
        action: "résoudre vite",
      };
    case "wordfall":
      return {
        scoreDirection: "higher",
        metric: "points",
        target,
        label: (value) => `Attrape les mots et passe ${value} points.`,
        compact: (value) => `${value} pts`,
        action: "tenir la pression",
      };
    case "grammar-rush":
      return {
        scoreDirection: "higher",
        metric: "points",
        target,
        label: (value) => `Réponds juste et vite jusqu'à ${value} points.`,
        compact: (value) => `${value} pts`,
        action: "tenir la série",
      };
    case "speed-verb-challenge":
      return {
        scoreDirection: "higher",
        metric: "points",
        target,
        label: (value) => `Atteins ${value} points en gardant le combo.`,
        compact: (value) => `${value} pts`,
        action: "garder le combo",
      };
    default:
      return {
        scoreDirection: "higher",
        metric: "points",
        target,
        label: (value) => `Passe la barre des ${value} points.`,
        compact: (value) => `${value} pts`,
        action: "viser le score",
      };
  }
}

function buildGameChallenge(
  entry: Pick<CourseRoadmapEntry, "courseId" | "palierId">,
  gameSlug: string | null
) {
  const definition = getChallengeDefinition(entry, gameSlug);
  const scoreTarget = normalizeTarget(definition.metric, definition.target);

  return {
    scoreTarget,
    scoreDirection: definition.scoreDirection,
    gameChallengeLabel: definition.label(scoreTarget),
    gameChallengeCompact: definition.compact(scoreTarget),
    gameChallengeAction: definition.action,
  };
}

export function buildCourseMissionPlan(
  entry: CourseMissionPlanEntryInput,
  options?: {
    primaryGameSlug?: string | null;
  }
): CourseMissionPlan {
  const lesson = lessons[entry.courseId];
  const validationSection = lesson?.sections.find((section) =>
    /validation|quiz|mission/i.test(section.title)
  );
  const primaryGameSlug =
    options?.primaryGameSlug ??
    resolveStandalonePrimaryGameSlug(entry);
  const primaryGame = primaryGameSlug ? getGameBySlug(primaryGameSlug) : null;
  const challenge = buildGameChallenge(entry, primaryGameSlug);

  return {
    objective: lesson?.objective ?? entry.summary,
    validationLabel: validationSection?.title ?? "Quiz de validation",
    scoreTarget: challenge.scoreTarget,
    scoreDirection: challenge.scoreDirection,
    gameChallengeLabel: challenge.gameChallengeLabel,
    gameChallengeCompact: challenge.gameChallengeCompact,
    gameChallengeAction: challenge.gameChallengeAction,
    primaryGameSlug: primaryGameSlug,
    primaryGameName: primaryGame?.name ?? null,
    primaryGameTagline: primaryGame?.tags.slice(0, 2).join(" / ") ?? null,
  };
}

export function getCourseMissionPlan(entry: CourseMissionPlanEntryInput): CourseMissionPlan {
  return buildCourseMissionPlan(entry);
}
