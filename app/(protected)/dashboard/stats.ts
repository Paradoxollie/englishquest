"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";

export type DashboardStats = {
  totalUsers: number;
  usersByRole: {
    students: number;
    teachers: number;
    admins: number;
  };
  totalXP: number;
  totalGold: number;
  averageLevel: number;
  unreadMessages: number;
  totalMessages: number;
  recentUsers: Array<{
    id: string;
    username: string;
    role: string;
    created_at: string;
  }>;
  // Statistiques de visiteurs
  visitors: {
    totalUniqueVisitors: number;
    totalVisits: number;
    uniqueVisitorsToday: number;
    visitsToday: number;
    dailyStats: Array<{
      date: string;
      uniqueVisitors: number;
      totalVisits: number;
    }>;
  };
};

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!(await isAdmin())) {
    throw new Error("Accès réservé aux administrateurs.");
  }

  const adminClient = createSupabaseAdminClient();

  const [summary, totalMessages, unreadMessages] = await Promise.all([
    adminClient.rpc("admin_dashboard_summary", { p_today: new Date().toISOString().slice(0, 10) }),
    adminClient.from("contact_messages").select("id", { count: "exact", head: true }),
    adminClient.from("contact_messages").select("id", { count: "exact", head: true }).or("read.eq.false,read.is.null"),
  ]);
  if (summary.error || !summary.data) throw new Error("Les statistiques sont indisponibles.");
  for (const result of [totalMessages, unreadMessages]) {
    if (result.error && !["42P01", "PGRST205"].includes(result.error.code)) {
      throw new Error("Le nombre de messages est indisponible.");
    }
  }
  return {
    ...summary.data,
    unreadMessages: unreadMessages.count ?? 0,
    totalMessages: totalMessages.count ?? 0,
  };
}
