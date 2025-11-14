"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateUserRoleAction, type UpdateRoleState } from "./actions";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type UserRoleFormProps = {
  userId: string;
  currentRole: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="comic-button bg-cyan-500 text-white px-4 py-1.5 text-sm font-bold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Mise à jour..." : "Mettre à jour"}
    </button>
  );
}

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<UpdateRoleState, FormData>(
    updateUserRoleAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="inline-flex flex-col gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-2">
        <select
          name="newRole"
          defaultValue={currentRole}
          className="comic-panel border-2 border-black bg-slate-800 px-3 py-1.5 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <SubmitButton />
      </div>
      {state.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-400">{state.success}</p>
      )}
    </form>
  );
}

