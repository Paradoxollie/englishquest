"use client";

import { useEffect, useState } from "react";
import { openAtlasQuiz } from "@/app/quest/atlas/actions";
import type { GameAnswer, QuizForm, QuizSubmission } from "@/lib/adventure/activities";

export type QuizDraft = { ticket?: string; answers: GameAnswer[] };

export function PassageQuiz({ id, draft, update, submit, busy, retryIds }: { id: number; draft: QuizDraft;
  update: (draft: QuizDraft) => void; submit: (submission: QuizSubmission) => void; busy: boolean; retryIds?: string[] }) {
  const [initial] = useState(draft);
  const [form, setForm] = useState<QuizForm | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    openAtlasQuiz(id, initial.ticket).then(result => {
      if (!active) return;
      setForm(result); setError(false);
      if (result.ticket !== initial.ticket) update({ ticket: result.ticket, answers: [] });
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt, id, initial, update]);
  if (error) return <p role="status">Le carnet n’a pas pu s’ouvrir. <button className="atlas-link" onClick={() => setAttempt(n => n + 1)}>Réessayer</button></p>;
  if (!form) return <p role="status">Ouverture du carnet…</p>;
  return <form className="atlas-final-test" onSubmit={e => { e.preventDefault(); submit({ ticket: form.ticket, answers: draft.answers }); }}>
    {form.questions.map((q, i) => <fieldset key={q.id} disabled={busy}>
      <legend>{i + 1}. {q.prompt}</legend>
      {retryIds?.includes(q.id) && <small>Cette réponse est à revoir.</small>}
      <div className="atlas-choices">{q.options.map((option, j) => <label key={option} className="atlas-answer">
        <input type="radio" name={`quiz-${q.id}`} value={option} checked={draft.answers.some(a => a.id === q.id && a.value === option)}
          onChange={() => update({ ticket: form.ticket, answers: [...draft.answers.filter(a => a.id !== q.id), { id: q.id, value: option }] })} />
        <span className="atlas-letter" aria-hidden="true">{String.fromCharCode(65 + j)}</span><span>{option}</span>
      </label>)}</div>
    </fieldset>)}
    <button type="submit" className="atlas-cta" disabled={busy || !form.questions.every(q => draft.answers.some(a => a.id === q.id))}>
      {busy ? "Vérification…" : "Valider mon carnet"}
    </button>
  </form>;
}
