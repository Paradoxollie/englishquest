/**
 * Ligue de la semaine : l'XP gagnée depuis lundi 00:00 (heure de Paris).
 *
 * Partie pure : mise en forme des lignes renvoyées par la base, rangs,
 * libellés. La lecture se fait dans lib/profile/league-server.ts.
 */

export const LEAGUE_SIZE = 20;

/** Ligne renvoyée par public.get_weekly_xp_league (bigint arrive en nombre ou en texte). */
export type WeeklyLeagueRow = {
  user_id: string;
  xp: number | string;
  rank: number | string;
  total_players: number | string;
};

export type LeagueStanding = {
  userId: string;
  xp: number;
  rank: number;
};

export type ShapedLeague = {
  top: LeagueStanding[];
  /** Le joueur connecté, même hors du top. Null s'il n'a pas gagné d'XP cette semaine. */
  me: LeagueStanding | null;
  meInTop: boolean;
  totalPlayers: number;
};

function toCount(value: number | string | null | undefined) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

export function shapeLeagueRows(
  rows: WeeklyLeagueRow[] | null | undefined,
  userId: string | null,
  limit = LEAGUE_SIZE
): ShapedLeague {
  const standings = (rows ?? [])
    .map((row) => ({ userId: row.user_id, xp: toCount(row.xp), rank: toCount(row.rank) }))
    .filter((row) => row.userId && row.rank > 0 && row.xp > 0)
    .sort((left, right) => left.rank - right.rank);
  const top = standings.filter((row) => row.rank <= limit).slice(0, limit);
  const me = userId ? standings.find((row) => row.userId === userId) ?? null : null;
  const reported = Math.max(0, ...(rows ?? []).map((row) => toCount(row.total_players)));
  return {
    top,
    me,
    meInTop: Boolean(me && top.some((row) => row.userId === me.userId)),
    totalPlayers: Math.max(reported, standings.length),
  };
}

/** Rang accordé avec « place » : 1re, 2e, 3e… */
export function formatRank(rank: number) {
  return rank === 1 ? "1re" : `${rank}e`;
}

/** « dans 3 jours », « demain soir à minuit »… jusqu'au lundi 00:00 suivant. */
export function formatLeagueReset(now: Date, nextReset: Date) {
  const remaining = nextReset.getTime() - now.getTime();
  const hours = remaining / 3_600_000;
  if (hours <= 24) return "cette nuit à minuit";
  if (hours <= 48) return "demain soir à minuit";
  return `dans ${Math.ceil(hours / 24)} jours`;
}
