"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, authInitialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-300">Username or email</span>
        <input
          type="text"
          name="login"
          required
          placeholder="ShadowFox or shadow@example.com"
          className="comic-panel w-full border-2 border-black bg-slate-900/80 px-4 py-3 font-semibold text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-300">Password</span>
        <input
          type="password"
          name="password"
          required
          placeholder="********"
          className="comic-panel w-full border-2 border-black bg-slate-900/80 px-4 py-3 font-semibold text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-950/40 px-4 py-3 text-sm font-semibold text-rose-300">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label="Se connecter" />
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
      {pending ? "Connexion..." : label}
    </button>
  );
}
