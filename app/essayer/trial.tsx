"use client";

import Link from "next/link";
import { useState } from "react";
import { normalizeAnswer } from "@/lib/courses/exercise-check";
import styles from "./trial.module.css";

export type Trial = {
  instructions: string;
  prompt: string;
  englishPrompt?: boolean;
  choices?: readonly string[];
  answers: string[];
  audio?: { url: string; transcript: string };
  hint: string;
  explanation: string;
  nextLabel: string;
  nextUrl: string;
};

export function TrialQuestion({ trial }: { trial: Trial }) {
  const [input, setInput] = useState("");
  const [lastAnswer, setLastAnswer] = useState<string>();
  const [revealed, setRevealed] = useState(false);
  const correct = lastAnswer !== undefined && trial.answers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(lastAnswer));
  const done = correct || revealed;

  return (
    <>
      <p className={styles.instruction}>{trial.instructions}</p>
      {trial.audio && (
        <div className={styles.recording}>
          <audio controls preload="metadata" aria-label="Annonce en anglais pour le train de Brighton" src={trial.audio.url} />
          <details>
            <summary>Lire la transcription</summary>
            <p lang="en">{trial.audio.transcript}</p>
          </details>
        </div>
      )}
      <p className={styles.prompt} id="trial-prompt" lang={trial.englishPrompt ? "en" : "fr"}>{trial.prompt}</p>
      {trial.choices ? (
        <div className={styles.choices} role="group" aria-labelledby="trial-prompt">
          {trial.choices.map((choice) => (
            <button key={choice} type="button" disabled={done} lang={trial.englishPrompt ? "en" : "fr"}
              data-answer={done && trial.answers.includes(choice) ? "correct" : lastAnswer === choice ? "wrong" : undefined}
              onClick={() => setLastAnswer(choice)}>
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <form className={styles.entry} onSubmit={(event) => { event.preventDefault(); if (input.trim()) setLastAnswer(input.trim()); }}>
          <label htmlFor="trial-input">Ta réponse en anglais</label>
          <div>
            <input id="trial-input" value={input} onChange={(event) => setInput(event.target.value)} disabled={done}
              autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={60} enterKeyHint="done" />
            <button type="submit" className="eq-btn eq-btn-primary" disabled={done || !input.trim()}>Vérifier</button>
          </div>
        </form>
      )}
      <div aria-live="polite" aria-atomic="true">
        {lastAnswer !== undefined && (
          <div className={styles.feedback} data-done={done}>
            <strong>{correct ? "Bien joué !" : revealed ? `La réponse est « ${trial.answers[0]} ».` : "Essaie encore."}</strong>{" "}
            {done ? trial.explanation : trial.hint}
            {!done && <button type="button" className="eq-text-link" onClick={() => setRevealed(true)}>Voir la solution</button>}
          </div>
        )}
      </div>
      <Link href={trial.nextUrl} className={`eq-text-link ${styles.continue}`}>{trial.nextLabel}<span aria-hidden="true"> →</span></Link>
    </>
  );
}

export function CopyTrialLink({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  }
  return (
    <div className={styles.share}>
      <button type="button" className="eq-btn eq-btn-ghost" onClick={copy}>Copier le lien du défi</button>
      <span role="status">{status === "copied" ? "Lien copié." : ""}</span>
      {status === "manual" && (
        <label>Lien à copier <input readOnly value={url} onFocus={(event) => event.target.select()} /></label>
      )}
    </div>
  );
}
