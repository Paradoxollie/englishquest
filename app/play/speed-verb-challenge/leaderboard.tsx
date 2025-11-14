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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Difficulty } from "@/lib/profile/leveling";
import { TrophyIcon } from "@/components/ui/game-icons";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  best_score: number;
  games_played: number;
  rank: number;
}

interface LeaderboardData {
  easy: LeaderboardEntry[];
  medium: LeaderboardEntry[];
  hard: LeaderboardEntry[];
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

interface SpeedVerbLeaderboardProps {
  initialDifficulty?: Difficulty;
}

export function SpeedVerbLeaderboard({ initialDifficulty = "easy" }: SpeedVerbLeaderboardProps) {
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({
    easy: [],
    medium: [],
    hard: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);

  useEffect(() => {
    async function fetchLeaderboards() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      // Get the Speed Verb Challenge game ID
      const { data: game } = await supabase
        .from("games")
        .select("id")
        .eq("slug", "speed-verb-challenge")
        .single();

      if (!game) {
        setLoading(false);
        return;
      }

      const gameId = game.id;

      // Fetch leaderboards for each difficulty
      const difficulties: Difficulty[] = ["easy", "medium", "hard"];
      const leaderboardData: LeaderboardData = {
        easy: [],
        medium: [],
        hard: [],
      };

      for (const difficulty of difficulties) {
        // Query: Get all scores for this game and difficulty
        // We'll group by user_id in JavaScript and join with profiles separately
        const { data: scores, error } = await supabase
          .from("game_scores")
          .select("user_id, score")
          .eq("game_id", gameId)
          .eq("difficulty", difficulty)
          .order("score", { ascending: false });

        if (error) {
          console.error(`Error fetching ${difficulty} leaderboard:`, error);
          continue;
        }

        if (!scores || scores.length === 0) {
          continue;
        }

        // Get unique user IDs
        const userIds = [...new Set(scores.map((s) => s.user_id))];

        // Fetch usernames for these users
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p.username])
        );

        // Group by user_id and calculate best score and games played
        const userMap = new Map<
          string,
          { username: string; bestScore: number; gamesPlayed: number }
        >();

        for (const entry of scores) {
          const userId = entry.user_id;
          const score = entry.score;
          const username = profileMap.get(userId) || "Unknown";

          if (!userMap.has(userId)) {
            userMap.set(userId, {
              username,
              bestScore: score,
              gamesPlayed: 1,
            });
          } else {
            const userData = userMap.get(userId)!;
            userData.bestScore = Math.max(userData.bestScore, score);
            userData.gamesPlayed += 1;
          }
        }

        // Convert to array and sort by best score
        const entries: LeaderboardEntry[] = Array.from(userMap.entries())
          .map(([userId, data], index) => ({
            user_id: userId,
            username: data.username,
            best_score: data.bestScore,
            games_played: data.gamesPlayed,
            rank: index + 1,
          }))
          .sort((a, b) => b.best_score - a.best_score)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }))
          .slice(0, 10); // Top 10

        leaderboardData[difficulty] = entries;
      }

      setLeaderboards(leaderboardData);
      setLoading(false);
    }

    fetchLeaderboards();
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
                className="comic-panel bg-slate-800 border-2 border-black p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`comic-panel ${DIFFICULTY_COLORS[selectedDifficulty]} border-2 border-black w-12 h-12 flex items-center justify-center font-bold text-white text-outline`}
                  >
                    {entry.rank}
                  </div>
                  <div>
                    <div className="font-bold text-white text-outline">{entry.username}</div>
                    <div className="text-sm text-slate-400 text-outline">
                      {entry.games_played} partie{entry.games_played > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {entry.rank === 1 && (
                    <TrophyIcon className="w-6 h-6 text-amber-400" />
                  )}
                  <div className="text-xl font-bold text-cyan-400 text-outline">
                    {entry.best_score}
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

