"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, authInitialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Pseudonym</span>
        <input
          type="text"
          name="username"
          required
          placeholder="ShadowFox"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">
          Email <span className="text-slate-500">(optional, for password resets)</span>
        </span>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      {state.error ? (
        <p className="text-sm font-semibold text-rose-300">{state.error}</p>
      ) : state.success ? (
        <p className="text-sm font-semibold text-emerald-300">{state.success}</p>
      ) : null}

      <SubmitButton label="Create account" />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : label}
    </button>
  );
}

