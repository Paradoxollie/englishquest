"use client";

/**
 * Wordfall Leaderboard Component
 * 
 * Displays two separate leaderboards (exact mode, free mode) by filtering
 * the game_scores table on the difficulty column.
 * 
 * Each leaderboard shows:
 * - Top players ranked by best score
 * - Username, best score, and number of games played
 * - Grouped by user_id (one entry per user showing their best)
 */

import { useEffect, useState } from "react";
import type { WordfallMode } from "@/lib/games/wordfall";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "../speed-verb-challenge/leaderboard-avatar";
import { getWordfallLeaderboards, type WordfallLeaderboardData } from "./get-top-scores";

const MODE_LABELS: Record<WordfallMode, string> = {
  exact: "Mode Exact",
  free: "Mode Libre",
};

const MODE_COLORS: Record<WordfallMode, string> = {
  exact: "bg-cyan-600",
  free: "bg-blue-600",
};

interface WordfallLeaderboardProps {
  initialMode?: WordfallMode;
}

type LeaderboardData = WordfallLeaderboardData;

export function WordfallLeaderboard({ initialMode = "exact" }: WordfallLeaderboardProps) {
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({
    exact: [],
    free: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<WordfallMode>(initialMode);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaderboards() {
      setLoading(true);

      try {
        const leaderboardData = await getWordfallLeaderboards();

        if (!cancelled) {
          setLeaderboards(leaderboardData);
        }
      } catch (error) {
        console.error("Error fetching Wordfall leaderboards:", error);
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

  if (loading) {
    return (
      <div className="comic-panel-dark p-6">
        <p className="text-slate-300 text-outline text-center">Chargement du classement...</p>
      </div>
    );
  }

  const currentLeaderboard = leaderboards[selectedMode];

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setSelectedMode("exact")}
          className={`comic-button px-6 py-3 font-bold transition-all ${
            selectedMode === "exact"
              ? `${MODE_COLORS.exact} text-white`
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Mode Exact
        </button>
        <button
          onClick={() => setSelectedMode("free")}
          className={`comic-button px-6 py-3 font-bold transition-all ${
            selectedMode === "free"
              ? `${MODE_COLORS.free} text-white`
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Mode Libre
        </button>
      </div>

      {/* Leaderboard */}
      <div className="comic-panel-dark p-6">
        <h2 className="text-2xl font-bold text-white mb-4 text-outline text-center">
          🏆 Classement - {MODE_LABELS[selectedMode]}
        </h2>

        {currentLeaderboard.length === 0 ? (
          <p className="text-slate-400 text-outline text-center py-8">
            Aucun score enregistré pour ce mode
          </p>
        ) : (
          <div className="space-y-3">
            {currentLeaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className="comic-panel bg-slate-800 border-2 border-black p-4 grid grid-cols-[50px_1fr_120px_100px] items-center gap-4"
              >
                {/* Rank */}
                <div
                  className={`comic-panel ${MODE_COLORS[selectedMode]} border-2 border-black w-10 h-10 flex items-center justify-center font-bold text-white text-outline`}
                >
                  {entry.rank}
                </div>

                {/* Avatar and Username */}
                <div className="flex items-center gap-3 min-w-0">
                  <LeaderboardAvatar
                    userId={entry.user_id}
                    username={entry.username}
                    equippedAvatar={entry.equipped_avatar}
                    equippedBackground={entry.equipped_background}
                    equippedTitle={entry.equipped_title}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-outline truncate">
                      {entry.username}
                    </div>
                    {entry.equipped_title && (
                      <div className="text-xs font-semibold text-cyan-400 text-outline truncate">
                        {entry.equipped_title.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center justify-end gap-2">
                  {entry.rank === 1 && (
                    <TrophyIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div className="text-xl font-bold text-cyan-400 text-outline">
                    {entry.best_score.toLocaleString()}
                  </div>
                </div>

                {/* Games Played */}
                <div className="text-right">
                  <div className="text-xs text-slate-400 text-outline mb-1">Parties</div>
                  <div className="text-sm font-semibold text-white text-outline">
                    {entry.games_played}
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






