"use client";

import { useEffect, useState } from "react";
import { ClockIcon, TrophyIcon } from "@/components/ui/game-icons";
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

function formatSeconds(ms: number): string {
    return `${(ms / 1000).toFixed(2)}s`;
}

function getRankTone(rank: number): string {
    if (rank === 1) return "bg-amber-500 text-slate-950";
    if (rank === 2) return "bg-slate-300 text-slate-950";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-slate-800 text-white";
}

export function FlashTranslationLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const { getFlashTranslationGameLeaderboard } = await import("./actions");
                const entries = await getFlashTranslationGameLeaderboard();
                if (!cancelled) {
                    setLeaderboard(entries);
                }
            } catch (error) {
                console.error("Error fetching Flash Translation leaderboard:", error);
                if (!cancelled) {
                    setLeaderboard([]);
                }
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

    return (
        <section className="border-4 border-black bg-slate-950/95 p-4 shadow-[0_6px_0_#000] md:p-6">
            <div className="flex flex-col gap-3 border-b-4 border-black bg-slate-900/95 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">
                        Temps le plus bas
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white text-outline">
                        Classement global
                    </h2>
                </div>
                <div className="inline-flex items-center gap-2 border-2 border-amber-300/50 bg-amber-950/55 px-3 py-2 text-sm font-bold text-amber-50">
                    <ClockIcon className="h-5 w-5" />
                    Score = temps final
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                    Chargement du classement...
                </div>
            ) : leaderboard.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-300">
                    Aucun score enregistre pour le moment.
                </div>
            ) : (
                <div className="mt-4 space-y-3">
                    {leaderboard.map((entry) => (
                        <article
                            key={entry.user_id}
                            className="grid gap-3 border-4 border-black bg-slate-900/88 p-3 shadow-[0_4px_0_#000] md:grid-cols-[64px_minmax(0,1fr)_160px_96px] md:items-center md:p-4"
                        >
                            <div
                                className={`flex h-12 w-12 items-center justify-center border-4 border-black text-lg font-black shadow-[0_3px_0_#000] ${getRankTone(entry.rank)}`}
                            >
                                {entry.rank}
                            </div>

                            <div className="flex min-w-0 items-center gap-3">
                                <LeaderboardAvatar
                                    userId={entry.user_id}
                                    username={entry.username}
                                    equippedAvatar={entry.equipped_avatar}
                                    equippedBackground={entry.equipped_background}
                                    equippedTitle={entry.equipped_title}
                                    size="sm"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-bold text-white text-outline">
                                        {entry.username}
                                    </p>
                                    {entry.equipped_title ? (
                                        <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">
                                            {entry.equipped_title.name}
                                        </p>
                                    ) : (
                                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                            Challenger Flash
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:justify-end">
                                {entry.rank === 1 && <TrophyIcon className="h-5 w-5 text-amber-300" />}
                                <p className="text-2xl font-black text-cyan-200 text-outline">
                                    {formatSeconds(entry.best_score)}
                                </p>
                            </div>

                            <div className="border-2 border-white/10 bg-black/30 px-3 py-2 text-left md:text-right">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                    Parties
                                </p>
                                <p className="mt-1 text-lg font-bold text-white">{entry.games_played}</p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
