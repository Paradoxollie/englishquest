import { getGameBySlug } from "@/lib/games/config";
import { lessons } from "@/lib/courses/lessons";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

export type CourseMissionTargetSource = "default" | "community_average";

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
        averageLabel: (target) => `Fais mieux que le temps moyen: ${formatSeconds(target)} ou moins.`,
        defaultCompact: (target) => `${formatSeconds(target)} max`,
        averageCompact: (target) => `moy. ${formatSeconds(target)}`,
        defaultAction: "viser la vitesse",
        averageAction: "passer sous la moyenne",
      };
    case "flashback":
      return {
        scoreDirection: "higher",
        metric: "words",
        defaultTarget: () => 10 + entry.palierId * 3 + Math.floor(withinPalierIndex / 2),
        defaultLabel: (target) => `Memorise ${target} mots sans casser ta serie.`,
        averageLabel: (target) => `Fais mieux que la moyenne: ${target} mots.`,
        defaultCompact: (target) => `${target} mots`,
        averageCompact: (target) => `moy. ${target} mots`,
        defaultAction: "tenir la memoire",
        averageAction: "depasser la moyenne",
      };
    case "space-lex":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 650 + entry.palierId * 240 + withinPalierIndex * 40,
        defaultLabel: (target) => `Atteins ${target} points dans l'arene lexicale.`,
        averageLabel: (target) => `Depasse la moyenne actuelle: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `moy. ${target} pts`,
        defaultAction: "tenir l'arene",
        averageAction: "depasser la moyenne",
      };
    case "enigma-scroll":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 520 + entry.palierId * 180 + withinPalierIndex * 28,
        defaultLabel: (target) => `Depasse ${target} points dans l'enigme.`,
        averageLabel: (target) => `Depasse la moyenne actuelle: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `moy. ${target} pts`,
        defaultAction: "resoudre vite",
        averageAction: "depasser la moyenne",
      };
    case "wordfall":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 560 + entry.palierId * 160 + withinPalierIndex * 35,
        defaultLabel: (target) => `Nettoie l'ecran et passe ${target} points.`,
        averageLabel: (target) => `Depasse la moyenne actuelle: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `moy. ${target} pts`,
        defaultAction: "tenir la pression",
        averageAction: "depasser la moyenne",
      };
    case "speed-verb-challenge":
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => 500 + entry.palierId * 140 + withinPalierIndex * 26,
        defaultLabel: (target) => `Atteins ${target} points en gardant le combo vivant.`,
        averageLabel: (target) => `Depasse la moyenne actuelle: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `moy. ${target} pts`,
        defaultAction: "garder le combo",
        averageAction: "depasser la moyenne",
      };
    default:
      return {
        scoreDirection: "higher",
        metric: "points",
        defaultTarget: () => getMissionTargetScore(entry),
        defaultLabel: (target) => `Passe la barre des ${target} points.`,
        averageLabel: (target) => `Depasse la moyenne actuelle: ${target} points.`,
        defaultCompact: (target) => `${target} pts`,
        averageCompact: (target) => `moy. ${target} pts`,
        defaultAction: "viser le score",
        averageAction: "depasser la moyenne",
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
      targetSource === "community_average"
        ? definition.averageLabel(scoreTarget)
        : definition.defaultLabel(scoreTarget),
    gameChallengeCompact:
      targetSource === "community_average"
        ? definition.averageCompact(scoreTarget)
        : definition.defaultCompact(scoreTarget),
    gameChallengeAction:
      targetSource === "community_average"
        ? definition.averageAction
        : definition.defaultAction,
  };
}

export function buildCourseMissionPlan(
  entry: CourseMissionPlanEntryInput,
  options?: {
    scoreTarget?: number;
    targetSource?: CourseMissionTargetSource;
  }
): CourseMissionPlan {
  const lesson = lessons[entry.courseId];
  const validationSection = lesson?.sections.find((section) =>
    /validation|quiz|mission/i.test(section.title)
  );
  const primaryGame = entry.recommendedGameSlugs
    .map((slug) => getGameBySlug(slug))
    .find(Boolean);
  const challenge = buildGameChallenge(entry, primaryGame?.slug ?? null, options);

  return {
    objective: lesson?.objective ?? entry.summary,
    validationLabel: validationSection?.title ?? "Mission Validation",
    scoreTarget: challenge.scoreTarget,
    scoreDirection: challenge.scoreDirection,
    targetSource: options?.targetSource ?? "default",
    gameChallengeLabel: challenge.gameChallengeLabel,
    gameChallengeCompact: challenge.gameChallengeCompact,
    gameChallengeAction: challenge.gameChallengeAction,
    primaryGameSlug: primaryGame?.slug ?? null,
    primaryGameName: primaryGame?.name ?? null,
    primaryGameTagline: primaryGame?.tags.slice(0, 2).join(" / ") ?? null,
  };
}

export function getCourseMissionPlan(entry: CourseMissionPlanEntryInput): CourseMissionPlan {
  return buildCourseMissionPlan(entry);
}
