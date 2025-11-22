"use client";

/**
 * Component to display top scores (global top 3 and personal best) for Wordfall
 */

import { useEffect, useState } from "react";
import { getTopGlobalScores, getUserPersonalBests, type TopScoresByMode } from "./get-top-scores";
import type { WordfallMode } from "@/lib/games/wordfall";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "../speed-verb-challenge/leaderboard-avatar";

interface TopScoresDisplayProps {
  selectedMode: WordfallMode;
  currentScore?: number;
}

const MODE_LABELS: Record<WordfallMode, string> = {
  exact: "Mode Exact",
  free: "Mode Libre",
};

const MODE_COLORS: Record<WordfallMode, string> = {
  exact: "bg-cyan-600",
  free: "bg-blue-600",
};

export function TopScoresDisplay({ selectedMode, currentScore }: TopScoresDisplayProps) {
  const [topScores, setTopScores] = useState<TopScoresByMode>({
    exact: [],
    free: [],
  });
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
      const [globalScores, personal] = await Promise.all([
        getTopGlobalScores(),
        getUserPersonalBests(),
      ]);
      setTopScores(globalScores);
      setPersonalBests(personal);
      setLoading(false);
    }

    fetchScores();
  }, [currentScore]); // Refetch when current score changes (after game ends)

  if (loading) {
    return (
      <div className="comic-panel-dark p-4">
        <p className="text-slate-300 text-outline text-sm">Chargement des scores...</p>
      </div>
    );
  }

  const globalTop3 = topScores[selectedMode];
  const personalBest = personalBests[selectedMode];

  return (
    <div className="space-y-4">
      {/* Global Top 3 */}
      <div className="comic-panel-dark p-4">
        <h3 className="text-lg font-bold text-white mb-3 text-outline text-center">
          🏆 Top 3 Global - {MODE_LABELS[selectedMode]}
        </h3>
        {globalTop3.length === 0 ? (
          <p className="text-slate-400 text-outline text-sm text-center">
            Aucun score enregistré
          </p>
        ) : (
          <div className="space-y-2">
            {globalTop3.map((entry) => (
              <div
                key={entry.user_id}
                className="comic-panel bg-slate-800 border-2 border-black p-3 grid grid-cols-[40px_1fr_100px] items-start gap-3"
              >
                {/* Rang à gauche - largeur fixe */}
                <div
                  className={`comic-panel ${MODE_COLORS[selectedMode]} border-2 border-black w-8 h-8 flex items-center justify-center font-bold text-white text-outline text-xs`}
                >
                  {entry.rank}
                </div>
                
                {/* Avatar, nom et titre centrés au milieu - avatars alignés horizontalement */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center gap-1">
                    {/* Conteneur avec hauteur fixe pour aligner tous les avatars */}
                    <div className="h-24 flex items-center justify-center">
                      <LeaderboardAvatar
                        userId={entry.user_id}
                        username={entry.username}
                        equippedAvatar={entry.equipped_avatar}
                        equippedBackground={entry.equipped_background}
                        equippedTitle={entry.equipped_title}
                        size="lg"
                      />
                    </div>
                    <div className="text-center min-w-0 max-w-full">
                      <div className="font-bold text-white text-outline truncate">{entry.username}</div>
                      {entry.equipped_title && (
                        <div className="text-xs font-semibold text-cyan-400 text-outline truncate">
                          {entry.equipped_title.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Score à droite - largeur fixe */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {entry.rank === 1 && (
                    <TrophyIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div className="text-lg font-bold text-cyan-400 text-outline">
                    {entry.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Best */}
      <div className="comic-panel-dark p-4">
        <h3 className="text-lg font-bold text-white mb-3 text-outline text-center">
          ⭐ Votre Meilleur Score - {MODE_LABELS[selectedMode]}
        </h3>
        {personalBest === null ? (
          <p className="text-slate-400 text-outline text-sm text-center">
            Aucun score enregistré
          </p>
        ) : (
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 text-outline mb-2">
              {personalBest}
            </div>
            {currentScore !== undefined && currentScore > personalBest && (
              <p className="text-sm text-emerald-400 text-outline">
                🎉 Nouveau record personnel!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


