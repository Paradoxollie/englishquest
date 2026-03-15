import { getGameBySlug } from "@/lib/games/config";
import { lessons } from "@/lib/courses/lessons";
import { getCourseMetadata, getCourseRewardProfile } from "@/lib/courses/metadata";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

export type CourseMissionTargetSource = "default" | "community_median";

export type CourseMissionPlan = {
  objective: string;
  validationLabel: string;
  scoreTarget: number;
  scoreDirection: "higher" | "lower";
  targetSource: CourseMissionTargetSource;
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
  defaultTarget: (entry: Pick<CourseRoadmapEntry, "courseId" | "palierId" | "rewardXp">) => number;
  defaultLabel: (target: number) => string;
  averageLabel: (target: number) => string;
  defaultCompact: (target: number) => string;
  averageCompact: (target: number) => string;
  defaultAction: string;
  averageAction: string;
};

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

export function getMissionTargetScore(entry: Pick<CourseRoadmapEntry, "palierId" | "rewardXp">) {
  return 900 + entry.palierId * 250 + entry.rewardXp * 4;
}

function formatSeconds(milliseconds: number) {
  return `${(milliseconds / 1000).toFixed(1)} s`;
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
  entry: Pick<CourseRoadmapEntry, "courseId" | "palierId" | "rewardXp">,
  gameSlug: string | null
): ChallengeDefinition {
  const withinPalierIndex = (entry.courseId - 1) % 10;

  switch (gameSlug) {
    case "flash-translation":
      return {
        scoreDirection: "lower",
        metric: "time",
        defaultTarget: () => 16800 - entry.palierId * 900 - withinPalierIndex * 110,
        defaultLabel: (target) => `Boucle les 10 manches en ${formatSeconds(target)} ou moins.`,
        averageLabel: (target) => `Passe sous le temps de reference: ${formatSeconds(target)} ou moins.`,
        defaultCompact: (target) => `${formatSeconds(target)} max`,
        averageCompact: (target) => `${formatSeconds(target)} max`,
        defaultAction: "viser la vitesse",
        averageAction: "battre la reference",
      };
    case "flashback":
      return {
        scoreDirection: "higher",
        metric: "words",
        defaultTarget: () => 10 + entry.palierId * 3 + Math.floor(withinPalierIndex / 2),
        defaultLabel: (target) => `Memorise ${target} mots sans casser ta serie.`,
        averageLabel: (target) => `Passe le score de reference: ${target} mots.`,
        defaultCompact: (target) => `${target} mots`,
        averageCompact: (target) => `${target} mots`,
        defaultAction: "tenir la memoire",
        averageAction: "battre la reference",
      };
    case "space-lex":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 650 + entry.palierId * 240 + withinPalierIndex * 40,
        defaultLabel: (target) => `Atteins ${target} points dans l'arene lexicale.`,
        averageLabel: (target) => `Passe le score de reference: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `${target} pts`,
        defaultAction: "tenir l'arene",
        averageAction: "battre la reference",
      };
    case "enigma-scroll":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 520 + entry.palierId * 180 + withinPalierIndex * 28,
        defaultLabel: (target) => `Depasse ${target} points dans l'enigme.`,
        averageLabel: (target) => `Passe le score de reference: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `${target} pts`,
        defaultAction: "resoudre vite",
        averageAction: "battre la reference",
      };
    case "wordfall":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 560 + entry.palierId * 160 + withinPalierIndex * 35,
        defaultLabel: (target) => `Nettoie l'ecran et passe ${target} points.`,
        averageLabel: (target) => `Passe le score de reference: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `${target} pts`,
        defaultAction: "tenir la pression",
        averageAction: "battre la reference",
      };
    case "speed-verb-challenge":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 500 + entry.palierId * 140 + withinPalierIndex * 26,
        defaultLabel: (target) => `Atteins ${target} points en gardant le combo vivant.`,
        averageLabel: (target) => `Passe le score de reference: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `${target} pts`,
        defaultAction: "garder le combo",
        averageAction: "battre la reference",
      };
    default:
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => getMissionTargetScore(entry),
        defaultLabel: (target) => `Passe la barre des ${target} points.`,
        averageLabel: (target) => `Passe le score de reference: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `${target} pts`,
        defaultAction: "viser le score",
        averageAction: "battre la reference",
      };
  }
}

function buildGameChallenge(
  entry: Pick<CourseRoadmapEntry, "courseId" | "palierId" | "rewardXp">,
  gameSlug: string | null,
  options?: {
    scoreTarget?: number;
    targetSource?: CourseMissionTargetSource;
  }
) {
  const definition = getChallengeDefinition(entry, gameSlug);
  const targetSource = options?.targetSource ?? "default";
  const baseTarget =
    typeof options?.scoreTarget === "number"
      ? options.scoreTarget
      : definition.defaultTarget(entry);
  const scoreTarget = normalizeTarget(definition.metric, baseTarget);

  return {
    scoreTarget,
    scoreDirection: definition.scoreDirection,
    gameChallengeLabel:
      targetSource === "community_median"
        ? definition.averageLabel(scoreTarget)
        : definition.defaultLabel(scoreTarget),
    gameChallengeCompact:
      targetSource === "community_median"
        ? definition.averageCompact(scoreTarget)
        : definition.defaultCompact(scoreTarget),
    gameChallengeAction:
      targetSource === "community_median"
        ? definition.averageAction
        : definition.defaultAction,
  };
}

export function buildCourseMissionPlan(
  entry: CourseMissionPlanEntryInput,
  options?: {
    scoreTarget?: number;
    targetSource?: CourseMissionTargetSource;
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
  const challenge = buildGameChallenge(entry, primaryGameSlug, options);

  return {
    objective: lesson?.objective ?? entry.summary,
    validationLabel: validationSection?.title ?? "Mission Validation",
    scoreTarget: challenge.scoreTarget,
    scoreDirection: challenge.scoreDirection,
    targetSource: options?.targetSource ?? "default",
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
