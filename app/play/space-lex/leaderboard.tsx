"use client";

/**
 * Lexicon Blaster Leaderboard Component
 * 
 * Displays a single global leaderboard (NO difficulty levels).
 * Shows top players ranked by best score with wave info.
 */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TrophyIcon } from "@/components/ui/game-icons";
import type { ShopItem } from "@/types/shop";
import { LeaderboardAvatar } from "./leaderboard-avatar";

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
        async function fetchLeaderboard() {
            setLoading(true);
            const supabase = createSupabaseBrowserClient();

            // Get the Lexicon Blaster game ID
            const { data: game } = await supabase
                .from("games")
                .select("id")
                .eq("slug", "space-lex")
                .single();

            if (!game) {
                setLoading(false);
                return;
            }

            const gameId = game.id;

            // Get ALL scores for this game (no difficulty filter)
            const { data: scores, error } = await supabase
                .from("game_scores")
                .select("user_id, score, max_score")
                .eq("game_id", gameId)
                .order("score", { ascending: false });

            if (error || !scores || scores.length === 0) {
                setLoading(false);
                return;
            }

            // Get unique user IDs
            const userIds = [...new Set(scores.map((s) => s.user_id))];

            // Fetch usernames
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, username")
                .in("id", userIds);

            const profileMap = new Map(
                (profiles || []).map((p) => [p.id, p.username])
            );

            // Fetch equipped items
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

            // Group by user_id and get best score per user
            const userMap = new Map<
                string,
                { username: string; bestScore: number; maxWave: number; gamesPlayed: number }
            >();

            for (const entry of scores) {
                const userId = entry.user_id;
                const score = entry.score;
                const wave = entry.max_score || 1;
                const username = profileMap.get(userId) || "Unknown";

                if (!userMap.has(userId)) {
                    userMap.set(userId, {
                        username,
                        bestScore: score,
                        maxWave: wave,
                        gamesPlayed: 1,
                    });
                } else {
                    const userData = userMap.get(userId)!;
                    if (score > userData.bestScore) {
                        userData.bestScore = score;
                        userData.maxWave = wave;
                    }
                    userData.gamesPlayed += 1;
                }
            }

            // Convert to array and sort by best score
            const entries: LeaderboardEntry[] = Array.from(userMap.entries())
                .map(([userId, data]) => {
                    const equipped = equippedMap.get(userId);
                    return {
                        user_id: userId,
                        username: data.username,
                        best_score: data.bestScore,
                        max_wave: data.maxWave,
                        games_played: data.gamesPlayed,
                        rank: 0,
                        equipped_avatar: equipped?.avatar || null,
                        equipped_background: equipped?.background || null,
                        equipped_title: equipped?.title || null,
                    };
                })
                .sort((a, b) => b.best_score - a.best_score)
                .map((entry, index) => ({
                    ...entry,
                    rank: index + 1,
                }))
                .slice(0, 10); // Top 10

            setLeaderboard(entries);
            setLoading(false);
        }

        fetchLeaderboard();
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
