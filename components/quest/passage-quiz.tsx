"use client";

import { useEffect, useState } from "react";
import { openAtlasQuiz } from "@/app/quest/atlas/actions";
import type { GameAnswer, QuizForm, QuizSubmission } from "@/lib/adventure/activities";

export type QuizDraft = { ticket?: string; answers: GameAnswer[]; page?: number; retryIds?: string[] };

export function PassageQuiz({ id, draft, update, submit, busy }: { id: number; draft: QuizDraft;
  update: (draft: QuizDraft) => void; submit: (submission: QuizSubmission) => void; busy: boolean }) {
  const [initial] = useState(draft);
  const [form, setForm] = useState<QuizForm | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    openAtlasQuiz(id, initial.ticket).then(result => {
      if (!active) return;
      setForm(result); setError(false);
      if (result.ticket !== initial.ticket) update({ ticket: result.ticket, answers: [], page: 0 });
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt, id, initial, update]);
  if (error) return <p role="status">Le carnet n’a pas pu s’ouvrir. <button className="atlas-link" onClick={() => setAttempt(n => n + 1)}>Réessayer</button></p>;
  if (!form) return <p role="status">Ouverture du carnet…</p>;
  const retry = form.questions.filter(q => draft.retryIds?.includes(q.id));
  const questions = retry.length ? retry : form.questions;
  const page = Math.max(0, Math.min(questions.length - 1, draft.page ?? 0));
  const q = questions[page];
  const last = page === questions.length - 1;
  const selected = draft.answers.find(a => a.id === q.id)?.value;
  return <form className="atlas-final-test" onSubmit={e => {
    e.preventDefault();
    if (!selected || busy) return;
    if (last) submit({ ticket: form.ticket, answers: draft.answers });
    else update({ ...draft, page: page + 1 });
  }}>
    <fieldset key={q.id} disabled={busy}><legend><small>{retry.length ? "À revoir" : "Question"} · {page + 1} / {questions.length}</small>{q.prompt}</legend>
      <div className="atlas-choices">{q.options.map((option, j) => <label key={option} className="atlas-answer">
        <input type="radio" name={`quiz-${q.id}`} value={option} checked={selected === option}
          onChange={() => update({ ...draft, ticket: form.ticket, answers: [...draft.answers.filter(a => a.id !== q.id), { id: q.id, value: option }] })} />
        <span className="atlas-letter" aria-hidden="true">{String.fromCharCode(65 + j)}</span><span>{option}</span>
      </label>)}</div>
    </fieldset>
    <div className="comic-form-actions">
      {page > 0 && <button type="button" className="comic-back" aria-label="Question précédente" disabled={busy} onClick={() => update({ ...draft, page: page - 1 })}>←</button>}
      <button type="submit" className="atlas-cta" disabled={!selected || busy}>{busy ? "Vérification…" : last ? "Valider mon carnet" : "Question suivante →"}</button>
    </div>
  </form>;
}
