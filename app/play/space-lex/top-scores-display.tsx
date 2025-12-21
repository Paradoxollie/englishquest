"use client";

/**
 * Component to display top scores for Lexicon Blaster
 * Note: This game has NO difficulty levels - single global leaderboard
 */

import { useEffect, useState } from "react";
import { getTopGlobalScores, getUserPersonalBest, type TopScoreEntry } from "./get-top-scores";
import { TrophyIcon } from "@/components/ui/game-icons";
import { LeaderboardAvatar } from "./leaderboard-avatar";

interface TopScoresDisplayProps {
    currentScore?: number;
}

export function TopScoresDisplay({ currentScore }: TopScoresDisplayProps) {
    const [topScores, setTopScores] = useState<TopScoreEntry[]>([]);
    const [personalBest, setPersonalBest] = useState<{ score: number; wave: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScores() {
            setLoading(true);
            const [globalScores, personal] = await Promise.all([
                getTopGlobalScores(),
                getUserPersonalBest(),
            ]);
            setTopScores(globalScores);
            setPersonalBest(personal);
            setLoading(false);
        }

        fetchScores();
    }, [currentScore]); // Refetch when current score changes (after game ends)

    if (loading) {
        return (
            <div className="comic-panel-dark p-4">
                <p className="text-slate-300 text-outline text-sm">Chargement des scores...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Global Top 3 */}
            <div className="comic-panel-dark p-4">
                <h3 className="text-lg font-bold text-white mb-3 text-outline text-center">
                    🏆 Top 3 Global
                </h3>
                {topScores.length === 0 ? (
                    <p className="text-slate-400 text-outline text-sm text-center">
                        Aucun score enregistré
                    </p>
                ) : (
                    <div className="space-y-2">
                        {topScores.map((entry) => (
                            <div
                                key={entry.user_id}
                                className="comic-panel bg-slate-800 border-2 border-black p-2 md:p-3 grid grid-cols-[auto_1fr_auto] items-center gap-2 md:gap-3"
                            >
                                {/* Rank */}
                                <div className="flex items-center justify-center w-8 md:w-10">
                                    <div
                                        className="comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black w-8 h-8 flex items-center justify-center font-bold text-white text-outline text-xs"
                                    >
                                        {entry.rank}
                                    </div>
                                </div>

                                {/* Avatar and name */}
                                <div className="flex justify-center min-w-0">
                                    <div className="flex flex-col items-center gap-1 w-full">
                                        <div className="h-20 md:h-24 flex items-center justify-center">
                                            {/* Mobile Avatar (MD) */}
                                            <div className="md:hidden">
                                                <LeaderboardAvatar
                                                    userId={entry.user_id}
                                                    username={entry.username}
                                                    equippedAvatar={entry.equipped_avatar}
                                                    equippedBackground={entry.equipped_background}
                                                    equippedTitle={entry.equipped_title}
                                                    size="md"
                                                />
                                            </div>
                                            {/* Desktop Avatar (LG) */}
                                            <div className="hidden md:block">
                                                <LeaderboardAvatar
                                                    userId={entry.user_id}
                                                    username={entry.username}
                                                    equippedAvatar={entry.equipped_avatar}
                                                    equippedBackground={entry.equipped_background}
                                                    equippedTitle={entry.equipped_title}
                                                    size="lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center w-full min-w-0 px-1">
                                            <div className="font-bold text-white text-outline truncate text-sm md:text-base">{entry.username}</div>
                                            {entry.equipped_title && (
                                                <div className="text-[10px] md:text-xs font-semibold text-cyan-400 text-outline truncate">
                                                    {entry.equipped_title.name}
                                                </div>
                                            )}
                                            <div className="text-[10px] md:text-xs text-slate-400">Wave {entry.wave}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                    {entry.rank === 1 && (
                                        <TrophyIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-400 flex-shrink-0" />
                                    )}
                                    <div className="text-base md:text-lg font-bold text-cyan-400 text-outline whitespace-nowrap">
                                        {entry.score.toLocaleString('fr-FR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Personal Best */}
            <div className="comic-panel-dark p-4">
                <h3 className="text-lg font-bold text-white mb-3 text-outline text-center">
                    ⭐ Votre Meilleur Score
                </h3>
                {personalBest === null ? (
                    <p className="text-slate-400 text-outline text-sm text-center">
                        Aucun score enregistré
                    </p>
                ) : (
                    <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400 text-outline mb-1">
                            {personalBest.score.toLocaleString('fr-FR')}
                        </div>
                        <div className="text-sm text-slate-400">Wave {personalBest.wave}</div>
                        {currentScore !== undefined && currentScore > personalBest.score && (
                            <p className="text-sm text-emerald-400 text-outline mt-2">
                                🎉 Nouveau record personnel!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
