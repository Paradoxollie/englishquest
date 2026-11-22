"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { PlacementStep } from "@/lib/placement/placement";
import { confirmGuestPlacementAction, restartPlacementAction, submitPlacementStepAction, type PlacementStepResult } from "./actions";

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
  const [stepToken, setStepToken] = useState<string>();
  const [kept, setKept] = useState(false);

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
      const outcome = await submitPlacementStepAction(step.chapter, nextAnswers, stepToken).catch(() => null);
      if (!outcome) {
        setError("Le résultat n’a pas pu être enregistré. Réessaie cette réponse.");
        return;
      }
      if ("error" in outcome) {
        setError(outcome.error);
        return;
      }
      setResult(outcome);
      setStepToken(outcome.nextToken);
      if (outcome.guestToken && outcome.placed) {
        setKept(await confirmGuestPlacementAction(outcome.placed.chapterId).catch(() => false));
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
        setStepToken(undefined);
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
          {result.retainedHigherChapter ? "Ta carte conserve le chapitre atteint lors de ton précédent test. " : passedChapters.length > 0
            ? `Chapitre${passedChapters.length > 1 ? "s" : ""} ${passedChapters.join(", ")} déjà acquis. `
            : "Le chapitre 1 pose les bases dont tout le reste dépend. "}
          Dernière série : {result.correct} sur {result.total}. {kept
            ? "Ta carte et la bibliothèque gardent ce point de départ sur cet appareil."
            : "La sauvegarde sur cet appareil est indisponible. Tu peux ouvrir le cours conseillé ci-dessous."}
        </p>
        <div className="eq-home-actions mt-5">
          <Link href={`/cours/${placed.firstCourseId}`} className="eq-btn eq-btn-gold">
            Ouvrir le cours {placed.firstCourseId}
          </Link>
          {kept ? <Link href="/tous-les-cours/parcours" className="eq-btn eq-btn-ghost">Voir ma carte</Link> : null}
          <Link href="/auth/signup?next=/tous-les-cours/parcours" className="eq-text-link">{kept ? "Garder mon résultat avec un compte" : "Créer un compte"}</Link>
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
          {result.retainedHigherChapter ? "Ta carte conserve le chapitre atteint lors de ton précédent test." : passedChapters.length > 0
            ? `Chapitre${passedChapters.length > 1 ? "s" : ""} ${passedChapters.join(", ")} acquis d'office : ${passedChapters.length * 10} missions marquées validées sur la carte, sans récompense (tu les connaissais déjà).`
            : "Le chapitre 1 pose les bases dont tout le reste dépend. On y va dans l'ordre."}{" "}
          Dernière série : {result.correct} sur {result.total}.
        </p>
        <div className="eq-home-actions mt-5">
          <Link href={`/cours/${placed.firstCourseId}`} className="eq-btn eq-btn-gold">
            Ouvrir la première mission
          </Link>
          <Link href="/tous-les-cours/parcours" className="eq-btn eq-btn-ghost">
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
        {compact || error ? (
          <button type="button" className="eq-btn eq-btn-ghost" onClick={restart} disabled={pending}>
            Recommencer
          </button>
        ) : null}
      </div>
    </div>
  );
}
