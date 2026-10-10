"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteOwnAccountAction, type DeleteAccountState } from "./account-actions";

const initial: DeleteAccountState = {};

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteOwnAccountAction, initial);

  if (!open) {
    return (
      <button type="button" className="eq-btn eq-btn-ghost" onClick={() => setOpen(true)}>
        Supprimer mon compte
      </button>
    );
  }

  return (
    <form action={formAction} className="eq-inset grid gap-3" aria-label="Suppression du compte">
      <p className="text-sm">
        <b>Cette action est définitive.</b> Scores, progression sur la carte, objets achetés et pseudo seront effacés.
        Pour confirmer, écris <code>SUPPRIMER</code> ci-dessous.
      </p>
      <input
        type="text"
        name="confirmation"
        autoComplete="off"
        placeholder="SUPPRIMER"
        className="w-full rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--ink)] px-4 py-3 text-[0.95rem] text-[var(--fg)] outline-none focus:border-[var(--coral)]"
      />
      {state.error ? (
        <p role="alert" className="text-sm font-bold text-[var(--coral)]">
          {state.error}
        </p>
      ) : null}
      <div className="eq-home-actions">
        <SubmitButton />
        <button type="button" className="eq-btn eq-btn-ghost" onClick={() => setOpen(false)}>
          Annuler
        </button>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="eq-btn eq-btn-danger">
      {pending ? "Suppression…" : "Supprimer définitivement"}
    </button>
  );
}
