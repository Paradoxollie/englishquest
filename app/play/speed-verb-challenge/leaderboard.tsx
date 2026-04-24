"use client";

/**
 * Speed Verb Challenge Leaderboard Component
 * 
 * Displays three separate leaderboards (easy, medium, hard) by filtering
 * the game_scores table on the difficulty column.
 * 
 * Each leaderboard shows:
 * - Top players ranked by best score
 * - Username, best score, and number of games played
 * - Grouped by user_id (one entry per user showing their best)
 */

import { useEffect, useState } from "react";
import type { Difficulty } from "@/lib/profile/leveling";
import { TrophyIcon } from "@/components/ui/game-icons";

import { LeaderboardAvatar } from "./leaderboard-avatar";
import { getSpeedVerbLeaderboards, type SpeedVerbLeaderboardData } from "./get-top-scores";

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

interface SpeedVerbLeaderboardProps {
  initialDifficulty?: Difficulty;
}

type LeaderboardData = SpeedVerbLeaderboardData;

export function SpeedVerbLeaderboard({ initialDifficulty = "easy" }: SpeedVerbLeaderboardProps) {
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({
    easy: [],
    medium: [],
    hard: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaderboards() {
      setLoading(true);

      try {
        const leaderboardData = await getSpeedVerbLeaderboards();

        if (!cancelled) {
          setLeaderboards(leaderboardData);
        }
      } catch (error) {
        console.error("Error fetching Speed Verb leaderboards:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboards();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update selected difficulty when prop changes
  useEffect(() => {
    if (initialDifficulty) {
      setSelectedDifficulty(initialDifficulty);
    }
  }, [initialDifficulty]);

  if (loading) {
    return (
      <div className="comic-panel-dark p-8 text-center">
        <p className="text-slate-300 text-outline">Chargement du classement...</p>
      </div>
    );
  }

  const currentLeaderboard = leaderboards[selectedDifficulty];

  return (
    <div className="space-y-6">
      {/* Difficulty Selector */}
      <div className="comic-panel-dark p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`comic-button px-6 py-2 font-bold text-outline ${
                selectedDifficulty === diff
                  ? `${DIFFICULTY_COLORS[diff]} text-white border-4 border-black`
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="comic-panel-dark p-6">
        <h3 className="text-2xl font-bold text-white mb-6 text-outline text-center">
          Classement - {DIFFICULTY_LABELS[selectedDifficulty]}
        </h3>

        {currentLeaderboard.length === 0 ? (
          <div className="text-center text-slate-400 text-outline py-8">
            Aucun score enregistré pour cette difficulté.
          </div>
        ) : (
          <div className="space-y-3">
            {currentLeaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className="comic-panel bg-slate-800 border-2 border-black p-3 md:p-4 grid grid-cols-[45px_1fr_95px] md:grid-cols-[60px_1fr_120px] items-start gap-2 md:gap-4"
              >
                {/* Rang à gauche - largeur fixe */}
                <div
                  className={`comic-panel ${DIFFICULTY_COLORS[selectedDifficulty]} border-2 border-black w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-white text-outline text-sm md:text-base`}
                >
                  {entry.rank}
                </div>
                
                {/* Avatar, nom et titre centrés au milieu - avatars alignés horizontalement */}
                <div className="flex justify-center min-w-0">
                  <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full">
                    {/* Conteneur avec hauteur fixe pour aligner tous les avatars */}
                    <div className="h-20 md:h-28 flex items-center justify-center">
                      <LeaderboardAvatar
                        userId={entry.user_id}
                        username={entry.username}
                        equippedAvatar={entry.equipped_avatar}
                        equippedBackground={entry.equipped_background}
                        equippedTitle={entry.equipped_title}
                        size="xl"
                      />
                    </div>
                    <div className="text-center min-w-0 w-full px-1">
                      <div className="font-bold text-white text-outline truncate text-sm md:text-base">{entry.username}</div>
                      {entry.equipped_title && (
                        <div className="text-xs md:text-sm font-semibold text-cyan-400 text-outline truncate">
                          {entry.equipped_title.name}
                        </div>
                      )}
                      <div className="text-xs md:text-sm text-slate-400 text-outline">
                        {entry.games_played} partie{entry.games_played > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Score à droite - largeur fixe */}
                <div className="flex items-center justify-end gap-1 md:gap-2 pt-1 md:pt-2 min-w-0">
                  {entry.rank === 1 && (
                    <TrophyIcon className="w-4 h-4 md:w-6 md:h-6 text-amber-400 flex-shrink-0" />
                  )}
                  <div className="text-base md:text-xl font-bold text-cyan-400 text-outline whitespace-nowrap">
                    {entry.best_score.toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
