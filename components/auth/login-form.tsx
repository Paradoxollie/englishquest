"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--ink)] px-4 py-3 text-[0.95rem] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--cyan)]";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, authInitialState);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Pseudo ou e-mail</span>
        <input
          id="login-identifier"
          type="text"
          name="login"
          autoComplete="username"
          required
          placeholder="renardgris ou toi@exemple.fr"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Mot de passe</span>
        <input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="Ton mot de passe"
          className={inputClass}
        />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-[var(--radius)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-bold text-[var(--coral)]">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-center text-sm">
        <Link href="/auth/forgot" className="font-bold text-[var(--cyan)]">
          Mot de passe oublié ?
        </Link>
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="eq-btn eq-btn-primary eq-btn-lg w-full">
      {pending ? "Connexion…" : "Se connecter"}
    </button>
  );
}
