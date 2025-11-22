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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WordfallMode } from "@/lib/games/wordfall";
import { TrophyIcon } from "@/components/ui/game-icons";

import type { ShopItem } from "@/types/shop";
import { LeaderboardAvatar } from "../speed-verb-challenge/leaderboard-avatar";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  best_score: number;
  games_played: number;
  rank: number;
  equipped_avatar?: ShopItem | null;
  equipped_background?: ShopItem | null;
  equipped_title?: ShopItem | null;
}

interface LeaderboardData {
  exact: LeaderboardEntry[];
  free: LeaderboardEntry[];
}

const MODE_LABELS: Record<WordfallMode, string> = {
  exact: "Mode Exact",
  free: "Mode Libre",
};

const MODE_COLORS: Record<WordfallMode, string> = {
  exact: "bg-cyan-600",
  free: "bg-blue-600",
};

/**
 * Map Wordfall mode to difficulty string
 */
function mapModeToDifficulty(mode: WordfallMode): "easy" | "hard" {
  return mode === "exact" ? "easy" : "hard";
}

interface WordfallLeaderboardProps {
  initialMode?: WordfallMode;
}

export function WordfallLeaderboard({ initialMode = "exact" }: WordfallLeaderboardProps) {
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({
    exact: [],
    free: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<WordfallMode>(initialMode);

  useEffect(() => {
    async function fetchLeaderboards() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      // Get the Wordfall game ID
      const { data: game } = await supabase
        .from("games")
        .select("id")
        .eq("slug", "wordfall")
        .single();

      if (!game) {
        setLoading(false);
        return;
      }

      const gameId = game.id;

      // Fetch leaderboards for each mode
      const modes: WordfallMode[] = ["exact", "free"];
      const leaderboardData: LeaderboardData = {
        exact: [],
        free: [],
      };

      for (const mode of modes) {
        const difficulty = mapModeToDifficulty(mode);
        
        // Query: Get all scores for this game and mode
        // We'll group by user_id in JavaScript and join with profiles separately
        const { data: scores, error } = await supabase
          .from("game_scores")
          .select("user_id, score")
          .eq("game_id", gameId)
          .eq("difficulty", difficulty)
          .order("score", { ascending: false });

        if (error) {
          console.error(`Error fetching ${mode} leaderboard:`, error);
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

        // Fetch equipped items for all users
        const { data: equippedItems } = await supabase
          .from("user_equipped_items")
          .select(`
            user_id,
            equipped_avatar:shop_items!equipped_avatar_id(*),
            equipped_background:shop_items!equipped_background_id(*),
            equipped_title:shop_items!equipped_title_id(*)
          `)
          .in("user_id", userIds);

        const equippedMap = new Map<string, { avatar?: ShopItem | null; background?: ShopItem | null; title?: ShopItem | null }>();
        if (equippedItems) {
          for (const item of equippedItems) {
            const avatar = Array.isArray(item.equipped_avatar) 
              ? item.equipped_avatar[0] 
              : item.equipped_avatar;
            const background = Array.isArray(item.equipped_background) 
              ? item.equipped_background[0] 
              : item.equipped_background;
            const title = Array.isArray(item.equipped_title) 
              ? item.equipped_title[0] 
              : item.equipped_title;
            equippedMap.set(item.user_id, { avatar, background, title });
          }
        }

        // Group scores by user_id and get best score + count games
        const userStats = new Map<
          string,
          { bestScore: number; gamesPlayed: number }
        >();

        for (const scoreEntry of scores) {
          const existing = userStats.get(scoreEntry.user_id);
          if (!existing) {
            userStats.set(scoreEntry.user_id, {
              bestScore: scoreEntry.score,
              gamesPlayed: 1,
            });
          } else {
            userStats.set(scoreEntry.user_id, {
              bestScore: Math.max(existing.bestScore, scoreEntry.score),
              gamesPlayed: existing.gamesPlayed + 1,
            });
          }
        }

        // Create leaderboard entries
        const entries: LeaderboardEntry[] = Array.from(userStats.entries())
          .map(([userId, stats]) => {
            const equipped = equippedMap.get(userId);
            return {
              user_id: userId,
              username: profileMap.get(userId) || "Unknown",
              best_score: stats.bestScore,
              games_played: stats.gamesPlayed,
              rank: 0, // Will be set after sorting
              equipped_avatar: equipped?.avatar || null,
              equipped_background: equipped?.background || null,
              equipped_title: equipped?.title || null,
            };
          })
          .sort((a, b) => b.best_score - a.best_score)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        leaderboardData[mode] = entries;
      }

      setLeaderboards(leaderboardData);
      setLoading(false);
    }

    fetchLeaderboards();
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


