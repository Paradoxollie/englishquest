import type { CourseMissionPlan } from "@/lib/courses/campaign";
import { getCoursePracticeHref } from "@/lib/courses/practice";
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
  const gameLabel = plan.primaryGameName ? `Bonus : ${plan.primaryGameName} sur la notion` : "Bonus : entraînement";

  if (!isLoggedIn) {
    return {
      readingDone: false,
      quizDone: false,
      quizLabel: "Quiz à 80 %",
      gameDone: false,
      gameLabel,
      note: "Tu peux lire tous les cours sans compte. Avec un compte, chaque quiz réussi valide la mission, fait avancer ton pion et rapporte de l'expérience.",
      cta: { href: `/cours/${entry.courseId}`, label: `Lire le cours ${entry.courseId}`, tone: "gold" },
      secondary: null,
    };
  }

  const readingDone = state?.readingCheckpointReached ?? false;
  const quizDone = state?.quizPassed ?? false;
  // Étape facultative : elle ne bloque jamais la mission.
  const gameDone = false;
  const quizLabel =
    state?.quizScore != null && state.quizTotal
      ? `Quiz ${state.quizScore} / ${state.quizTotal}`
      : "Quiz à 80 %";

  let note = "Lis le cours, puis réussis le quiz à 80 % : la mission est validée et la suivante s'ouvre.";
  let cta: MissionSummary["cta"] = {
    href: `/cours/${entry.courseId}`,
    label: entry.status === "unlocked" ? "Commencer la mission" : "Continuer le cours",
    tone: "gold",
  };
  let secondary: MissionSummary["secondary"] = null;

  if (quizDone) {
    note = "Quiz réussi : la mission est validée.";
    cta = { href: "/quest", label: "Voir la carte", tone: "gold" };
  } else if (readingDone) {
    note = "Cours lu. Direction le quiz : 80 % pour valider la mission.";
    cta = { href: `/cours/${entry.courseId}#quiz`, label: "Faire le quiz", tone: "gold" };
  }
  if (plan.primaryGameSlug) {
    secondary = { href: getCoursePracticeHref(entry.courseId), label: "S'entraîner sur la notion" };
  }

  return { readingDone, quizDone, quizLabel, gameDone, gameLabel, note, cta, secondary };
}
