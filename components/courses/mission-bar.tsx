"use client";

import Link from "next/link";
import { useCourseMission } from "@/components/courses/course-mission-provider";
import type { CourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

type MissionBarProps = {
  entry: CourseRoadmapEntry;
  mission: CourseMissionPlan;
  chapterLabel: string;
  nextEntry: CourseRoadmapEntry | null;
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

export function MissionBar({ entry, mission, chapterLabel, nextEntry }: MissionBarProps) {
  const context = useCourseMission();
  const isAuthenticated = context?.isAuthenticated ?? false;
  const tracking = context?.isMissionTrackingEnabled ?? false;
  const state = context?.missionState ?? null;
  const completed = entry.status === "completed";

  const readingDone = completed || Boolean(state?.readingCheckpointReached);
  const quizDone = completed || Boolean(state?.quizPassed);
  const gameDone = completed || Boolean(state?.gameChallengeReached) || !mission.primaryGameSlug;

  const readingState: StepState = readingDone ? "done" : "now";
  const quizState: StepState = quizDone ? "done" : readingDone ? "now" : "todo";
  const gameState: StepState = gameDone ? "done" : quizDone ? "now" : "todo";

  const quizLabel =
    state?.quizScore != null && state.quizTotal ? `Quiz ${state.quizScore} / ${state.quizTotal}` : "Quiz à 80 %";
  const gameLabel = mission.primaryGameName
    ? `${mission.primaryGameName}, ${mission.gameChallengeCompact}`
    : "Pas de défi de jeu";

  let note: string;
  if (!isAuthenticated) {
    note = "Lecture libre. Avec un compte, ce cours devient une mission : le quiz et le défi de jeu comptent.";
  } else if (completed) {
    note = nextEntry
      ? `Mission validée. La suivante t'attend : cours ${nextEntry.courseId}.`
      : "Mission validée. C'était la dernière de la carte.";
  } else if (!tracking) {
    note = "Ce cours n'est pas ta mission en cours. Tu peux le lire et faire le quiz, sans enregistrement.";
  } else if (quizDone && !gameDone && mission.primaryGameSlug) {
    note = `Quiz réussi. Il reste le défi : ${gameLabel}.`;
  } else if (readingDone && !quizDone) {
    note = "Cours lu. Il reste le quiz : 80 % pour débloquer le défi de jeu.";
  } else {
    note = "Lis le cours jusqu'au quiz, réussis-le à 80 %, puis relève le défi de jeu.";
  }

  return (
    <div className="eq-mission-bar">
      <div className="eq-container">
        <div className="eq-mission-row">
          <p className="eq-mission-where">
            <span>{chapterLabel}</span>
            <b>Mission {entry.courseId}</b>
          </p>
          <ol className="eq-mission-steps" aria-label="Étapes de la mission">
            <Step label="Lire" state={readingState} />
            <Step label={quizLabel} state={quizState} />
            <Step label={gameLabel} state={gameState} />
          </ol>
          <p className="eq-mission-reward">
            {completed ? "Récompense reçue" : `+ ${entry.rewardXp} XP, + ${entry.rewardGold} or à la validation`}
          </p>
        </div>
        <div className="eq-mission-note">
          <span>{note}</span>
          <span className="flex flex-wrap gap-2">
            {quizDone && !gameDone && mission.primaryGameSlug ? (
              <Link href={`/play/${mission.primaryGameSlug}`} className="eq-btn eq-btn-gold eq-btn-sm">
                Lancer le défi
              </Link>
            ) : null}
            {completed && nextEntry ? (
              <Link href={`/cours/${nextEntry.courseId}`} className="eq-btn eq-btn-gold eq-btn-sm">
                Mission suivante
              </Link>
            ) : null}
            <Link href="/quest" className="eq-btn eq-btn-ghost eq-btn-sm">
              Voir la carte
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
