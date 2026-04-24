"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, authInitialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-300">Pseudonym</span>
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          placeholder="ShadowFox"
          className="comic-panel w-full border-2 border-black bg-slate-900/80 px-4 py-3 font-semibold text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-300">
          Email <span className="text-slate-500">(optional, for password resets)</span>
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="comic-panel w-full border-2 border-black bg-slate-900/80 px-4 py-3 font-semibold text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-300">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="********"
          className="comic-panel w-full border-2 border-black bg-slate-900/80 px-4 py-3 font-semibold text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-950/40 px-4 py-3 text-sm font-semibold text-rose-300">
          {state.error}
        </p>
      ) : state.success ? (
        <p className="rounded-2xl border border-emerald-400/20 bg-emerald-950/40 px-4 py-3 text-sm font-semibold text-emerald-300">
          {state.success}
        </p>
      ) : null}

      <SubmitButton label="Creer mon compte" />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="comic-button w-full bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creation..." : label}
    </button>
  );
}
