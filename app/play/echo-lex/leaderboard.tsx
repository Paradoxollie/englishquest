"use client";

/**
 * Echo Lex Leaderboard Component
 * 
 * Displays the top players ranked by best score.
 * Standardized to match Flash Translation style perfectly.
 */

import { useEffect, useState } from "react";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "../speed-verb-challenge/leaderboard-avatar";
import type { ShopItem } from "@/types/shop";

interface LeaderboardEntry {
    user_id: string;
    username: string;
    best_score: number;
    games_played: number;
    rank: number;
    equippedAvatar?: ShopItem | null;
    equippedBackground?: ShopItem | null;
    equippedTitle?: ShopItem | null;
}

export function EchoLexLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const { getEchoLexGameLeaderboard } = await import("./actions");
                const entries = await getEchoLexGameLeaderboard();
                setLeaderboard(entries as any);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="comic-panel-dark p-6">
                <p className="text-slate-300 text-outline text-center">Chargement du classement...</p>
            </div>
        );
    }

    return (
        <div className="comic-panel-dark p-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-outline text-center">
                🏆 Classement Global
            </h2>

            {leaderboard.length === 0 ? (
                <p className="text-slate-400 text-outline text-center py-8">
                    Aucun score enregistré
                </p>
            ) : (
                <div className="space-y-3">
                    {leaderboard.map((entry) => (
                        <div
                            key={entry.user_id}
                            className="comic-panel bg-slate-800 border-2 border-black p-4 grid grid-cols-[50px_1fr_120px_100px] items-center gap-4"
                        >
                            {/* Rank */}
                            <div
                                className={`comic-panel ${entry.rank === 1
                                    ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                                    : entry.rank === 2
                                        ? "bg-gradient-to-br from-slate-400 to-slate-500"
                                        : entry.rank === 3
                                            ? "bg-gradient-to-br from-orange-600 to-amber-700"
                                            : "bg-gradient-to-br from-red-600 to-orange-600"
                                    } border-2 border-black w-10 h-10 flex items-center justify-center font-bold text-white text-outline`}
                            >
                                {entry.rank}
                            </div>

                            {/* Avatar and Username */}
                            <div className="flex items-center gap-3 min-w-0">
                                <LeaderboardAvatar
                                    userId={entry.user_id}
                                    username={entry.username}
                                    equippedAvatar={entry.equippedAvatar}
                                    equippedBackground={entry.equippedBackground}
                                    equippedTitle={entry.equippedTitle}
                                    size="md"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-white text-outline truncate">
                                        {entry.username}
                                    </div>
                                    {entry.equippedTitle && (
                                        <div className="text-xs font-semibold text-cyan-400 text-outline truncate">
                                            {entry.equippedTitle.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center justify-end gap-2 text-right">
                                {entry.rank === 1 && (
                                    <TrophyIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                )}
                                <div className="text-xl font-bold text-cyan-400 text-outline">
                                    {entry.best_score} pts
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-right">
                                <div className="text-xs text-slate-400 text-outline mb-1 uppercase font-bold">Points</div>
                                <div className="text-xs font-semibold text-white text-outline">
                                    Score Max
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
