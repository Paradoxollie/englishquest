"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { PLACEMENT_TOKEN_STORAGE_KEY } from "@/lib/placement/placement-storage";
import { useFormStatus } from "react-dom";
import { signUpAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--ink)] px-4 py-3 text-[0.95rem] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--cyan)]";

export function SignupForm({ next = null }: { next?: string | null }) {
  const [state, formAction] = useActionState(signUpAction, authInitialState);
  // Résultat du test de niveau passé sans compte, à appliquer à la nouvelle carte.
  const [placementToken, setPlacementToken] = useState("");

  useEffect(() => {
    let stored = "";
    try {
      stored = window.localStorage.getItem(PLACEMENT_TOKEN_STORAGE_KEY) ?? "";
    } catch {
      stored = "";
    }
    const timer = window.setTimeout(() => setPlacementToken(stored), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!state.success) return;
    try {
      window.localStorage.removeItem(PLACEMENT_TOKEN_STORAGE_KEY);
    } catch {
      // rien à nettoyer
    }
  }, [state.success]);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="placement" value={placementToken} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {placementToken ? (
        <p className="rounded-[var(--radius)] bg-[var(--cyan-soft)] px-4 py-3 text-sm">
          Ton résultat au test de niveau sera appliqué à ta carte dès la création du compte.
        </p>
      ) : null}
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Pseudo</span>
        <input
          id="signup-username"
          type="text"
          name="username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={50}
          placeholder="renardgris"
          className={inputClass}
        />
        <span className="text-xs text-[var(--muted)]">
          Lettres, chiffres et tirets bas. Pas ton vrai nom : c&apos;est ce pseudo que les autres joueurs verront dans
          les classements.
        </span>
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-bold">
          E-mail <span className="font-normal text-[var(--muted)]">(facultatif)</span>
        </span>
        <input
          id="signup-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="toi@exemple.fr"
          className={inputClass}
        />
        <span className="text-xs text-[var(--muted)]">
          Sert uniquement à récupérer ton compte si tu oublies ton mot de passe.
        </span>
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Mot de passe</span>
        <input
          id="signup-password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="8 caractères minimum"
          className={inputClass}
        />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-[var(--radius)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-bold text-[var(--coral)]">
          {state.error}
        </p>
      ) : state.success ? (
        <p role="status" className="rounded-[var(--radius)] bg-[var(--mint-soft)] px-4 py-3 text-sm font-bold text-[var(--mint)]">
          {state.success}
          {next ? (
            <>
              {" "}
              <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="underline">
                Se connecter et continuer
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="eq-btn eq-btn-gold eq-btn-lg w-full">
      {pending ? "Création du compte…" : "Créer mon compte"}
    </button>
  );
}
