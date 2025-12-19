"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { promoteToAdminAction, type PromoteAdminState } from "./actions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-red-500/50 bg-red-500/10 px-6 py-3 font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Promotion en cours..." : "Promouvoir en Admin"}
    </button>
  );
}

export function PromoteAdminForm() {
  const router = useRouter();
  const [state, formAction] = useActionState<PromoteAdminState, FormData>(
    promoteToAdminAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      // Recharger la page après 2 secondes pour voir le nouveau rôle
      setTimeout(() => {
        router.refresh();
      }, 2000);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
          Username à promouvoir en admin
        </label>
        <input
          type="text"
          id="username"
          name="username"
          defaultValue="ollie"
          required
          className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
          placeholder="ollie"
        />
      </div>
      
      {state.error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}
      
      {state.success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {state.success}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

