"use client";

/**
 * Top Scores Display for Flashback (formerly Echo Lex)
 * 
 * Shows the top 3 global scores before the game starts.
 * Standardized to match Flash Translation style perfectly.
 */

import { useEffect, useState } from "react";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "../speed-verb-challenge/leaderboard-avatar";
import type { ShopItem } from "@/types/shop";

interface TopScore {
    user_id: string;
    username: string;
    score: number;
    rank: number;
    equippedAvatar?: ShopItem | null;
    equippedBackground?: ShopItem | null;
    equippedTitle?: ShopItem | null;
}

export function TopScoresDisplay() {
    const [topScores, setTopScores] = useState<TopScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScores() {
            setLoading(true);
            try {
                const { getEchoLexTopScores } = await import("./actions");
                const scores = await getEchoLexTopScores();
                setTopScores(scores as any);
            } catch (error) {
                console.error("Failed to fetch scores:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchScores();
    }, []);

    if (loading) {
        return (
            <div className="comic-panel-dark p-4">
                <p className="text-slate-400 text-outline text-center text-sm">Chargement des meilleurs scores...</p>
            </div>
        );
    }

    if (topScores.length === 0) {
        return (
            <div className="comic-panel-dark p-4">
                <p className="text-slate-400 text-outline text-center text-sm">
                    Soyez le premier à établir un record !
                </p>
            </div>
        );
    }

    return (
        <div className="comic-panel-dark p-4">
            <h3 className="text-lg font-bold text-white mb-3 text-outline text-center flex items-center justify-center gap-2">
                <TrophyIcon className="w-5 h-5 text-amber-400" />
                Top 3 Mondial
            </h3>
            <div className="space-y-3">
                {topScores.map((score) => (
                    <div
                        key={score.rank}
                        className="comic-panel bg-slate-800 border-2 border-black p-2 md:p-3 grid grid-cols-[auto_1fr_auto] items-center gap-2 md:gap-3"
                    >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-8 md:w-10">
                            <div className={`comic-panel border-2 border-black w-8 h-8 flex items-center justify-center font-bold text-white text-outline text-xs ${score.rank === 1 ? "bg-amber-500" : score.rank === 2 ? "bg-slate-500" : "bg-orange-700"}`}>
                                {score.rank}
                            </div>
                        </div>

                        {/* Avatar & Name */}
                        <div className="flex justify-center min-w-0">
                            <div className="flex flex-col items-center gap-1 w-full text-center">
                                <div className="h-20 md:h-24 flex items-center justify-center">
                                    <div className="md:hidden">
                                        <LeaderboardAvatar
                                            userId={score.user_id}
                                            username={score.username}
                                            equippedAvatar={score.equippedAvatar}
                                            equippedBackground={score.equippedBackground}
                                            equippedTitle={score.equippedTitle}
                                            size="md"
                                        />
                                    </div>
                                    <div className="hidden md:block">
                                        <LeaderboardAvatar
                                            userId={score.user_id}
                                            username={score.username}
                                            equippedAvatar={score.equippedAvatar}
                                            equippedBackground={score.equippedBackground}
                                            equippedTitle={score.equippedTitle}
                                            size="lg"
                                        />
                                    </div>
                                </div>
                                <div className="text-center w-full min-w-0 px-1">
                                    <div className="font-bold text-white text-outline truncate text-sm md:text-base">{score.username}</div>
                                    {score.equippedTitle && (
                                        <div className="text-[10px] md:text-xs font-semibold text-cyan-400 text-outline truncate">
                                            {score.equippedTitle.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                            {score.rank === 1 && (
                                <TrophyIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-400 flex-shrink-0" />
                            )}
                            <div className="text-base md:text-lg font-bold text-cyan-400 text-outline whitespace-nowrap">
                                {score.score} pts
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
