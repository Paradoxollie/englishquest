"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PLACEMENT_TOKEN_STORAGE_KEY } from "@/lib/placement/placement-storage";
import type { PlacementStep } from "@/lib/placement/placement";
import { restartPlacementAction, submitPlacementStepAction, type PlacementStepResult } from "./actions";

type Phase = "intro" | "question" | "stepResult" | "done";

export function PlacementTest({
  firstStep,
  compact = false,
  guest = false,
}: {
  firstStep: PlacementStep;
  compact?: boolean;
  /** Visiteur sans compte : le résultat est gardé dans le navigateur jusqu'à l'inscription. */
  guest?: boolean;
}) {
  const [step, setStep] = useState<PlacementStep>(firstStep);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<PlacementStepResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [passedChapters, setPassedChapters] = useState<number[]>([]);

  const question = step.questions[index];

  const begin = () => {
    setPhase("question");
    setIndex(0);
    setAnswers({});
    setSelected(null);
    setError(null);
  };

  const confirm = () => {
    if (selected === null || !question) return;
    const nextAnswers = { ...answers, [question.id]: selected };
    setAnswers(nextAnswers);
    setSelected(null);
    if (index + 1 < step.questions.length) {
      setIndex(index + 1);
      return;
    }
    startTransition(async () => {
      const outcome = await submitPlacementStepAction(step.chapter, nextAnswers);
      if ("error" in outcome) {
        setError(outcome.error);
        return;
      }
      setResult(outcome);
      if (outcome.guestToken) {
        try {
          window.localStorage.setItem(PLACEMENT_TOKEN_STORAGE_KEY, outcome.guestToken);
        } catch {
          // Stockage indisponible (navigation privée) : le résultat s'affiche quand même.
        }
      }
      if (outcome.passed) {
        setPassedChapters((list) => [...list, step.chapter]);
      }
      setPhase(outcome.placed ? "done" : "stepResult");
    });
  };

  const continueToNext = () => {
    if (result?.next) {
      setStep(result.next);
      setResult(null);
      begin();
    }
  };

  const restart = () => {
    startTransition(async () => {
      const fresh = await restartPlacementAction();
      if (fresh) {
        setStep(fresh);
        setResult(null);
        setPassedChapters([]);
        begin();
      }
    });
  };

  if (phase === "intro") {
    return (
      <div className={compact ? "" : "eq-card"}>
        {!compact ? (
          <>
            <p className="eq-kicker">Chapitre {step.chapter} · {step.level}</p>
            <h2 className="eq-h2">On commence par {step.chapterName}</h2>
            <p className="mt-2 text-[var(--muted)]">
              Réponds sans chercher : le but est de trouver le bon point de départ, pas d&apos;avoir tout juste.
            </p>
          </>
        ) : null}
        <button type="button" className="eq-btn eq-btn-gold eq-btn-lg mt-4" onClick={begin} data-testid="placement-start">
          {compact ? "Repasser le test" : "Lancer le test"}
        </button>
      </div>
    );
  }

  if (phase === "done" && result?.placed && guest) {
    const placed = result.placed;
    return (
      <div className="eq-card eq-pop" data-testid="placement-done">
        <p className="eq-kicker">Résultat</p>
        <h2 className="eq-h2">
          Ton point de départ : chapitre {placed.chapterId}, {placed.chapterName} ({placed.level})
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          {passedChapters.length > 0
            ? `Chapitre${passedChapters.length > 1 ? "s" : ""} ${passedChapters.join(", ")} déjà acquis. `
            : "Le chapitre 1 pose les bases dont tout le reste dépend. "}
          Dernière série : {result.correct} sur {result.total}. Crée ton compte : ta carte s&apos;ouvrira directement à ce
          chapitre, et chaque mission validée te rapportera de l&apos;expérience et de l&apos;or.
        </p>
        <div className="eq-home-actions mt-5">
          <Link href="/auth/signup" className="eq-btn eq-btn-gold">
            Créer mon compte et garder ce résultat
          </Link>
          <Link href={`/cours/${placed.firstCourseId}`} className="eq-btn eq-btn-ghost">
            Lire le premier cours
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "done" && result?.placed) {
    const placed = result.placed;
    return (
      <div className="eq-card eq-pop" data-testid="placement-done">
        <p className="eq-kicker">Résultat</p>
        <h2 className="eq-h2">Tu commences au chapitre {placed.chapterId} : {placed.chapterName}</h2>
        <p className="mt-2 text-[var(--muted)]">
          {passedChapters.length > 0
            ? `Chapitre${passedChapters.length > 1 ? "s" : ""} ${passedChapters.join(", ")} acquis d'office : ${passedChapters.length * 10} missions marquées validées sur la carte, sans récompense (tu les connaissais déjà).`
            : "Le chapitre 1 pose les bases dont tout le reste dépend. On y va dans l'ordre."}{" "}
          Dernière série : {result.correct} sur {result.total}.
        </p>
        <div className="eq-home-actions mt-5">
          <Link href={`/cours/${placed.firstCourseId}`} className="eq-btn eq-btn-gold">
            Ouvrir la première mission
          </Link>
          <Link href="/quest" className="eq-btn eq-btn-ghost">
            Voir la carte
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "stepResult" && result) {
    return (
      <div className="eq-card eq-pop" data-testid="placement-step">
        <p className="eq-kicker">Chapitre {step.chapter} acquis</p>
        <h2 className="eq-h2">
          {result.correct} sur {result.total}
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          On monte d&apos;un cran : chapitre {step.chapter + 1}, {result.next?.chapterName} ({result.next?.level}).
        </p>
        <div className="eq-home-actions mt-5">
          <button type="button" className="eq-btn eq-btn-gold" onClick={continueToNext} data-testid="placement-next">
            Continuer
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="eq-card" data-testid="placement-question">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eq-kicker">
          Chapitre {step.chapter} · {step.chapterName}
        </p>
        <span className="eq-chip eq-chip-muted">
          Question {index + 1} / {step.questions.length}
        </span>
      </div>
      <span className="eq-bar eq-bar-cyan mt-3" aria-hidden="true">
        <i style={{ width: `${(index / step.questions.length) * 100}%` }} />
      </span>

      <p className="eq-game-prompt-sub mt-5 text-[1.05rem] text-[var(--fg)]">{question.question}</p>

      <div className="eq-game-choices" role="radiogroup" aria-label="Réponses">
        {question.options.map((option, optionIndex) => (
          <button
            key={`${question.id}-${optionIndex}`}
            type="button"
            role="radio"
            aria-checked={selected === optionIndex}
            className={`eq-game-choice ${selected === optionIndex ? "is-selected" : ""}`}
            onClick={() => setSelected(optionIndex)}
            disabled={pending}
          >
            <kbd>{String.fromCharCode(65 + optionIndex)}</kbd>
            <span>{option}</span>
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="eq-game-feedback is-wrong">
          {error}
        </p>
      ) : null}

      <div className="eq-game-actions">
        <button
          type="button"
          className="eq-btn eq-btn-gold"
          onClick={confirm}
          disabled={selected === null || pending}
          data-testid="placement-confirm"
        >
          {pending ? "Correction…" : index + 1 === step.questions.length ? "Terminer la série" : "Valider"}
        </button>
        {compact ? (
          <button type="button" className="eq-btn eq-btn-ghost" onClick={restart} disabled={pending}>
            Recommencer
          </button>
        ) : null}
      </div>
    </div>
  );
}
