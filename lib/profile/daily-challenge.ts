import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateLevelFromXP } from "@/lib/profile/leveling";
import { games } from "@/lib/games/config";

export type DailyChallengeResult = {
    dailyPlayedGames: string[];
    requiredGames: string[];
    bonusGranted: boolean;
    xpBonus: number;
    goldBonus: number;
    dailyGoalReached: boolean;
};

/**
 * Returns the 3 required games for a specific date.
 * Deterministic selection based on the date.
 */
export function getDailyRequiredGames(date: Date = new Date()): string[] {
    if (games.length === 0) return [];

    // Calculate simple day index (epoch days)
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Rotate through games
    // We want 3 games per day.
    // Shift the starting index by 1 each day.
    const count = 3;
    const availableGames = games.filter(g => g.slug !== "coming-soon"); // Filter valid games if needed

    if (availableGames.length < count) {
        return availableGames.map(g => g.slug);
    }

    const required: string[] = [];
    for (let i = 0; i < count; i++) {
        const index = (dayOfYear + i) % availableGames.length;
        required.push(availableGames[index].slug);
    }

    return required;
}

/**
 * Checks and updates the daily challenge status for a user.
 * Should be called after a user completes a game.
 */
export async function checkAndGrantDailyBonus(userId: string, gameSlug: string): Promise<DailyChallengeResult> {
    const adminClient = createSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Get current profile data
    const { data: profile, error } = await adminClient
        .from("profiles")
        .select("daily_played_games, last_game_date, last_daily_bonus_date, xp, gold, level, daily_streak")
        .eq("id", userId)
        .single();

    if (error || !profile) {
        console.error("Error fetching profile for daily challenge:", error);
        return {
            dailyPlayedGames: [],
            requiredGames: [],
            bonusGranted: false,
            xpBonus: 0,
            goldBonus: 0,
            dailyGoalReached: false
        };
    }

    const lastGameDate = profile.last_game_date;
    let dailyPlayedGames: string[] = profile.daily_played_games || [];
    let dailyStreak = profile.daily_streak || 0;

    // Calculate required games for today
    const requiredGames = getDailyRequiredGames(new Date());

    // Calculate yesterday's date
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // 2. Daily tracking logic
    if (lastGameDate !== today) {
        // New day reset
        dailyPlayedGames = [];

        // Streak logic
        if (lastGameDate === yesterdayStr) {
            dailyStreak += 1;
        } else {
            dailyStreak = 1;
        }
    } else {
        // Already played today
        if (dailyStreak === 0) dailyStreak = 1;
    }

    // 3. Add current game to played list if unique
    if (!dailyPlayedGames.includes(gameSlug)) {
        dailyPlayedGames.push(gameSlug);
    }

    // 4. Check for bonus
    let bonusGranted = false;
    let xpBonus = 0;
    let goldBonus = 0;

    // Bonus condition: All required games are in dailyPlayedGames AND bonus not yet claimed
    const allRequiredPlayed = requiredGames.every(slug => dailyPlayedGames.includes(slug));

    // Note: We check if bonus was claimed today.
    if (allRequiredPlayed && profile.last_daily_bonus_date !== today) {
        bonusGranted = true;
        xpBonus = 50;
        goldBonus = 5;
    }

    // 5. Update database
    const updates: any = {
        daily_played_games: dailyPlayedGames,
        last_game_date: today,
        daily_streak: dailyStreak,
    };

    if (bonusGranted) {
        updates.last_daily_bonus_date = today;
        updates.xp = (profile.xp || 0) + xpBonus;
        updates.gold = (profile.gold || 0) + goldBonus;
        updates.level = calculateLevelFromXP(updates.xp);
    }

    const { error: updateError } = await adminClient
        .from("profiles")
        .update(updates)
        .eq("id", userId);

    if (updateError) {
        console.error("Error updating profile for daily challenge:", updateError);
        return {
            dailyPlayedGames,
            requiredGames,
            bonusGranted: false,
            xpBonus: 0,
            goldBonus: 0,
            dailyGoalReached: false
        };
    }

    return {
        dailyPlayedGames,
        requiredGames,
        bonusGranted,
        xpBonus,
        goldBonus,
        dailyGoalReached: allRequiredPlayed
    };
}
