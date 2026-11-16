"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateUserRoleAction, type UpdateRoleState } from "./actions";

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
      className="eq-btn eq-btn-primary eq-btn-sm"
    >
      {pending ? "Mise à jour…" : "Mettre à jour"}
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
    <form action={formAction} className="inline-flex flex-col gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-2">
        <select
          name="newRole"
          defaultValue={currentRole}
          className="eq-input px-3 py-1.5 text-sm font-semibold"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <SubmitButton />
      </div>
      {state.error && (
        <p className="text-xs font-semibold text-[var(--pro-error)]">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs font-semibold text-[var(--pro-success)]">{state.success}</p>
      )}
    </form>
  );
}
