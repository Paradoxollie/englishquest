import type { SupabaseClient } from "@supabase/supabase-js";
import { getLevelFromXP } from "@/lib/profile/economy";

/** Minuit à Paris, sans dépendre du fuseau du serveur. */
export function getParisDayStart(date = new Date()): Date {
  const { year, month, day } = getParisCalendarDate(date);
  return getParisMidnight(year, month, day);
}

/**
 * Lundi 00:00 à Paris de la semaine en cours (semaine du lundi au dimanche),
 * sans dépendre du fuseau du serveur. Sert à la ligue de la semaine.
 */
export function getParisWeekStart(date = new Date()): Date {
  const { year, month, day } = getParisCalendarDate(date);
  // Jour de la semaine du calendrier parisien : 0 = dimanche, 1 = lundi…
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const monday = new Date(Date.UTC(year, month - 1, day - ((weekday + 6) % 7)));
  return getParisMidnight(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate());
}

/** Lundi suivant, 00:00 à Paris : la prochaine remise à zéro de la ligue. */
export function getNextParisWeekStart(date = new Date()): Date {
  const start = getParisWeekStart(date);
  const { year, month, day } = getParisCalendarDate(new Date(start.getTime() + 12 * 3_600_000));
  return getParisMidnight(year, month, day + 7);
}

function getParisCalendarDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

/** Instant UTC de minuit à Paris pour une date du calendrier (jour hors bornes accepté). */
function getParisMidnight(year: number, month: number, day: number): Date {
  const midnight = Date.UTC(year, month - 1, day);
  let utc = midnight;
  for (let i = 0; i < 2; i += 1) {
    utc = midnight - getParisOffsetMinutes(new Date(utc)) * 60_000;
  }
  return new Date(utc);
}

/**
 * Addition conditionnelle : si une autre partie modifie le solde entre la
 * lecture et l'écriture, relire le solde au lieu d'écraser sa récompense.
 */
export async function grantProfileRewards(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: SupabaseClient<any, any, any>,
  userId: string,
  reward: { xp: number; gold: number }
): Promise<{ xp: number; gold: number; level: number; previousLevel: number }> {
  if (![reward.xp, reward.gold].every((value) => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error("Invalid profile reward");
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: profile, error } = await adminClient.from("profiles")
      .select("xp, gold, level").eq("id", userId).single();
    if (error || !profile) throw error ?? new Error("Profile not found");
    const xp = (profile.xp ?? 0) + reward.xp;
    const gold = (profile.gold ?? 0) + reward.gold;
    const level = getLevelFromXP(xp);
    let update = adminClient.from("profiles")
      .update({ xp, gold, level, updated_at: new Date().toISOString() }).eq("id", userId);
    for (const column of ["xp", "gold", "level"] as const) {
      update = profile[column] == null ? update.is(column, null) : update.eq(column, profile[column]);
    }
    const { data: updated, error: updateError } = await update.select("id").maybeSingle();
    if (updateError) throw updateError;
    if (updated) return { xp, gold, level, previousLevel: profile.level ?? 1 };
  }
  throw new Error("Profile changed repeatedly while granting rewards");
}

/**
 * Nombre de parties déjà enregistrées aujourd'hui (heure de Paris) pour un
 * joueur et un jeu. Sert au tarif dégressif de l'économie.
 */
export async function countPlaysToday(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: SupabaseClient<any, any, any>,
  userId: string,
  gameId: string
): Promise<number> {
  const startOfDayUtc = getParisDayStart();

  const { count, error } = await adminClient
    .from("game_scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .gte("created_at", startOfDayUtc.toISOString());

  if (error) {
    throw error;
  }

  return count ?? 0;
}

function getParisOffsetMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const wallTime = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  return Math.round((wallTime - date.getTime()) / 60_000);
}
