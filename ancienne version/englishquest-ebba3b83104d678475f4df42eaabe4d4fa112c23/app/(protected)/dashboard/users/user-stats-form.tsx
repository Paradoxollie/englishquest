"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateUserStatsAction, type UpdateStatsState } from "./actions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      className="comic-button bg-cyan-500 text-white px-3 py-1 text-xs font-bold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "..." : "✓"}
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

  // Synchroniser les valeurs locales avec les props quand elles changent (après refresh)
  useEffect(() => {
    setXp(currentXP.toString());
    setGold(currentGold.toString());
    setLevel(currentLevel.toString());
  }, [currentXP, currentGold, currentLevel]);

  // Rafraîchir la page après succès pour récupérer les nouvelles valeurs depuis la DB
  useEffect(() => {
    if (state.success) {
      // Attendre un peu pour que la DB soit mise à jour, puis rafraîchir
      const timer = setTimeout(() => {
        router.refresh();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  const handleSubmit = async (formData: FormData) => {
    // Log pour debug
    const xpValue = formData.get("xp");
    const goldValue = formData.get("gold");
    const levelValue = formData.get("level");
    console.log("Form submitted with values:", { 
      userId, 
      xp: xpValue, 
      gold: goldValue, 
      level: levelValue,
      current: { currentXP, currentGold, currentLevel }
    });
    return formAction(formData);
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-1">
        <input
          type="number"
          name="xp"
          value={xp}
          onChange={(e) => setXp(e.target.value)}
          min="0"
          required
          className="comic-panel w-20 border-2 border-black bg-slate-800 px-2 py-1 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
          placeholder="XP"
        />
        <input
          type="number"
          name="gold"
          value={gold}
          onChange={(e) => setGold(e.target.value)}
          min="0"
          required
          className="comic-panel w-20 border-2 border-black bg-slate-800 px-2 py-1 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
          placeholder="Gold"
        />
        <input
          type="number"
          name="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          min="1"
          required
          className="comic-panel w-16 border-2 border-black bg-slate-800 px-2 py-1 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
          placeholder="Lvl"
        />
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

