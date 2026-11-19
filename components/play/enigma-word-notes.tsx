"use client";

import { useId, useState } from "react";
import { getEnigmaExample } from "@/lib/games/enigma-examples";

export function EnigmaWordNotes({ word, french, saved, onSave }: {
  word: string;
  french: string | null;
  saved: string;
  onSave: (draft: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const clean = draft.trim();
  const example = getEnigmaExample(word);

  if (!editing) return (
    <div className="grid gap-2">
      {saved && <p lang="en">{saved}</p>}
      <button type="button" className="eq-btn eq-btn-ghost justify-self-start"
        onClick={() => { setDraft(saved); setMessage(""); setEditing(true); }}>{saved ? "Modifier ma phrase" : "Utiliser ce mot dans une phrase"}</button>
    </div>
  );

  return (
    <form className="eq-game-fields" onSubmit={event => {
      event.preventDefault();
      const words: string[] = clean.toLowerCase().match(/[a-z]+/g) ?? [];
      if (!words.includes(word.toLowerCase()) || words.length < 2) {
        setMessage(`Pour cet essai, garde « ${word.toLowerCase()} » tel quel et ajoute au moins un autre mot.`);
        return;
      }
      onSave(clean);
      setEditing(false);
    }}>
      <label className="eq-game-field" htmlFor={id}>
        <span>Décris une petite scène. Garde la forme <b lang="en">{word.toLowerCase()}</b>{french && <> (« {french} »)</>} dans ta phrase.</span>
        <input id={id} className="eq-input" maxLength={260} value={draft} onChange={event => { setDraft(event.target.value); setMessage(""); }}
          placeholder="Ma phrase en anglais" lang="en" autoFocus data-testid="enigma-sentence"
          aria-invalid={Boolean(message)} aria-describedby={message ? id + "-message" : undefined} />
      </label>
      {message && <p className="eq-game-feedback" role="status" id={id + "-message"}>{message}</p>}
      {example && <details><summary>Lire un exemple</summary><p lang="en">{example}</p></details>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="eq-btn eq-btn-gold" disabled={!clean}>Garder dans le bilan</button>
        <button type="button" className="eq-btn eq-btn-ghost" onClick={() => { setDraft(saved); setEditing(false); }}>Annuler</button>
      </div>
    </form>
  );
}
