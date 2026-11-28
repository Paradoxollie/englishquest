"use client";

import Link from "next/link";
import { ResponsiveDetails } from "@/components/ui/responsive-details";
import { useCourseMission } from "@/components/courses/course-mission-provider";
import { MissionStarsRow } from "@/components/rewards/mission-stars";
import type { CourseMissionPlan } from "@/lib/courses/campaign";
import { decodeCourseMissionTelemetry, isCoursePlacementSkip } from "@/lib/courses/mission-telemetry";
import { getCoursePracticeHref } from "@/lib/courses/practice";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import { computeMissionStars, getMissionStars } from "@/lib/courses/stars";

type MissionBarProps = {
  entry: CourseRoadmapEntry;
  mission: CourseMissionPlan;
  chapterLabel: string;
  nextEntry: CourseRoadmapEntry | null;
  /** Meilleur entraînement ciblé sur ce cours (bonnes réponses dans une partie de Grammar Rush). */
  practiceBest?: number;
};

type StepState = "todo" | "now" | "done";

function Step({ label, state }: { label: string; state: StepState }) {
  return (
    <li className={`eq-mstep ${state === "now" ? "is-now" : ""} ${state === "done" ? "is-done" : ""}`}>
      <i className={`eq-mstep-dot ${state === "now" ? "is-now" : ""} ${state === "done" ? "is-done" : ""}`} aria-hidden="true" />
      <span>{label}</span>
      {state === "done" ? <span className="sr-only">(fait)</span> : null}
      {state === "now" ? <span className="sr-only">(en cours)</span> : null}
    </li>
  );
}

export function MissionBar({ entry, mission, chapterLabel, nextEntry, practiceBest = 0 }: MissionBarProps) {
  const context = useCourseMission();
  const isAuthenticated = context?.isAuthenticated ?? false;
  const tracking = context?.isMissionTrackingEnabled ?? false;
  const state = context?.missionState ?? null;
  const completed = entry.status === "completed";
  const placed = isCoursePlacementSkip(entry.missionTelemetry);
  // Étoiles : le meilleur quiz vient de l'état en direct (mis à jour après le quiz).
  const stars = state?.quizTotal
    ? computeMissionStars({
        completed: completed || state.quizPassed,
        placementSkip: isCoursePlacementSkip(entry.missionTelemetry),
        quizScore: state.quizScore,
        quizTotal: state.quizTotal,
        practiceBest,
      })
    : getMissionStars(entry, practiceBest);

  const readingDone = (completed && !placed) || Boolean(state?.readingCheckpointReached);
  const quizDone = (completed && !placed) || Boolean(state?.quizPassed);

  const readingState: StepState = readingDone ? "done" : "now";
  const quizState: StepState = quizDone ? "done" : readingDone ? "now" : "todo";

  const quiz = state?.quizTotal ? state : decodeCourseMissionTelemetry(entry.missionTelemetry);
  const quizLabel = quiz.quizTotal ? `Quiz ${quiz.quizScore} / ${quiz.quizTotal}` : "Quiz à 80 %";
  const practiceHref = mission.primaryGameSlug && (!isAuthenticated || entry.status !== "locked") ? getCoursePracticeHref(entry.courseId) : null;

  let note: string;
  if (placed) {
    note = "Ton test de niveau a ouvert la suite du parcours. Tu peux revoir ce cours et t’entraîner ici.";
  } else if (!isAuthenticated) {
    note = completed
      ? "Ta réussite est gardée sur cet appareil. Tu peux revoir la notion ou poursuivre ton aventure."
      : "Tu peux avancer sans compte. Réussis le quiz pour garder cette mission sur cet appareil.";
  } else if (completed) {
    note = nextEntry
      ? `Mission validée. La suivante t'attend : cours ${nextEntry.courseId}.`
      : "Mission validée. C'était la dernière de la carte.";
  } else if (!tracking) {
    note = "En entraînement libre, le quiz compte dans Mon suivi. La carte indique les missions qui donnent des récompenses.";
  } else if (quizDone) {
    note = "Quiz réussi : la mission est validée.";
  } else if (readingDone) {
    note = "Cours lu. Il reste le quiz : 80 % pour valider la mission.";
  } else {
    note = "Lis le cours jusqu'au quiz et réussis-le à 80 % pour valider la mission.";
  }

  return (
    <div className="eq-mission-bar">
      <div className="eq-container">
        <ResponsiveDetails className="eq-mission-details" summary={`Suivi et liens de la mission ${entry.courseId}`}>
          <div className="eq-mission-row">
            <p className="eq-mission-where">
              <span>{chapterLabel}</span>
              <b>Mission {entry.courseId}</b>
            </p>
            <ol className="eq-mission-steps" aria-label="Étapes de la mission">
              <Step label="Lire" state={readingState} />
              <Step label={quizLabel} state={quizState} />
            </ol>
            {isAuthenticated ? <MissionStarsRow stars={stars} className="eq-mission-stars" /> : null}
            <p className="eq-mission-reward">
              {placed ? "Acquis au test de niveau" : isAuthenticated && completed ? "Récompense reçue" : `${entry.rewardXp} XP et ${entry.rewardGold} or ${isAuthenticated ? "à la validation" : "avec un compte"}`}
            </p>
          </div>
          <div className="eq-mission-note">
            <span>{note}</span>
            <span className="flex flex-wrap gap-2">
              {practiceHref ? (
                <Link href={practiceHref} className="eq-btn eq-btn-ghost eq-btn-sm">
                  S&apos;entraîner sur la notion
                </Link>
              ) : null}
              {completed && nextEntry ? (
                <Link href={`/cours/${nextEntry.courseId}`} className="eq-btn eq-btn-gold eq-btn-sm">
                  Mission suivante
                </Link>
              ) : null}
              <Link href="/tous-les-cours/parcours" className="eq-btn eq-btn-ghost eq-btn-sm">
                Voir la carte
              </Link>
            </span>
          </div>
        </ResponsiveDetails>
      </div>
    </div>
  );
}
