"use client";

/**
 * Component to display top scores (global top 3 and personal best)
 */

import { useEffect, useState } from "react";
import { getTopGlobalScores, getUserPersonalBests, type TopScoresByDifficulty } from "./get-top-scores";
import type { Difficulty } from "@/lib/profile/leveling";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "./leaderboard-avatar";

interface TopScoresDisplayProps {
  selectedDifficulty: Difficulty;
  currentScore?: number;
}

// Map difficulty number (1,2,3) to string (easy, medium, hard)
function mapDifficultyToLabel(diff: 1 | 2 | 3): Difficulty {
  const map: Record<1 | 2 | 3, Difficulty> = {
    1: "easy",
    2: "medium",
    3: "hard",
  };
  return map[diff];
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-600",
  medium: "bg-amber-600",
  hard: "bg-red-600",
};

export function TopScoresDisplay({ selectedDifficulty, currentScore }: TopScoresDisplayProps) {
  const [topScores, setTopScores] = useState<TopScoresByDifficulty>({
    easy: [],
    medium: [],
    hard: [],
  });
  const [personalBests, setPersonalBests] = useState<{
    easy: number | null;
    medium: number | null;
    hard: number | null;
  }>({
    easy: null,
    medium: null,
    hard: null,
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

  const globalTop3 = topScores[selectedDifficulty];
  const personalBest = personalBests[selectedDifficulty];

  return (
    <div className="space-y-4">
      {/* Global Top 3 */}
      <div className="comic-panel-dark p-4">
        <h3 className="text-lg font-bold text-white mb-3 text-outline text-center">
          🏆 Top 3 Global - {DIFFICULTY_LABELS[selectedDifficulty]}
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
                className="comic-panel bg-slate-800 border-2 border-black p-3 flex items-center justify-between"
              >
                {/* Rang à gauche */}
                <div
                  className={`comic-panel ${DIFFICULTY_COLORS[selectedDifficulty]} border-2 border-black w-8 h-8 flex items-center justify-center font-bold text-white text-outline text-xs flex-shrink-0`}
                >
                  {entry.rank}
                </div>
                
                {/* Avatar, nom et titre centrés au milieu */}
                <div className="flex-1 flex flex-col items-center justify-center gap-1">
                  <LeaderboardAvatar
                    userId={entry.user_id}
                    username={entry.username}
                    equippedAvatar={entry.equipped_avatar}
                    equippedBackground={entry.equipped_background}
                    equippedTitle={entry.equipped_title}
                    size="lg"
                  />
                  <div className="text-center">
                    <div className="font-bold text-white text-outline">{entry.username}</div>
                    {entry.equipped_title && (
                      <div className="text-xs font-semibold text-cyan-400 text-outline">
                        {entry.equipped_title.name}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Score à droite */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.rank === 1 && (
                    <TrophyIcon className="w-5 h-5 text-amber-400" />
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
          ⭐ Votre Meilleur Score - {DIFFICULTY_LABELS[selectedDifficulty]}
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

