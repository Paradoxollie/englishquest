"use client";

/**
 * Top Scores Display for Flash Translation
 * 
 * Shows the top 3 global scores before the game starts.
 */

import { useEffect, useState } from "react";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "@/app/play/speed-verb-challenge/leaderboard-avatar";
import type { ShopItem } from "@/types/shop";

interface TopScore {
    user_id: string; // Add user_id
    username: string;
    score: number; // Time in ms
    rank: number;
    equipped_avatar?: ShopItem | null;
    equipped_background?: ShopItem | null;
    equipped_title?: ShopItem | null;
}

export function TopScoresDisplay() {
    const [topScores, setTopScores] = useState<TopScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScores() {
            try {
                const { getFlashTranslationTopScores } = await import("./actions");
                const scores = await getFlashTranslationTopScores();
                setTopScores(scores);
            } catch (error) {
                console.error("Failed to fetch top scores:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchScores();
    }, []);

    if (loading) {
        return (
            <div className="comic-panel-dark p-4">
                <p className="text-slate-400 text-outline text-center text-sm">
                    Chargement des meilleurs scores...
                </p>
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
                        className="comic-panel bg-slate-800 border-2 border-black p-3 grid grid-cols-[100px_1fr_100px] items-start gap-3"
                    >
                        {/* Rank */}
                        <div className="flex items-center justify-start pl-2">
                            <div
                                className={`comic-panel border-2 border-black w-8 h-8 flex items-center justify-center font-bold text-white text-outline text-xs
                                ${score.rank === 1 ? "bg-amber-500" : score.rank === 2 ? "bg-slate-500" : "bg-orange-700"}
                                `}
                            >
                                {score.rank}
                            </div>
                        </div>

                        {/* Avatar & Name - Centered */}
                        <div className="flex justify-center">
                            <div className="flex flex-col items-center gap-1">
                                <div className="h-24 flex items-center justify-center">
                                    <LeaderboardAvatar
                                        userId={score.user_id}
                                        username={score.username}
                                        equippedAvatar={score.equipped_avatar}
                                        equippedBackground={score.equipped_background}
                                        equippedTitle={score.equipped_title}
                                        size="lg"
                                    />
                                </div>
                                <div className="text-center min-w-0 max-w-full">
                                    <div className="font-bold text-white text-outline truncate">{score.username}</div>
                                    {score.equipped_title && (
                                        <div className="text-xs font-semibold text-cyan-400 text-outline truncate">
                                            {score.equipped_title.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Score (Right) */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                            {score.rank === 1 && (
                                <TrophyIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            )}
                            <div className="text-lg font-bold text-cyan-400 text-outline">
                                {(score.score / 1000).toFixed(2)}s
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
