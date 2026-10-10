import type { SupabaseClient } from "@supabase/supabase-js";

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
  const now = new Date();
  const parisDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // Minuit à Paris, exprimé en UTC (l'écart été/hiver est pris en compte par le formatteur)
  const startOfDayLocal = new Date(`${parisDay}T00:00:00`);
  const offsetMinutes = getParisOffsetMinutes(startOfDayLocal);
  const startOfDayUtc = new Date(startOfDayLocal.getTime() - offsetMinutes * 60 * 1000);

  const { count, error } = await adminClient
    .from("game_scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .gte("created_at", startOfDayUtc.toISOString());

  if (error) {
    return 0;
  }

  return count ?? 0;
}

function getParisOffsetMinutes(date: Date) {
  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const paris = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  return Math.round((paris.getTime() - utc.getTime()) / 60000);
}
