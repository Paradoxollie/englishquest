"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { normalizeAnswer } from "@/lib/courses/exercise-check";

export type PracticeItem = {
  id: string;
  prompt: string;
  label?: string;
  answers: string[];
  choices?: string[];
  matches?: (input: string) => boolean;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A personal recall round after a ranked game. It never starts a scoring session. */
export function MistakePractice({ items, children }: { items: PracticeItem[]; children: ReactNode }) {
  const [deck, setDeck] = useState<PracticeItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [missed, setMissed] = useState<PracticeItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstChoice = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const finishHeading = useRef<HTMLHeadingElement>(null);
  const launchButton = useRef<HTMLButtonElement>(null);
  const active = deck?.[index];

  useEffect(() => {
    if (!deck) return;
    if (!active) finishHeading.current?.focus();
    else if (outcome !== null) nextButton.current?.focus();
    else (inputRef.current ?? firstChoice.current)?.focus();
  }, [active, deck, outcome]);

  function start(source: PracticeItem[]) {
    const distinct = Array.from(new Map(source.map(item => [item.id, item])).values());
    setDeck(shuffle(distinct).map(item => ({ ...item, choices: item.choices && shuffle(item.choices) })));
    setIndex(0);
    setInput("");
    setOutcome(null);
    setMissed([]);
  }

  function check(value: string) {
    if (!active || outcome !== null || !value.trim()) return;
    const correct = active.matches
      ? active.matches(value)
      : active.answers.some(answer => normalizeAnswer(answer) === normalizeAnswer(value));
    setInput(value);
    setOutcome(correct);
    if (!correct) setMissed(current => current.some(item => item.id === active.id) ? current : [...current, active]);
  }

  function close() {
    setDeck(null);
    requestAnimationFrame(() => launchButton.current?.focus());
  }

  if (!deck) return (
    <div className="grid gap-3">
      {items.length > 0 && <button type="button" className="eq-btn eq-btn-gold justify-self-start" ref={launchButton} onClick={() => start(items)}>
        Reprendre mes erreurs
      </button>}
      {children}
    </div>
  );

  if (!active) return (
    <section className="eq-game-stage grid gap-3" aria-label="Bilan de la révision">
      <h3 className="eq-h3" ref={finishHeading} tabIndex={-1}>Révision terminée</h3>
      <p>{deck.length - missed.length} sur {deck.length} retrouvés.</p>
      <div className="flex flex-wrap gap-2">
        {missed.length > 0 && <button className="eq-btn eq-btn-gold" type="button" onClick={() => start(missed)}>Reprendre les réponses manquées</button>}
        <button type="button" className="eq-btn eq-btn-ghost" onClick={close}>Retour au bilan</button>
      </div>
    </section>
  );

  return (
    <section className="eq-game-stage grid gap-3" aria-label="Révision personnelle" data-testid="mistake-practice">
      <p className="eq-game-prompt-kicker">Révision hors classement · {index + 1} / {deck.length}</p>
      <h3 className="eq-h3" id="eq-practice-prompt">{active.prompt}</h3>
      {active.choices ? (
        <div className="eq-game-choices" role="group" aria-labelledby="eq-practice-prompt">
          {active.choices.map((choice, n) => <button type="button" ref={n === 0 ? firstChoice : undefined} className="eq-game-choice"
            key={choice} onClick={() => check(choice)} disabled={outcome !== null}>{choice}</button>)}
        </div>
      ) : (
        <form className="eq-game-fields" onSubmit={event => { event.preventDefault(); check(input); }}>
          <label className="eq-game-field">
            <span>{active.label ?? "Le mot anglais de ta partie"}</span>
            <input ref={inputRef} value={input} onChange={event => setInput(event.target.value)} disabled={outcome !== null}
              autoComplete="off" autoCapitalize="none" spellCheck={false} aria-describedby="eq-practice-prompt" />
          </label>
          {outcome === null && <button type="submit" className="eq-btn eq-btn-gold" disabled={!input.trim()}>Vérifier</button>}
        </form>
      )}
      {outcome !== null && (
        <>
          <p className={`eq-game-feedback ${outcome ? "is-right" : "is-wrong"}`} role="status">
            {outcome ? "Retrouvé ! " : "La réponse de cette manche était "} {active.answers.join(" / ")}.
          </p>
          <button type="button" className="eq-btn eq-btn-gold justify-self-start" ref={nextButton}
            onClick={() => { setIndex(index + 1); setInput(""); setOutcome(null); }}>
            {index + 1 === deck.length ? "Voir mon bilan de révision" : "Continuer la révision"}
          </button>
        </>
      )}
      <button type="button" className="eq-btn eq-btn-ghost justify-self-start" onClick={close}>Quitter la révision</button>
    </section>
  );
}
