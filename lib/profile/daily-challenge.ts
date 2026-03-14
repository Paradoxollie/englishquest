import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { games } from "@/lib/games/config";
import { calculateLevelFromXP } from "@/lib/profile/leveling";

export const DAILY_CHALLENGE_TIME_ZONE = "Europe/Paris";
export const DAILY_CHALLENGE_TARGET_COUNT = 3;
export const DAILY_CHALLENGE_XP_BONUS = 30;
export const DAILY_CHALLENGE_GOLD_BONUS = 3;

type DailyChallengeProfile = {
  daily_played_games?: string[] | null;
  last_game_date?: string | null;
  last_daily_bonus_date?: string | null;
  daily_streak?: number | null;
  xp?: number | null;
  gold?: number | null;
  level?: number | null;
};

export type DailyChallengeState = {
  challengeDate: string;
  challengeLabel: string;
  nextRefreshLabel: string;
  dailyPlayedGames: string[];
  requiredGames: string[];
  dailyGoalProgress: number;
  dailyGoalTarget: number;
  dailyGoalReached: boolean;
  bonusClaimedToday: boolean;
  xpBonus: number;
  goldBonus: number;
  dailyStreak: number;
};

export type DailyChallengeResult = DailyChallengeState & {
  bonusGranted: boolean;
};

function formatDateKey(date: Date, timeZone = DAILY_CHALLENGE_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function formatChallengeLabel(date: Date, timeZone = DAILY_CHALLENGE_TIME_ZONE) {
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed || 1;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function getAvailableDailyGames() {
  return games
    .map((game) => game.slug)
    .filter((slug, index, collection) => collection.indexOf(slug) === index);
}

function getYesterdayDateKey(date: Date, timeZone = DAILY_CHALLENGE_TIME_ZONE) {
  return formatDateKey(new Date(date.getTime() - 24 * 60 * 60 * 1000), timeZone);
}

function sanitizePlayedGames(playedGames: string[] | null | undefined) {
  const validSlugs = new Set(getAvailableDailyGames());

  return [...new Set((playedGames ?? []).filter((slug) => validSlugs.has(slug)))];
}

export function getDailyRequiredGames(date: Date = new Date()): string[] {
  const availableGames = getAvailableDailyGames();

  if (availableGames.length <= DAILY_CHALLENGE_TARGET_COUNT) {
    return availableGames;
  }

  const seed = hashString(formatDateKey(date));
  const random = createSeededRandom(seed);
  const shuffled = [...availableGames];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, DAILY_CHALLENGE_TARGET_COUNT);
}

export function getDailyChallengeState(
  profile: DailyChallengeProfile | null | undefined,
  date: Date = new Date()
): DailyChallengeState {
  const challengeDate = formatDateKey(date);
  const requiredGames = getDailyRequiredGames(date);
  const lastGameDate = profile?.last_game_date ?? null;
  const playedToday =
    lastGameDate === challengeDate ? sanitizePlayedGames(profile?.daily_played_games) : [];
  const dailyGoalProgress = requiredGames.filter((slug) => playedToday.includes(slug)).length;
  const yesterdayDate = getYesterdayDateKey(date);
  const rawStreak = profile?.daily_streak ?? 0;
  const dailyStreak =
    lastGameDate === challengeDate || lastGameDate === yesterdayDate ? rawStreak : 0;

  return {
    challengeDate,
    challengeLabel: formatChallengeLabel(date),
    nextRefreshLabel: "Nouveau tirage demain",
    dailyPlayedGames: playedToday,
    requiredGames,
    dailyGoalProgress,
    dailyGoalTarget: requiredGames.length,
    dailyGoalReached: dailyGoalProgress >= requiredGames.length,
    bonusClaimedToday: profile?.last_daily_bonus_date === challengeDate,
    xpBonus: DAILY_CHALLENGE_XP_BONUS,
    goldBonus: DAILY_CHALLENGE_GOLD_BONUS,
    dailyStreak,
  };
}

/**
 * Checks and updates the daily challenge status for a user.
 * Should be called after a user completes a game.
 */
export async function checkAndGrantDailyBonus(
  userId: string,
  gameSlug: string
): Promise<DailyChallengeResult> {
  const adminClient = createSupabaseAdminClient();
  const now = new Date();
  const today = formatDateKey(now);
  const yesterday = getYesterdayDateKey(now);

  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("daily_played_games, last_game_date, last_daily_bonus_date, xp, gold, level, daily_streak")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for daily challenge:", error);
    return {
      ...getDailyChallengeState(null, now),
      bonusGranted: false,
    };
  }

  const dailyPlayedGames =
    profile.last_game_date === today ? sanitizePlayedGames(profile.daily_played_games) : [];
  let dailyStreak = profile.daily_streak ?? 0;

  if (profile.last_game_date !== today) {
    if (profile.last_game_date === yesterday) {
      dailyStreak += 1;
    } else {
      dailyStreak = 1;
    }
  } else if (dailyStreak === 0) {
    dailyStreak = 1;
  }

  if (!dailyPlayedGames.includes(gameSlug)) {
    dailyPlayedGames.push(gameSlug);
  }

  const requiredGames = getDailyRequiredGames(now);
  const dailyGoalProgress = requiredGames.filter((slug) =>
    dailyPlayedGames.includes(slug)
  ).length;
  const dailyGoalReached = dailyGoalProgress >= requiredGames.length;
  const bonusGranted =
    dailyGoalReached && profile.last_daily_bonus_date !== today;

  const updates: {
    daily_played_games: string[];
    last_game_date: string;
    daily_streak: number;
    last_daily_bonus_date?: string;
    xp?: number;
    gold?: number;
    level?: number;
  } = {
    daily_played_games: dailyPlayedGames,
    last_game_date: today,
    daily_streak: dailyStreak,
  };

  if (bonusGranted) {
    const nextXP = (profile.xp ?? 0) + DAILY_CHALLENGE_XP_BONUS;
    const nextGold = (profile.gold ?? 0) + DAILY_CHALLENGE_GOLD_BONUS;

    updates.last_daily_bonus_date = today;
    updates.xp = nextXP;
    updates.gold = nextGold;
    updates.level = calculateLevelFromXP(nextXP);
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating profile for daily challenge:", updateError);
    return {
      ...getDailyChallengeState(profile, now),
      bonusGranted: false,
    };
  }

  return {
    challengeDate: today,
    challengeLabel: formatChallengeLabel(now),
    nextRefreshLabel: "Nouveau tirage demain",
    dailyPlayedGames,
    requiredGames,
    dailyGoalProgress,
    dailyGoalTarget: requiredGames.length,
    dailyGoalReached,
    bonusClaimedToday: bonusGranted || profile.last_daily_bonus_date === today,
    xpBonus: DAILY_CHALLENGE_XP_BONUS,
    goldBonus: DAILY_CHALLENGE_GOLD_BONUS,
    dailyStreak,
    bonusGranted,
  };
}
