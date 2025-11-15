"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const adminClient = createSupabaseAdminClient();

  // Compter les utilisateurs par rôle
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("role, xp, gold, level, id, username, created_at");

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw new Error("Erreur lors de la récupération des statistiques");
  }

  const usersByRole = {
    students: profiles?.filter((p) => p.role === "student").length || 0,
    teachers: profiles?.filter((p) => p.role === "teacher").length || 0,
    admins: profiles?.filter((p) => p.role === "admin").length || 0,
  };

  const totalXP = profiles?.reduce((sum, p) => sum + (p.xp || 0), 0) || 0;
  const totalGold = profiles?.reduce((sum, p) => sum + (p.gold || 0), 0) || 0;
  const totalLevel = profiles?.reduce((sum, p) => sum + (p.level || 0), 0) || 0;
  const averageLevel = profiles?.length ? Math.round(totalLevel / profiles.length) : 0;

  // Récupérer les messages (si la table existe)
  let unreadMessages = 0;
  let totalMessages = 0;
  
  try {
    const { data: messages, error: messagesError } = await adminClient
      .from("contact_messages")
      .select("read")
      .order("created_at", { ascending: false });

    if (messagesError) {
      // Vérifier si l'objet d'erreur est vide ou n'a pas de propriétés significatives
      const hasCode = messagesError.code !== undefined && messagesError.code !== null;
      const hasMessage = messagesError.message !== undefined && messagesError.message !== null;
      
      // Si l'objet n'a ni code ni message, c'est probablement un objet vide {}
      // On ignore complètement sans logger
      if (!hasCode && !hasMessage) {
        // Objet vide, on ignore silencieusement (table probablement inexistante)
      } else {
        // Il y a des informations, extraire et vérifier
        const errorCode = hasCode ? String(messagesError.code).trim() : "";
        const errorMessage = hasMessage ? String(messagesError.message).trim() : "";
        
        // Vérifier si c'est une erreur de table inexistante
        const isTableNotFound = 
          errorCode === "42P01" || 
          errorCode === "PGRST116" ||
          (errorMessage !== "" && (
            errorMessage.toLowerCase().includes("does not exist") ||
            errorMessage.toLowerCase().includes("relation") ||
            errorMessage.toLowerCase().includes("not found")
          ));
        
        // Seulement logger si ce n'est pas une erreur de table inexistante
        if (!isTableNotFound) {
          console.error("Error fetching messages:", {
            code: errorCode,
            message: errorMessage,
          });
        }
      }
      // On continue silencieusement sans messages
    } else {
      unreadMessages = messages?.filter((m) => !m.read).length || 0;
      totalMessages = messages?.length || 0;
    }
  } catch (error) {
    // Table n'existe pas encore ou autre erreur, on continue sans messages
    // Pas besoin de logger pour les erreurs de table inexistante
    if (error instanceof Error && error.message) {
      const errorMsg = error.message.toLowerCase();
      if (!errorMsg.includes("does not exist") && 
          !errorMsg.includes("relation") && 
          !errorMsg.includes("not found")) {
        console.error("Unexpected error fetching messages:", error);
      }
    }
  }

  // Utilisateurs récents (5 derniers)
  const recentUsers = (profiles || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      username: p.username,
      role: p.role,
      created_at: p.created_at,
    }));

  // Récupérer les statistiques de visiteurs (si la table existe)
  let totalUniqueVisitors = 0;
  let totalVisits = 0;
  let uniqueVisitorsToday = 0;
  let visitsToday = 0;
  let dailyStats: Array<{ date: string; uniqueVisitors: number; totalVisits: number }> = [];

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Total de visiteurs uniques (tous temps)
    const { data: uniqueVisitorsData, error: uniqueError } = await adminClient
      .from("site_visits")
      .select("visitor_hash", { count: 'exact', head: false });

    if (!uniqueError && uniqueVisitorsData) {
      // Compter les visiteurs uniques
      const uniqueHashes = new Set(uniqueVisitorsData.map(v => v.visitor_hash));
      totalUniqueVisitors = uniqueHashes.size;
    }

    // Total de visites (tous temps)
    const { count: totalVisitsCount, error: totalVisitsError } = await adminClient
      .from("site_visits")
      .select("*", { count: 'exact', head: true });

    if (!totalVisitsError && totalVisitsCount !== null) {
      totalVisits = totalVisitsCount;
    }

    // Visiteurs uniques aujourd'hui
    const { data: todayUniqueData, error: todayUniqueError } = await adminClient
      .from("site_visits")
      .select("visitor_hash")
      .eq("visit_date", today);

    if (!todayUniqueError && todayUniqueData) {
      const todayUniqueHashes = new Set(todayUniqueData.map(v => v.visitor_hash));
      uniqueVisitorsToday = todayUniqueHashes.size;
    }

    // Visites aujourd'hui
    const { count: todayVisitsCount, error: todayVisitsError } = await adminClient
      .from("site_visits")
      .select("*", { count: 'exact', head: true })
      .eq("visit_date", today);

    if (!todayVisitsError && todayVisitsCount !== null) {
      visitsToday = todayVisitsCount;
    }

    // Statistiques par jour (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: dailyData, error: dailyError } = await adminClient
      .from("site_visits")
      .select("visit_date, visitor_hash")
      .gte("visit_date", startDate)
      .order("visit_date", { ascending: false });

    if (!dailyError && dailyData) {
      // Grouper par date
      const dailyMap = new Map<string, { unique: Set<string>; total: number }>();
      
      dailyData.forEach((visit) => {
        const date = visit.visit_date;
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { unique: new Set(), total: 0 });
        }
        const dayData = dailyMap.get(date)!;
        dayData.unique.add(visit.visitor_hash);
        dayData.total += 1;
      });

      // Convertir en array et trier par date (plus récent en premier)
      dailyStats = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          uniqueVisitors: data.unique.size,
          totalVisits: data.total,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30); // Limiter à 30 jours
    }
  } catch (error) {
    // Table n'existe pas encore ou autre erreur, on continue sans statistiques de visiteurs
    // Pas besoin de logger pour les erreurs de table inexistante
  }

  return {
    totalUsers: profiles?.length || 0,
    usersByRole,
    totalXP,
    totalGold,
    averageLevel,
    unreadMessages,
    totalMessages,
    recentUsers,
    visitors: {
      totalUniqueVisitors,
      totalVisits,
      uniqueVisitorsToday,
      visitsToday,
      dailyStats,
    },
  };
}

