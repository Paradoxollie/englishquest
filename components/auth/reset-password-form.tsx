"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updatePasswordAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--ink)] px-4 py-3 text-[0.95rem] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--cyan)]";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, authInitialState);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Nouveau mot de passe</span>
        <input type="password" name="password" autoComplete="new-password" required minLength={8} className={inputClass} />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Confirme-le</span>
        <input type="password" name="confirm" autoComplete="new-password" required minLength={8} className={inputClass} />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-[var(--radius)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-bold text-[var(--coral)]">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="eq-btn eq-btn-primary eq-btn-lg w-full">
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}
