import type { CourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseMissionState } from "@/lib/courses/mission-state";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

/**
 * Résumé affichable d'une mission : où en est le joueur, quoi faire ensuite.
 * Partagé par la carte d'aventure, l'accueil connecté et la page de cours.
 */
export type MissionSummary = {
  readingDone: boolean;
  quizDone: boolean;
  quizLabel: string;
  gameDone: boolean;
  gameLabel: string;
  note: string;
  cta: { href: string; label: string; tone: "gold" | "cyan" | "ghost" };
  secondary?: { href: string; label: string } | null;
};

export function buildMissionSummary(params: {
  entry: CourseRoadmapEntry;
  plan: CourseMissionPlan;
  state: CourseMissionState | null;
  isLoggedIn: boolean;
}): MissionSummary {
  const { entry, plan, state, isLoggedIn } = params;
  const gameLabel = plan.primaryGameName
    ? `${plan.primaryGameName}, ${plan.gameChallengeCompact}`
    : "Pas de défi de jeu";

  if (!isLoggedIn) {
    return {
      readingDone: false,
      quizDone: false,
      quizLabel: "Quiz à 80 %",
      gameDone: false,
      gameLabel,
      note: "Tu peux lire tous les cours sans compte. Avec un compte, chaque mission validée fait avancer ton pion et rapporte de l'expérience.",
      cta: { href: `/cours/${entry.courseId}`, label: `Lire le cours ${entry.courseId}`, tone: "gold" },
      secondary: null,
    };
  }

  const readingDone = state?.readingCheckpointReached ?? false;
  const quizDone = state?.quizPassed ?? false;
  const gameDone = state?.gameChallengeReached ?? !plan.primaryGameSlug;
  const quizLabel =
    state?.quizScore != null && state.quizTotal
      ? `Quiz ${state.quizScore} / ${state.quizTotal}`
      : "Quiz à 80 %";

  let note = "Ouvre le cours, lis-le, puis réussis le quiz à 80 % avant le défi de jeu.";
  let cta: MissionSummary["cta"] = {
    href: `/cours/${entry.courseId}`,
    label: entry.status === "unlocked" ? "Commencer la mission" : "Continuer le cours",
    tone: "gold",
  };
  let secondary: MissionSummary["secondary"] = null;

  if (quizDone && !gameDone && plan.primaryGameSlug) {
    note = `Quiz réussi. Il reste le défi : ${gameLabel}.`;
    cta = { href: `/play/${plan.primaryGameSlug}`, label: `Jouer à ${plan.primaryGameName}`, tone: "gold" };
    secondary = { href: `/cours/${entry.courseId}`, label: "Relire le cours" };
  } else if (readingDone && !quizDone) {
    note = "Cours lu. Direction le quiz : 80 % pour débloquer le défi de jeu.";
    cta = { href: `/cours/${entry.courseId}#quiz`, label: "Faire le quiz", tone: "gold" };
  }

  return { readingDone, quizDone, quizLabel, gameDone, gameLabel, note, cta, secondary };
}
