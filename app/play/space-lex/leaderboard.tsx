"use client";

/**
 * Lexicon Blaster Leaderboard Component
 * 
 * Displays a single global leaderboard (NO difficulty levels).
 * Shows top players ranked by best score with wave info.
 */

import { useEffect, useState } from "react";
import { TrophyIcon } from "@/components/ui/game-icons";
import type { ShopItem } from "@/types/shop";
import { LeaderboardAvatar } from "./leaderboard-avatar";
import { getLexiconBlasterLeaderboard } from "./get-top-scores";

interface LeaderboardEntry {
    user_id: string;
    username: string;
    best_score: number;
    max_wave: number;
    games_played: number;
    rank: number;
    equipped_avatar?: ShopItem | null;
    equipped_background?: ShopItem | null;
    equipped_title?: ShopItem | null;
}

export function LexiconBlasterLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchLeaderboard() {
            setLoading(true);

            try {
                const entries = await getLexiconBlasterLeaderboard();

                if (!cancelled) {
                    setLeaderboard(
                        entries.map((entry) => ({
                            user_id: entry.user_id,
                            username: entry.username,
                            best_score: entry.best_score,
                            max_wave: entry.max_score || 1,
                            games_played: entry.games_played,
                            rank: entry.rank,
                            equipped_avatar: entry.equipped_avatar,
                            equipped_background: entry.equipped_background,
                            equipped_title: entry.equipped_title,
                        }))
                    );
                }
            } catch (error) {
                console.error("Error fetching Lexicon Blaster leaderboard:", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchLeaderboard();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="comic-panel-dark p-8 text-center">
                <p className="text-slate-300 text-outline">Chargement du classement...</p>
            </div>
        );
    }

    return (
        <div className="comic-panel-dark p-6">
            <h3 className="text-2xl font-bold text-white mb-6 text-outline text-center">
                🏆 Top 10 - Classement Global
            </h3>

            {leaderboard.length === 0 ? (
                <div className="text-center text-slate-400 text-outline py-8">
                    Aucun score enregistré.
                </div>
            ) : (
                <div className="space-y-3">
                    {leaderboard.map((entry) => (
                        <div
                            key={entry.user_id}
                            className="comic-panel bg-slate-800 border-2 border-black p-3 md:p-4 grid grid-cols-[45px_1fr_95px] md:grid-cols-[60px_1fr_120px] items-start gap-2 md:gap-4"
                        >
                            {/* Rank */}
                            <div
                                className="comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-white text-outline text-sm md:text-base"
                            >
                                {entry.rank}
                            </div>

                            {/* Avatar and name */}
                            <div className="flex justify-center min-w-0">
                                <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full">
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
                                            Wave {entry.max_wave} • {entry.games_played} partie{entry.games_played > 1 ? "s" : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Score */}
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
    );
}
