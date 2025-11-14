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
      // Si la table n'existe pas encore, on ignore l'erreur
      // Vérifier plusieurs codes d'erreur possibles pour "table n'existe pas"
      const errorCode = messagesError.code || messagesError.message || "";
      const errorMessage = messagesError.message || "";
      
      if (
        errorCode === "42P01" || 
        errorMessage.includes("does not exist") ||
        errorMessage.includes("relation") ||
        Object.keys(messagesError).length === 0 // Objet vide = probablement table inexistante
      ) {
        // Table n'existe pas encore, on continue sans messages
        // Pas besoin de logger
      } else {
        console.error("Error fetching messages:", messagesError);
      }
    } else {
      unreadMessages = messages?.filter((m) => !m.read).length || 0;
      totalMessages = messages?.length || 0;
    }
  } catch (error) {
    // Table n'existe pas encore ou autre erreur, on continue sans messages
    // Pas besoin de logger pour les erreurs de table inexistante
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

  return {
    totalUsers: profiles?.length || 0,
    usersByRole,
    totalXP,
    totalGold,
    averageLevel,
    unreadMessages,
    totalMessages,
    recentUsers,
  };
}

