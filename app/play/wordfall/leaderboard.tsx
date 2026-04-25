"use client";

import { useEffect, useState } from "react";
import type { WordfallMode } from "@/lib/games/wordfall";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "../speed-verb-challenge/leaderboard-avatar";
import { getWordfallLeaderboards, type WordfallLeaderboardData } from "./get-top-scores";

const MODE_LABELS: Record<WordfallMode, string> = {
  exact: "Mode exact",
  free: "Mode libre",
};

const MODE_STYLES: Record<WordfallMode, string> = {
  exact: "bg-cyan-600 text-white",
  free: "bg-fuchsia-600 text-white",
};

interface WordfallLeaderboardProps {
  initialMode?: WordfallMode;
}

export function WordfallLeaderboard({ initialMode = "exact" }: WordfallLeaderboardProps) {
  const [leaderboards, setLeaderboards] = useState<WordfallLeaderboardData>({
    exact: [],
    free: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<WordfallMode>(initialMode);

  useEffect(() => {
    setSelectedMode(initialMode);
  }, [initialMode]);

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
        console.error("Wordfall: leaderboard fetch failed", error);
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
      <div className="border-4 border-black bg-slate-950/90 p-6 text-center shadow-[0_6px_0_#000]">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
          Chargement du classement
        </p>
      </div>
    );
  }

  const currentLeaderboard = leaderboards[selectedMode];

  return (
    <div className="border-4 border-black bg-slate-950/90 p-4 shadow-[0_6px_0_#000] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-200">
            Classement Wordfall
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white text-outline md:text-3xl">
            Les meilleurs chasseurs de mots
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 md:min-w-[270px]">
          {(Object.keys(MODE_LABELS) as WordfallMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSelectedMode(mode)}
              className={`border-4 border-black px-4 py-3 text-sm font-bold shadow-[0_4px_0_#000] transition-transform hover:-translate-y-0.5 ${
                selectedMode === mode
                  ? MODE_STYLES[mode]
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {currentLeaderboard.length === 0 ? (
        <div className="mt-5 border-2 border-dashed border-white/20 bg-white/5 p-6 text-center">
          <p className="text-sm font-semibold text-slate-300">
            Aucun score enregistre pour ce mode.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {currentLeaderboard.map((entry) => (
            <div
              key={entry.user_id}
              className="grid gap-3 border-4 border-black bg-slate-900/95 p-3 shadow-[0_4px_0_#000] md:grid-cols-[52px_minmax(0,1fr)_150px_88px] md:items-center md:gap-4"
            >
              <div className={`flex h-11 w-11 items-center justify-center border-4 border-black text-lg font-bold text-white ${MODE_STYLES[selectedMode]}`}>
                {entry.rank}
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <LeaderboardAvatar
                  userId={entry.user_id}
                  username={entry.username}
                  equippedAvatar={entry.equipped_avatar}
                  equippedBackground={entry.equipped_background}
                  equippedTitle={entry.equipped_title}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-white text-outline">
                    {entry.username}
                  </p>
                  {entry.equipped_title && (
                    <p className="truncate text-xs font-semibold text-cyan-300">
                      {entry.equipped_title.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 md:justify-end">
                {entry.rank === 1 && <TrophyIcon className="h-5 w-5 text-amber-300" />}
                <span className="text-xl font-bold text-cyan-200">
                  {entry.best_score.toLocaleString("fr-FR")}
                </span>
              </div>

              <div className="md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Parties
                </p>
                <p className="mt-1 text-sm font-bold text-slate-100">
                  {entry.games_played}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
