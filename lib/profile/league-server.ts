import "server-only";

import { getNextParisWeekStart, getParisWeekStart } from "@/lib/profile/economy-server";
import { LEAGUE_SIZE, formatLeagueReset, shapeLeagueRows, type LeagueStanding, type WeeklyLeagueRow } from "@/lib/profile/league";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ShopItem } from "@/types/shop";

export type LeagueEntry = LeagueStanding & {
  username: string;
  avatar: ShopItem | null;
  background: ShopItem | null;
  title: ShopItem | null;
};

export type WeeklyLeague = {
  /** Faux si la migration 2026-10-16_10 n'est pas passée ou si la lecture a échoué. */
  available: boolean;
  weekStart: string;
  nextReset: string;
  resetLabel: string;
  totalPlayers: number;
  entries: LeagueEntry[];
  me: LeagueEntry | null;
  meInTop: boolean;
};

type EquippedRow = {
  user_id: string;
  equipped_avatar?: ShopItem | ShopItem[] | null;
  equipped_background?: ShopItem | ShopItem[] | null;
  equipped_title?: ShopItem | ShopItem[] | null;
};

function firstItem(item: ShopItem | ShopItem[] | null | undefined): ShopItem | null {
  return Array.isArray(item) ? item[0] ?? null : item ?? null;
}

function isMissingFunction(error: { code?: string; message?: string } | null) {
  return Boolean(error && (error.code === "PGRST202" || error.code === "42883" || error.code === "42P01"));
}

/**
 * Ligue de la semaine : les `limit` premiers par XP gagnée depuis lundi 00:00
 * (Paris), et le rang du joueur même s'il est plus loin. Avec
 * `withProfiles: false`, pas de pseudo ni d'avatar (carte de l'accueil).
 */
export async function getWeeklyLeague(
  userId: string,
  { limit = LEAGUE_SIZE, withProfiles = true, now = new Date() }: { limit?: number; withProfiles?: boolean; now?: Date } = {}
): Promise<WeeklyLeague> {
  const weekStart = getParisWeekStart(now);
  const nextReset = getNextParisWeekStart(now);
  const empty: WeeklyLeague = {
    available: false,
    weekStart: weekStart.toISOString(),
    nextReset: nextReset.toISOString(),
    resetLabel: formatLeagueReset(now, nextReset),
    totalPlayers: 0,
    entries: [],
    me: null,
    meInTop: false,
  };

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("get_weekly_xp_league", {
      p_since: weekStart.toISOString(),
      p_user_id: userId,
      p_limit: limit,
    });
    if (error) {
      if (!isMissingFunction(error)) console.error("[league] read failed", error);
      return empty;
    }

    const shaped = shapeLeagueRows(data as WeeklyLeagueRow[], userId, limit);
    const standings = shaped.me && !shaped.meInTop ? [...shaped.top, shaped.me] : shaped.top;
    const ids = standings.map((row) => row.userId);
    const profiles = new Map<string, string>();
    const equipped = new Map<string, EquippedRow>();

    if (withProfiles && ids.length > 0) {
      const [profilesResult, equippedResult] = await Promise.all([
        admin.from("profiles").select("id, username").in("id", ids),
        admin
          .from("user_equipped_items")
          .select(
            `
              user_id,
              equipped_avatar:shop_items!equipped_avatar_id(*),
              equipped_background:shop_items!equipped_background_id(*),
              equipped_title:shop_items!equipped_title_id(*)
            `
          )
          .in("user_id", ids),
      ]);
      if (profilesResult.error) console.error("[league] profiles", profilesResult.error);
      if (equippedResult.error) console.error("[league] equipped items", equippedResult.error);
      for (const row of (profilesResult.data ?? []) as Array<{ id: string; username: string | null }>) {
        profiles.set(row.id, row.username ?? "Joueur");
      }
      for (const row of (equippedResult.data ?? []) as EquippedRow[]) {
        equipped.set(row.user_id, row);
      }
    }

    const toEntry = (standing: LeagueStanding): LeagueEntry => {
      const items = equipped.get(standing.userId);
      return {
        ...standing,
        username: profiles.get(standing.userId) ?? "Joueur",
        avatar: firstItem(items?.equipped_avatar),
        background: firstItem(items?.equipped_background),
        title: firstItem(items?.equipped_title),
      };
    };

    return {
      ...empty,
      available: true,
      totalPlayers: shaped.totalPlayers,
      entries: shaped.top.map(toEntry),
      me: shaped.me ? toEntry(shaped.me) : null,
      meInTop: shaped.meInTop,
    };
  } catch (error) {
    console.error("[league] unexpected failure", error);
    return empty;
  }
}
