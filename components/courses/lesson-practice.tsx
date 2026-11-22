"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LessonPrompt } from "@/lib/courses/lesson-prompts";

export function LessonPractice({ prompt, course, gameHref, reader }: { prompt: LessonPrompt; course: number; gameHref: string | null; reader: string }) {
  const field = useRef<HTMLTextAreaElement>(null);
  const draftKey = `eq-course-practice-${reader}-${course}`;
  const [compare, setCompare] = useState(false);
  useEffect(() => {
    try { if (field.current) field.current.value = sessionStorage.getItem(draftKey) ?? ""; } catch { /* Writing still works with storage disabled. */ }
  }, [draftKey]);
  function keepAttempt(value: string) {
    try {
      if (value) sessionStorage.setItem(draftKey, value);
      else sessionStorage.removeItem(draftKey);
    } catch { /* The learner can still compare the text on screen. */ }
  }
  return <section className="eq-lesson-practice" id="entrainement" aria-labelledby="titre-entrainement">
    <h2 id="titre-entrainement"><small>Partie 2</small> À toi de jouer</h2>
    <p>{prompt.situation}</p>
    <label>Ta proposition en anglais
      <textarea ref={field} lang="en" rows={2} maxLength={600} spellCheck={false}
        onChange={e => keepAttempt(e.target.value)} />
    </label>
    <button className="eq-btn eq-btn-ghost eq-btn-sm" type="button" aria-expanded={compare} aria-controls="modele-entrainement"
      onClick={() => setCompare(!compare)}>{compare ? "Masquer l’exemple" : "Comparer avec un exemple"}</button>
    <div id="modele-entrainement" hidden={!compare}>
      <p lang="en">{prompt.answer}</p><p>{prompt.explanation}</p>
      {course === 48 && <Link href="/cours/13">Revoir used to et be used to</Link>}
    </div>
    {gameHref && <p><Link href={gameHref}>Jouer à Grammar Rush avec cette notion →</Link></p>}
  </section>;
}
