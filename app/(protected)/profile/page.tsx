import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import type { Profile } from "@/types/profile";
import { MotionCard } from "@/components/ui/motion-card";
import { XPIcon, GoldIcon, LevelIcon, AvatarIcon, ScrollIcon, GiftIcon, GameIcon } from "@/components/ui/icons";
import { CustomizationDisplay } from "./customization-display";
import { ShopSection } from "./shop/shop-section";
import { AvatarDisplay } from "./avatar-display";
import { TitleDisplay } from "./title-display";

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Calcule l'XP nécessaire pour passer au niveau suivant
 * Formule : XP_required = level * 1000
 */
function getXPForNextLevel(level: number): number {
  return level * 1000;
}

/**
 * Calcule le pourcentage de progression vers le prochain niveau
 */
function getXPProgress(currentXP: number, level: number): { current: number; required: number; percentage: number } {
  const required = getXPForNextLevel(level);
  const percentage = required > 0 ? Math.min((currentXP / required) * 100, 100) : 0;
  return {
    current: currentXP,
    required,
    percentage: Math.round(percentage),
  };
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Error getting user in ProfilePage:", {
      message: userError.message,
      status: userError.status,
    });
  }
  
  if (!user) {
    console.log("No user found in ProfilePage, redirecting to login");
    redirect("/auth/login");
  }

  // Charger le profil de l'utilisateur actuel
  let { data: profileData, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile in ProfilePage:", {
      code: error.code,
      message: error.message,
    });
  }

  // Si le profil n'existe pas, le créer
  if (!profileData && user) {
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

    if (!createError) {
      profileData = newProfile;
    }
  }

  const profile = profileData as Profile | null;

  if (!profile) {
    return (
      <section className="space-y-6 text-slate-200">
        <div>
          <h2 className="text-2xl font-semibold text-white">Profil</h2>
          <p className="text-sm text-slate-400">
            Données de profil introuvables. Veuillez actualiser la page ou contacter le support.
          </p>
        </div>
      </section>
    );
  }

  // Récupérer les meilleurs scores de jeux pour cet utilisateur
  const { data: bestScores } = await adminClient
    .from("game_scores")
    .select(`
      score,
      created_at,
      games (
        id,
        name
      )
    `)
    .eq("user_id", user.id)
    .order("score", { ascending: false })
    .limit(5);

  // Récupérer le niveau de cours le plus haut atteint
  const { data: courseProgress } = await adminClient
    .from("user_course_progress")
    .select(`
      status,
      courses (
        id,
        course_number,
        title
      )
    `)
    .eq("user_id", user.id)
    .in("status", ["unlocked", "in_progress", "completed"]);

  // Trouver le cours avec le numéro le plus élevé
  let highestCourse: { course_number: number; title: string } | null = null;
  if (courseProgress && courseProgress.length > 0) {
    const coursesWithNumbers = courseProgress
      .map((cp: any) => {
        const course = cp.courses as { course_number: number; title: string } | null;
        return course ? { course_number: course.course_number, title: course.title } : null;
      })
      .filter((c: any) => c !== null) as { course_number: number; title: string }[];
    
    if (coursesWithNumbers.length > 0) {
      highestCourse = coursesWithNumbers.reduce((max, current) => 
        current.course_number > max.course_number ? current : max
      );
    }
  }

  const xpProgress = getXPProgress(profile.xp, profile.level);
  const roleLabels: Record<string, string> = {
    student: "Élève",
    teacher: "Professeur",
    admin: "Administrateur",
  };

  // Vérifier si l'utilisateur est admin
  const userIsAdmin = await isAdmin();

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Mon profil</h1>
            <p className="mt-2 text-lg text-slate-400">Gérez vos informations et consultez vos statistiques</p>
          </div>
          {userIsAdmin && (
            <Link
              href="/dashboard"
              className="comic-button bg-cyan-500 text-white px-6 py-3 font-bold hover:bg-cyan-600 transition-colors w-full sm:w-auto text-center"
            >
              Dashboard Admin
            </Link>
          )}
        </div>
      </div>

      {/* Player Panel Card */}
      <MotionCard className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-950/30 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-slate-900/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-emerald-900/3" />
          
          <div className="relative z-10 space-y-6">
            {/* Player Header */}
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <AvatarDisplay userId={user.id} username={profile.username} size="md" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {roleLabels[profile.role] || profile.role}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{profile.username}</p>
                  <TitleDisplay userId={user.id} />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2 border-2 border-black">
                <LevelIcon className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">Niveau {profile.level}</span>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-400">
                  <XPIcon className="w-4 h-4 text-emerald-500" />
                  <span>Points d'expérience</span>
                </div>
                <span className="font-semibold text-slate-400">{xpProgress.current.toLocaleString('fr-FR')} / {xpProgress.required.toLocaleString('fr-FR')}</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-slate-900/60">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 to-emerald-900/20" />
                <div 
                  className="relative h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-950/40"
                  style={{ width: `${xpProgress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-950/30 bg-slate-900/30 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <XPIcon className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">XP</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{profile.xp.toLocaleString('fr-FR')}</p>
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <GoldIcon className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Or</p>
                </div>
                <p className="text-2xl font-bold text-amber-300">{profile.gold.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>
      </MotionCard>

      {/* Account Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <MotionCard>
          <div className="group relative h-full overflow-hidden rounded-2xl border border-emerald-950/30 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-900/30 hover:shadow-[0_20px_60px_rgba(6,78,59,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-emerald-900/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-black shadow-lg">
                <AvatarIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Informations du compte</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Nom d'utilisateur</dt>
                  <dd className="text-lg font-semibold text-white">{profile.username}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Rôle</dt>
                  <dd className="text-lg font-semibold text-emerald-400">{roleLabels[profile.role] || profile.role}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Email</dt>
                  <dd className="text-lg text-slate-300">{profile.email ?? "Non renseigné"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </MotionCard>

        <MotionCard>
          <div className="group relative h-full overflow-hidden rounded-2xl border border-emerald-950/30 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-900/30 hover:shadow-[0_20px_60px_rgba(6,78,59,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-emerald-900/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-black shadow-lg">
                <ScrollIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Statistiques</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Niveau actuel</dt>
                  <dd className="text-lg font-semibold text-emerald-400">Niveau {profile.level}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Progression XP</dt>
                  <dd className="text-lg text-slate-400">{xpProgress.percentage}% vers le niveau {profile.level + 1}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Cours le plus haut</dt>
                  <dd className="text-lg text-slate-300">
                    {highestCourse 
                      ? `Cours ${highestCourse.course_number}: ${highestCourse.title}`
                      : "Aucun cours commencé"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Membre depuis</dt>
                  <dd className="text-lg text-slate-400">
                    {new Date(profile.created_at).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </MotionCard>
      </div>

      {/* Personnalisation */}
      <MotionCard>
        <CustomizationDisplay userId={user.id} username={profile.username} />
      </MotionCard>

      {/* Boutique */}
      <MotionCard>
        <div className="comic-panel-dark p-6" style={{ position: "relative", zIndex: 1, pointerEvents: "auto" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="comic-panel bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-black p-2">
              <GiftIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white text-outline">Boutique</h2>
          </div>
          <div style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}>
            <ShopSection
              userLevel={profile.level}
              userGold={profile.gold}
              userId={user.id}
            />
          </div>
        </div>
      </MotionCard>

      {/* Meilleurs scores */}
      {bestScores && bestScores.length > 0 && (
        <MotionCard>
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-950/30 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-900/30 hover:shadow-[0_20px_60px_rgba(6,78,59,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-emerald-900/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-black shadow-lg">
                <GameIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Meilleurs scores</h3>
              <div className="space-y-3">
                {bestScores.map((scoreData: any, index: number) => {
                  const game = scoreData.games as { name: string } | null;
                  return (
                    <div key={index} className="flex items-center justify-between rounded-lg border border-slate-800/40 bg-slate-900/30 p-4">
                      <div>
                        <p className="font-semibold text-white">{game?.name || "Jeu inconnu"}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(scoreData.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-400">{scoreData.score.toLocaleString('fr-FR')}</p>
                        <p className="text-xs text-slate-500">points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </MotionCard>
      )}
    </div>
  );
}

