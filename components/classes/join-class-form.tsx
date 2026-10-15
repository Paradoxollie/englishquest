"use client";

import Link from "next/link";
import { useState } from "react";
import { joinClass } from "@/lib/classes/classes-server";
import { ActionFeedback, useClassAction } from "./use-class-action";

type JoinClassFormProps = {
  initialCode?: string;
  /** Liens affichés après l'inscription (page /rejoindre). */
  showNextSteps?: boolean;
};

export function JoinClassForm({ initialCode = "", showNextSteps = false }: JoinClassFormProps) {
  const [code, setCode] = useState(initialCode);
  const [joined, setJoined] = useState(false);
  const { pending, result, run } = useClassAction("La connexion a échoué. Réessaie.");

  return (
    <form
      className="eq-class-form eq-class-join-form"
      onSubmit={(event) => {
        event.preventDefault();
        run(
          () => joinClass(code),
          () => {
            setCode("");
            setJoined(true);
          }
        );
      }}
    >
      <label className="eq-class-field">
        <span>Code de la classe</span>
        <div className="eq-class-join-row">
          <input
            type="text"
            name="code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              setJoined(false);
            }}
            maxLength={9}
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            placeholder="6 caractères"
            className="eq-class-input eq-class-code-input"
          />
          <button type="submit" className="eq-btn eq-btn-primary" disabled={pending || code.trim().length === 0}>
            {pending ? "Un instant…" : "Rejoindre"}
          </button>
        </div>
      </label>
      <ActionFeedback result={result} />
      {showNextSteps && joined ? (
        <div className="eq-home-actions">
          <Link href="/home" className="eq-btn eq-btn-gold">
            Voir mes devoirs
          </Link>
          <Link href="/profile#classe" className="eq-btn eq-btn-ghost">
            Mes classes
          </Link>
        </div>
      ) : null}
    </form>
  );
}
