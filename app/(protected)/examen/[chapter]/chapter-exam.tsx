"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ExamQuestion } from "@/lib/exams/exams";
import { submitChapterExamAction, type ExamResult } from "./actions";

export function ChapterExam({
  chapter,
  chapterName,
  questions,
  alreadyPassed,
}: {
  chapter: number;
  chapterName: string;
  questions: ExamQuestion[];
  alreadyPassed: boolean;
}) {
  const [phase, setPhase] = useState<"intro" | "question" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const question = questions[index];

  const begin = () => {
    setPhase("question");
    setIndex(0);
    setAnswers({});
    setSelected(null);
    setResult(null);
    setError(null);
  };

  const confirm = () => {
    if (selected === null || !question) return;
    const next = { ...answers, [question.id]: selected };
    setAnswers(next);
    setSelected(null);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }
    startTransition(async () => {
      const outcome = await submitChapterExamAction(chapter, next);
      if ("error" in outcome) {
        setError(outcome.error);
        return;
      }
      setResult(outcome);
      setPhase("done");
    });
  };

  if (phase === "intro") {
    return (
      <div className="eq-card">
        <p className="eq-kicker">{questions.length} questions</p>
        <h2 className="eq-h2">{alreadyPassed ? "Repasser l'examen" : "Prêt ?"}</h2>
        <p className="mt-2 text-[var(--muted)]">
          Une question à la fois, pas de retour en arrière. Les corrections s&apos;affichent à la fin.
        </p>
        <button type="button" className="eq-btn eq-btn-gold eq-btn-lg mt-4" onClick={begin} data-testid="exam-start">
          Commencer
        </button>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="eq-card eq-pop" data-testid="exam-done">
        <p className="eq-kicker">{result.passed ? "Examen réussi" : "Pas cette fois"}</p>
        <h2 className="eq-h2">
          {result.correct} sur {result.total}
        </h2>
        {result.firstPass ? (
          <div className="eq-game-rewards mt-3">
            <div>
              <small>Expérience</small>
              <b className="eq-num">+ {result.rewards.xp} XP</b>
            </div>
            <div>
              <small>Or</small>
              <b className="eq-num">+ {result.rewards.gold}</b>
            </div>
            {result.newLevel ? <p className="eq-chip eq-chip-mint">Niveau {result.newLevel} atteint</p> : null}
          </div>
        ) : (
          <p className="mt-2 text-[var(--muted)]">
            {result.passed
              ? "Déjà réussi auparavant : pas de nouvelle récompense, mais le score est noté."
              : `Il faut 12 bonnes réponses. Relis les cours des questions manquées et reviens : ${chapterName} n'est pas loin.`}
          </p>
        )}
        {!result.saved ? <p className="eq-game-end-note is-error">Le résultat n&apos;a pas pu être enregistré.</p> : null}

        {result.corrections.length > 0 ? (
          <div className="mt-5">
            <p className="eq-kicker">À revoir</p>
            <ul className="eq-game-review">
              {result.corrections.map((item) => (
                <li key={item.id} className="is-hard">
                  <div>
                    <b>{item.question}</b>
                  </div>
                  <span>{item.answer}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="eq-home-actions mt-5">
          <button type="button" className="eq-btn eq-btn-primary" onClick={() => window.location.reload()}>
            Repasser
          </button>
          <Link href="/quest" className="eq-btn eq-btn-ghost">
            Voir la carte
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="eq-card" data-testid="exam-question">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eq-kicker">{chapterName}</p>
        <span className="eq-chip eq-chip-muted">
          Question {index + 1} / {questions.length}
        </span>
      </div>
      <span className="eq-bar eq-bar-cyan mt-3" aria-hidden="true">
        <i style={{ width: `${(index / questions.length) * 100}%` }} />
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
        <button type="button" className="eq-btn eq-btn-gold" onClick={confirm} disabled={selected === null || pending} data-testid="exam-confirm">
          {pending ? "Correction…" : index + 1 === questions.length ? "Terminer" : "Valider"}
        </button>
      </div>
    </div>
  );
}
