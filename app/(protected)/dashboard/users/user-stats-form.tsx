"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateUserStatsAction, type UpdateStatsState } from "./actions";

type UserStatsFormProps = {
  userId: string;
  currentXP: number;
  currentGold: number;
  currentLevel: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="eq-btn eq-btn-primary eq-btn-sm"
      title="Enregistrer"
    >
      {pending ? "…" : "OK"}
    </button>
  );
}

export function UserStatsForm({
  userId,
  currentXP,
  currentGold,
  currentLevel,
}: UserStatsFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<UpdateStatsState, FormData>(
    updateUserStatsAction,
    {}
  );

  const [xp, setXp] = useState(currentXP.toString());
  const [gold, setGold] = useState(currentGold.toString());
  const [level, setLevel] = useState(currentLevel.toString());

  useEffect(() => {
    setXp(currentXP.toString());
    setGold(currentGold.toString());
    setLevel(currentLevel.toString());
  }, [currentXP, currentGold, currentLevel]);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.refresh();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          name="xp"
          value={xp}
          onChange={(e) => setXp(e.target.value)}
          min="0"
          required
          aria-label="XP"
          className="eq-input w-20 px-2 py-1 text-xs font-semibold"
          placeholder="XP"
        />
        <input
          type="number"
          name="gold"
          value={gold}
          onChange={(e) => setGold(e.target.value)}
          min="0"
          required
          aria-label="Or"
          className="eq-input w-20 px-2 py-1 text-xs font-semibold"
          placeholder="Or"
        />
        <input
          type="number"
          name="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          min="1"
          required
          aria-label="Niveau"
          className="eq-input w-16 px-2 py-1 text-xs font-semibold"
          placeholder="Niv."
        />
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
