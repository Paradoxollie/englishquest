"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordResetAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--ink)] px-4 py-3 text-[0.95rem] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--cyan)]";

export function ForgotPasswordForm({ expiredLink = false }: { expiredLink?: boolean }) {
  const [state, formAction] = useActionState(requestPasswordResetAction, authInitialState);

  return (
    <form action={formAction} className="grid gap-4">
      {expiredLink ? (
        <p role="alert" className="rounded-[var(--radius)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-bold text-[var(--coral)]">
          Ce lien n&apos;est plus valide. Demande-en un nouveau ci-dessous.
        </p>
      ) : null}

      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Pseudo ou e-mail</span>
        <input type="text" name="login" autoComplete="username" required placeholder="renardgris ou toi@exemple.fr" className={inputClass} />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-[var(--radius)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-bold text-[var(--coral)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="rounded-[var(--radius)] bg-[var(--mint-soft)] px-4 py-3 text-sm font-bold text-[var(--mint)]">
          {state.success}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-center text-xs text-[var(--muted)]">
        Un compte créé sans adresse e-mail ne peut pas recevoir de lien : dans ce cas, passe par la page Contact.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="eq-btn eq-btn-primary eq-btn-lg w-full">
      {pending ? "Envoi…" : "Envoyer le lien"}
    </button>
  );
}
