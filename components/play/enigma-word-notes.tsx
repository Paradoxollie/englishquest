"use client";

import { useId, useState } from "react";

const models: Record<string, string> = {
  APPLE: "I packed an apple for the walk.", BOOK: "This book belongs to my sister.",
  HOME: "We walked home together.", DOOR: "I held the door for a neighbour.",
  COLD: "My hands felt cold after the ride.", LOVE: "I love the smell of fresh bread.",
  TREE: "We sat under the tree to eat.", RAIN: "The rain started as we left the station.",
  SHOP: "The shop closes at six today.", HELP: "Could you help me carry these bags?",
  WAIT: "Please wait for me at the gate.", FISH: "I saw a fish in the stream.",
  READ: "I read a chapter before bed.", SONG: "I heard our favourite song on the radio.",
  YEAR: "Next year we hope to visit Scotland.", LAKE: "There is a small lake behind our house.",
  WANT: "I want to learn a new song.", GIFT: "We chose a gift for our neighbour.",
  WATER: "Could I have a glass of water?", HAPPY: "I feel happy when I see my friends.",
  DREAM: "My dream is to open a bakery.", HOUSE: "Our house has a bright green door.",
  BEACH: "We left the beach before sunset.", TRAIN: "We missed the last train home.",
  MUSIC: "I listen to music on the bus.", STORY: "The story ends with a surprise.",
  LIGHT: "Please turn on the light by the door.", AFTER: "We went for a walk after lunch.",
  BRING: "Please bring a jacket for the trip.", LEAVE: "What time do we leave tomorrow?",
  BRIDGE: "Meet me by the bridge at noon.", FRIEND: "My friend showed me a faster route.",
  TRAVEL: "I love to travel by train.", SCHOOL: "The school has a garden behind the gym.",
  BETTER: "The soup tastes better with lemon.", SUMMER: "We go camping every summer.",
  RARE: "It is rare to see snow here.", SCARCE: "Fresh water was scarce on the island.",
  FOSTER: "Sharing a kitchen can foster new friendships.", HINDER: "Background noise can hinder a conversation.",
  THRIVE: "These flowers thrive in the shade.", SUBTLE: "There is a subtle difference between the two shades.",
  QUIET: "The street gets quiet after dinner.", SLOW: "Take a slow breath before you begin.",
  AVOID: "We left early to avoid the traffic.", GROW: "Fresh herbs grow on our windowsill.",
  KIND: "It was kind of you to wait.", SHARE: "Can we share the last slice?",
};

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
  const example = models[word.toUpperCase()];

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
