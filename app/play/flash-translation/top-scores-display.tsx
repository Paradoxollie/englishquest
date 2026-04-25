"use client";

import { useEffect, useState } from "react";
import { ClockIcon, TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "@/app/play/speed-verb-challenge/leaderboard-avatar";
import type { ShopItem } from "@/types/shop";

interface TopScore {
    user_id: string;
    username: string;
    score: number;
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
    return "bg-orange-600 text-white";
}

export function TopScoresDisplay() {
    const [topScores, setTopScores] = useState<TopScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchScores() {
            try {
                const { getFlashTranslationTopScores } = await import("./actions");
                const scores = await getFlashTranslationTopScores();
                if (!cancelled) {
                    setTopScores(scores);
                }
            } catch (error) {
                console.error("Failed to fetch Flash Translation top scores:", error);
                if (!cancelled) {
                    setTopScores([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchScores();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="border-4 border-black bg-slate-950/90 p-5 shadow-[0_6px_0_#000]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                        Records
                    </p>
                    <h2 className="text-xl font-bold text-white text-outline">Top 3 mondial</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center border-4 border-black bg-amber-500">
                    <TrophyIcon className="h-6 w-6 text-white" />
                </div>
            </div>

            {loading ? (
                <p className="mt-5 border-2 border-white/10 bg-black/30 p-4 text-center text-sm font-semibold text-slate-300">
                    Chargement des records...
                </p>
            ) : topScores.length === 0 ? (
                <p className="mt-5 border-2 border-white/10 bg-black/30 p-4 text-center text-sm font-semibold text-slate-300">
                    Sois le premier à établir un record.
                </p>
            ) : (
                <div className="mt-5 space-y-3">
                    {topScores.map((score) => (
                        <article
                            key={`${score.user_id}-${score.rank}`}
                            className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-4 border-black bg-slate-900/86 p-3 shadow-[0_4px_0_#000]"
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center border-2 border-black text-sm font-black ${getRankTone(score.rank)}`}
                            >
                                {score.rank}
                            </div>

                            <div className="flex min-w-0 items-center gap-3">
                                <LeaderboardAvatar
                                    userId={score.user_id}
                                    username={score.username}
                                    equippedAvatar={score.equipped_avatar}
                                    equippedBackground={score.equipped_background}
                                    equippedTitle={score.equipped_title}
                                    size="sm"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white text-outline">
                                        {score.username}
                                    </p>
                                    {score.equipped_title && (
                                        <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200">
                                            {score.equipped_title.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-cyan-200">
                                <ClockIcon className="h-4 w-4" />
                                <p className="text-lg font-black text-outline">{formatSeconds(score.score)}</p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
