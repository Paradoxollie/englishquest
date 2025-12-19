"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProfileRole } from "@/types/profile";

/**
 * Vérifie si l'utilisateur actuel est admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Use the SQL function to avoid RLS recursion issues
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient.rpc("is_admin_user");

    // If RPC function exists and works, use it
    if (!error && typeof data === "boolean") {
      return data;
    }

    // Fallback: query directly with admin client (should bypass RLS)
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error checking admin role:", profileError);
      return false;
    }

    return profile?.role === "admin";
  } catch (error) {
    console.error("Error in isAdmin():", error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur actuel est admin ou teacher
 */
export async function isAdminOrTeacher(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error checking admin/teacher role:", error);
      return false;
    }

    return profile?.role === "admin" || profile?.role === "teacher";
  } catch (error) {
    console.error("Error in isAdminOrTeacher():", error);
    return false;
  }
}

/**
 * Récupère le rôle de l'utilisateur actuel
 */
export async function getCurrentUserRole(): Promise<ProfileRole | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (profile?.role as ProfileRole) || null;
}


