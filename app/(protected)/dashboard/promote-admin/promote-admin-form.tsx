"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { promoteToAdminAction, type PromoteAdminState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="eq-btn eq-btn-danger"
    >
      {pending ? "Promotion en cours…" : "Promouvoir en admin"}
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
      setTimeout(() => {
        router.refresh();
      }, 2000);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-1.5">
        <label htmlFor="username" className="text-sm font-bold">
          Nom d&apos;utilisateur à promouvoir en admin
        </label>
        <input
          type="text"
          id="username"
          name="username"
          defaultValue="ollie"
          required
          className="eq-input px-4 py-2.5 text-sm font-medium"
          placeholder="ollie"
        />
      </div>

      {state.error && (
        <div className="rounded-[var(--pro-radius)] border border-[var(--pro-error)] bg-[var(--pro-error-soft)] px-4 py-3 text-sm font-semibold text-[var(--pro-error)]">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-[var(--pro-radius)] border border-[var(--pro-success)] bg-[var(--pro-success-soft)] px-4 py-3 text-sm font-semibold text-[var(--pro-success)]">
          {state.success}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
