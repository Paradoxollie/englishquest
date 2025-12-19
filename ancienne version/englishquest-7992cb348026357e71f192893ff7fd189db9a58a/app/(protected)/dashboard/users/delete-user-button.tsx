"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { deleteUserAction, type DeleteUserState } from "./actions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      className="comic-button bg-red-500 text-white px-3 py-1 text-xs font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "..." : "🗑️"}
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
      <span className="text-xs text-slate-500" title="Vous ne pouvez pas supprimer votre propre compte">
        —
      </span>
    );
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="comic-button bg-red-500 text-white px-3 py-1 text-xs font-bold hover:bg-red-600"
      >
        🗑️
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <span className="text-xs text-red-300">Confirmer?</span>
        <DeleteButton disabled={false} />
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="comic-button bg-slate-700 text-white px-2 py-1 text-xs font-bold hover:bg-slate-600"
        >
          Annuler
        </button>
      </form>
      {state.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-400">{state.success}</p>
      )}
    </div>
  );
}

