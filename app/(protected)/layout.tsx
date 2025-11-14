import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/profile";
import { logoutAction } from "./actions";

// Force dynamic rendering - this layout requires authentication
export const dynamic = 'force-dynamic';

// When we ship the real Play/Quest/Profile/Teachers/Dashboard pages, update this list
// to point to the new routes or add/remove entries as needed.
// Navigation supprimée - elle est déjà dans le header global (AppHeader)

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await createSupabaseServerClient();
  
  // Vérifie d'abord la session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("Session error in ProtectedLayout:", {
      message: sessionError.message,
      status: sessionError.status,
    });
  }
  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error getting user in ProtectedLayout:", {
      message: userError.message,
      status: userError.status,
    });
  }

  if (!user) {
    console.log("No user found in ProtectedLayout, redirecting to login");
    redirect("/auth/login");
  }
  
  // Utiliser le client admin pour contourner RLS et s'assurer de récupérer le profil
  const adminClient = createSupabaseAdminClient();
  
  let { data: profileData, error: profileError } = await adminClient
    .from("profiles")
    .select("id, username, role, xp, gold, level, avatar_id, created_at, updated_at, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error loading profile in ProtectedLayout:", {
      code: profileError.code,
      message: profileError.message,
    });
  }

  let profile = profileData as Profile | null;

  // Si le profil n'existe pas, créons-le maintenant
  if (!profile && user) {
    const username = user.user_metadata?.username || user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`;
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 50);
    
    const { data: newProfile, error: createError } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        username: cleanUsername,
        email: user.email || null,
        role: "student",
        xp: 0,
        gold: 0,
        level: 1,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating profile in ProtectedLayout:", {
        code: createError.code,
        message: createError.message,
      });
    } else {
      profile = newProfile as Profile;
    }
  }

  // Si on n'a toujours pas de profil après avoir essayé de le créer, on redirige
  if (!profile) {
    console.log("Could not create profile, redirecting to login");
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-stone-950 comic-dot-pattern">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 md:py-12">
        {/* Header simplifié - la navigation est déjà dans le header global (AppHeader) */}
        <header className="comic-panel-dark flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-bold text-outline">EnglishQuest</p>
            <h1 className="text-3xl font-bold text-white text-outline">
              Welcome back, <span className="text-cyan-300 text-outline">{profile.username}</span>
            </h1>
            <p className="text-sm text-slate-400 text-outline">
              Role: <span className="font-bold text-amber-300 text-outline">{profile.role}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="comic-panel border-2 border-black px-4 py-2" style={{ background: '#059669' }}>
              <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>XP</span> <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>{profile.xp}</span>
            </div>
            <div className="comic-panel border-2 border-black px-4 py-2" style={{ background: '#d97706' }}>
              <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>Gold</span> <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>{profile.gold}</span>
            </div>
            <div className="comic-panel border-2 border-black px-4 py-2" style={{ background: '#0891b2' }}>
              <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>Level</span> <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>{profile.level}</span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="comic-button bg-slate-700 text-white px-4 py-2 text-sm font-bold hover:bg-slate-600"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1">
          <div className="comic-panel-dark w-full p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

