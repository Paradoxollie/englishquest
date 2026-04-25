"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StarIcon } from "@/components/ui/game-icons";
import type { WordfallMode } from "@/lib/games/wordfall";
import { getUserPersonalBests } from "./get-top-scores";

interface PersonalBestDisplayProps {
  selectedMode: WordfallMode;
  currentScore?: number;
}

const MODE_LABELS: Record<WordfallMode, string> = {
  exact: "Mode exact",
  free: "Mode libre",
};

export function PersonalBestDisplay({ selectedMode, currentScore }: PersonalBestDisplayProps) {
  const [personalBests, setPersonalBests] = useState<{
    exact: number | null;
    free: number | null;
  }>({
    exact: null,
    free: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchScores() {
      setLoading(true);
      const personal = await getUserPersonalBests();

      if (!cancelled) {
        setPersonalBests(personal);
        setLoading(false);
      }
    }

    fetchScores();

    return () => {
      cancelled = true;
    };
  }, [currentScore]);

  if (loading) {
    return (
      <div className="border-4 border-black bg-slate-950/90 p-5 shadow-[0_6px_0_#000]">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
          Chargement du record
        </p>
      </div>
    );
  }

  const personalBest = personalBests[selectedMode];
  const isVisibleRecord = currentScore !== undefined && personalBest !== null && currentScore > personalBest;

  return (
    <section className="border-4 border-black bg-slate-950/90 p-5 shadow-[0_6px_0_#000]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center border-4 border-black bg-amber-500">
          <StarIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Record personnel
          </p>
          <h3 className="text-xl font-bold text-white text-outline">
            {MODE_LABELS[selectedMode]}
          </h3>
        </div>
      </div>

      {personalBest === null ? (
        <div className="mt-5 border-2 border-dashed border-white/20 bg-white/5 p-4">
          <p className="text-sm font-semibold leading-relaxed text-slate-300">
            Aucun score enregistre. Lance une manche pour poser une reference.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-4xl font-bold text-cyan-200 text-outline">
            {personalBest.toLocaleString("fr-FR")}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            Meilleur score sauvegarde sur ce mode.
          </p>
        </div>
      )}

      {isVisibleRecord && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 border-4 border-black bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_0_#000]"
        >
          Record battu sur cette manche.
        </motion.div>
      )}
    </section>
  );
}
