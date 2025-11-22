"use client";

/**
 * Component to display only the personal best score for Wordfall
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getUserPersonalBests } from "./get-top-scores";
import type { WordfallMode } from "@/lib/games/wordfall";

interface PersonalBestDisplayProps {
  selectedMode: WordfallMode;
  currentScore?: number;
}

const MODE_LABELS: Record<WordfallMode, string> = {
  exact: "Mode Exact",
  free: "Mode Libre",
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
    async function fetchScores() {
      setLoading(true);
      const personal = await getUserPersonalBests();
      setPersonalBests(personal);
      setLoading(false);
    }

    fetchScores();
  }, [currentScore]); // Refetch when current score changes (after game ends)

  if (loading) {
    return (
      <div className="comic-panel-dark p-4">
        <p className="text-slate-300 text-outline text-sm">Chargement...</p>
      </div>
    );
  }

  const personalBest = personalBests[selectedMode];

  return (
    <div className="comic-panel-dark p-6" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)" }}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="comic-panel bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-black p-2">
          <span className="text-2xl">⭐</span>
        </div>
        <h3 className="text-xl font-bold text-white text-outline">
          Votre Meilleur Score - {MODE_LABELS[selectedMode]}
        </h3>
      </div>
      {personalBest === null ? (
        <div className="text-center py-4">
          <p className="text-slate-400 text-outline text-base">
            Aucun score enregistré
          </p>
          <p className="text-slate-500 text-outline text-sm mt-2">
            Lancez une partie pour commencer!
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-4 border-black p-6 mb-3 inline-block">
            <div className="text-5xl font-bold text-white text-outline">
              {personalBest.toLocaleString()}
            </div>
          </div>
          {currentScore !== undefined && currentScore > personalBest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="comic-panel bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-black px-4 py-2 inline-block"
            >
              <p className="text-base font-bold text-white text-outline">
                🎉 Nouveau record personnel!
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

