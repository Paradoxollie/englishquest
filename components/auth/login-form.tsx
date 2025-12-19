"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/(public)/auth/actions";
import { authInitialState } from "@/types/auth";


export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, authInitialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Username or email</span>
        <input
          type="text"
          name="login"
          required
          placeholder="ShadowFox or shadow@example.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Password</span>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </label>

      {state.error ? <p className="text-sm font-semibold text-rose-300">{state.error}</p> : null}

      <SubmitButton label="Log in" />
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
      {pending ? "Connecting..." : label}
    </button>
  );
}

