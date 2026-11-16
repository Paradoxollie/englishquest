"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteUserAction, type DeleteUserState } from "./actions";

type DeleteUserButtonProps = {
  userId: string;
  username: string;
  isCurrentUser: boolean;
};

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="eq-btn eq-btn-danger eq-btn-sm"
    >
      {pending ? "…" : "Confirmer"}
    </button>
  );
}

export function DeleteUserButton({
  userId,
  username,
  isCurrentUser,
}: DeleteUserButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction] = useActionState<DeleteUserState, FormData>(
    deleteUserAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  if (isCurrentUser) {
    return (
      <span className="eq-muted text-xs" title="Vous ne pouvez pas supprimer votre propre compte">
        —
      </span>
    );
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="eq-btn eq-btn-danger eq-btn-sm"
        aria-label={`Supprimer ${username}`}
      >
        Supprimer
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <DeleteButton disabled={false} />
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="eq-btn eq-btn-ghost eq-btn-sm"
        >
          Annuler
        </button>
      </form>
      {state.error && (
        <p className="text-xs font-semibold text-[var(--pro-error)]">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs font-semibold text-[var(--pro-success)]">{state.success}</p>
      )}
    </div>
  );
}
