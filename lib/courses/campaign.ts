import { getGameBySlug } from "@/lib/games/config";
import { lessons } from "@/lib/courses/lessons";
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

export function getMissionTargetScore(entry: Pick<CourseRoadmapEntry, "palierId" | "rewardXp">) {
  return 900 + entry.palierId * 250 + entry.rewardXp * 4;
}

function formatSeconds(milliseconds: number) {
  return `${(milliseconds / 1000).toFixed(1)} s`;
}

function buildGameChallenge(
  entry: Pick<CourseRoadmapEntry, "courseId" | "palierId" | "rewardXp">,
  gameSlug: string | null
) {
  const withinPalierIndex = (entry.courseId - 1) % 10;

  switch (gameSlug) {
    case "flash-translation": {
      const targetMs = 16800 - entry.palierId * 900 - withinPalierIndex * 110;
      return {
        scoreTarget: targetMs,
        scoreDirection: "lower" as const,
        gameChallengeLabel: `Boucle les 10 manches en ${formatSeconds(targetMs)} ou moins.`,
        gameChallengeCompact: `${formatSeconds(targetMs)} max`,
        gameChallengeAction: "viser la vitesse",
      };
    }
    case "flashback": {
      const targetWords = 10 + entry.palierId * 3 + Math.floor(withinPalierIndex / 2);
      return {
        scoreTarget: targetWords,
        scoreDirection: "higher" as const,
        gameChallengeLabel: `Memorise ${targetWords} mots sans casser ta serie.`,
        gameChallengeCompact: `${targetWords} mots`,
        gameChallengeAction: "tenir la memoire",
      };
    }
    case "space-lex": {
      const targetScore = 650 + entry.palierId * 240 + withinPalierIndex * 40;
      return {
        scoreTarget: targetScore,
        scoreDirection: "higher" as const,
        gameChallengeLabel: `Atteins ${targetScore} points dans l'arene lexicale.`,
        gameChallengeCompact: `${targetScore} pts`,
        gameChallengeAction: "tenir l'arene",
      };
    }
    case "enigma-scroll": {
      const targetScore = 520 + entry.palierId * 180 + withinPalierIndex * 28;
      return {
        scoreTarget: targetScore,
        scoreDirection: "higher" as const,
        gameChallengeLabel: `Depasse ${targetScore} points dans l'enigme.`,
        gameChallengeCompact: `${targetScore} pts`,
        gameChallengeAction: "resoudre vite",
      };
    }
    case "wordfall": {
      const targetScore = 560 + entry.palierId * 160 + withinPalierIndex * 35;
      return {
        scoreTarget: targetScore,
        scoreDirection: "higher" as const,
        gameChallengeLabel: `Nettoie l'ecran et passe ${targetScore} points.`,
        gameChallengeCompact: `${targetScore} pts`,
        gameChallengeAction: "tenir la pression",
      };
    }
    case "speed-verb-challenge": {
      const targetScore = 500 + entry.palierId * 140 + withinPalierIndex * 26;
      return {
        scoreTarget: targetScore,
        scoreDirection: "higher" as const,
        gameChallengeLabel: `Atteins ${targetScore} points en gardant le combo vivant.`,
        gameChallengeCompact: `${targetScore} pts`,
        gameChallengeAction: "garder le combo",
      };
    }
    default: {
      const targetScore = getMissionTargetScore(entry);
      return {
        scoreTarget: targetScore,
        scoreDirection: "higher" as const,
        gameChallengeLabel: `Passe la barre des ${targetScore} points.`,
        gameChallengeCompact: `${targetScore} pts`,
        gameChallengeAction: "viser le score",
      };
    }
  }
}

export function getCourseMissionPlan(
  entry: Pick<
    CourseRoadmapEntry,
    "courseId" | "summary" | "recommendedGameSlugs" | "palierId" | "rewardXp"
  >
): CourseMissionPlan {
  const lesson = lessons[entry.courseId];
  const validationSection = lesson?.sections.find((section) =>
    /validation|quiz|mission/i.test(section.title)
  );
  const primaryGame = entry.recommendedGameSlugs
    .map((slug) => getGameBySlug(slug))
    .find(Boolean);
  const challenge = buildGameChallenge(entry, primaryGame?.slug ?? null);

  return {
    objective: lesson?.objective ?? entry.summary,
    validationLabel: validationSection?.title ?? "Mission Validation",
    scoreTarget: challenge.scoreTarget,
    scoreDirection: challenge.scoreDirection,
    gameChallengeLabel: challenge.gameChallengeLabel,
    gameChallengeCompact: challenge.gameChallengeCompact,
    gameChallengeAction: challenge.gameChallengeAction,
    primaryGameSlug: primaryGame?.slug ?? null,
    primaryGameName: primaryGame?.name ?? null,
    primaryGameTagline:
      primaryGame?.tags.slice(0, 2).join(" / ") ?? null,
  };
}
