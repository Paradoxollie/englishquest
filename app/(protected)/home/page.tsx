import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminOrTeacher } from "@/lib/auth/roles";
import { getUserHomeData } from "./user-data";
import { GameIcon, QuestIcon, TeacherIcon, FlameIcon, TrophyIcon, BookIcon } from "@/components/ui/icons";
import type { Profile } from "@/types/profile";

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Récupérer les données réelles de l'utilisateur
  const userData = await getUserHomeData(user.id);
  const canAccessTeachers = await isAdminOrTeacher();

  // Récupérer le profil pour le header
  const adminClient = createSupabaseAdminClient();
  const { data: profileData } = await adminClient
    .from("profiles")
    .select("username, role, xp, gold, level")
    .eq("id", user.id)
    .maybeSingle();
  
  const profile = profileData as Profile | null;

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header avec infos utilisateur */}
      {profile && (
        <header className="comic-panel-dark flex flex-col gap-3 md:gap-6 p-3 md:p-6 md:flex-row md:items-center md:justify-between mb-4 md:mb-8">
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-cyan-300 font-bold text-outline">EnglishQuest</p>
            <h1 className="text-xl md:text-3xl font-bold text-white text-outline leading-tight md:leading-normal break-words">
              Welcome back, <span className="text-cyan-300 text-outline">{profile.username}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 text-outline break-words">
              Role: <span className="font-bold text-amber-300 text-outline">{profile.role}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm flex-shrink-0">
            <div className="comic-panel border-2 md:border-4 border-black px-2 py-1.5 md:px-4 md:py-2" style={{ background: '#059669' }}>
              <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>XP</span> <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>{profile.xp}</span>
            </div>
            <div className="comic-panel border-2 md:border-4 border-black px-2 py-1.5 md:px-4 md:py-2" style={{ background: '#d97706' }}>
              <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>Gold</span> <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>{profile.gold}</span>
            </div>
            <div className="comic-panel border-2 md:border-4 border-black px-2 py-1.5 md:px-4 md:py-2" style={{ background: '#0891b2' }}>
              <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>Level</span> <span className="font-bold text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.9)' }}>{profile.level}</span>
            </div>
          </div>
        </header>
      )}
        {/* Section principale avec les activités - Style BD avec contours noirs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Le jeu du jour - Grande carte mise en avant */}
          <Link
            href="/play"
            className="comic-card-dark group relative p-8 md:col-span-2 lg:col-span-1"
            style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500 p-3">
                  <FlameIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 text-outline">Jeu du jour</p>
                  <p className="text-2xl font-bold text-white text-outline">Défi quotidien</p>
                </div>
              </div>
              <p className="mb-4 text-slate-300 text-outline">
                Complète 3 jeux aujourd'hui pour gagner un bonus de 50 XP et 20 pièces d'or !
              </p>
              <div className="mb-4">
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={`h-8 w-8 rounded-lg border-2 border-black flex items-center justify-center font-bold text-sm ${
                        num <= userData.dailyGoalProgress
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {num <= userData.dailyGoalProgress ? "✓" : num}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {userData.gamesPlayedToday}/3 jeux joués aujourd'hui
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <span className="font-semibold">Commencer →</span>
              </div>
            </div>
          </Link>

          {/* Continuer l'aventure */}
          <Link
            href="/quest"
            className="comic-card-dark group relative p-8"
            style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500 p-3">
                  <QuestIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 text-outline">Aventure</p>
                  <p className="text-2xl font-bold text-white text-outline">Continuer l'aventure</p>
                </div>
              </div>
              <p className="mb-4 text-slate-300 text-outline">
                {userData.currentCourse
                  ? `Continue le cours #${userData.currentCourse.course_number}: ${userData.currentCourse.title}`
                  : "Commence ton premier cours et progresse dans ton parcours d'apprentissage."}
              </p>
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <span className="font-semibold">
                  {userData.currentCourse ? "Continuer →" : "Commencer →"}
                </span>
              </div>
            </div>
          </Link>

          {/* Choisir son jeu */}
          <Link
            href="/play"
            className="comic-card-dark group relative p-8"
            style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-purple-500 p-3">
                  <GameIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-300 text-outline">Jeux</p>
                  <p className="text-2xl font-bold text-white text-outline">Choisir son jeu</p>
                </div>
              </div>
              <p className="mb-4 text-slate-300 text-outline">
                Explore tous les jeux disponibles et trouve celui qui te plaît le plus !
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <span className="font-semibold">Explorer →</span>
              </div>
            </div>
          </Link>

          {/* Le coin des profs - Seulement pour les profs */}
          {canAccessTeachers && (
            <Link
              href="/teachers"
              className="comic-card-dark group relative p-8"
              style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500 p-3">
                    <TeacherIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 text-outline">Professeurs</p>
                    <p className="text-2xl font-bold text-white text-outline">Le coin des profs</p>
                  </div>
                </div>
                <p className="mb-4 text-slate-300 text-outline">
                  Accède aux cours, activités et ressources pour tes élèves.
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-300">
                  <span className="font-semibold">Accéder →</span>
                </div>
              </div>
            </Link>
          )}

          {/* Classement */}
          <Link
            href="/leaderboard"
            className="comic-card-dark group relative p-8"
            style={{ background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-yellow-500 p-3">
                  <TrophyIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-300 text-outline">Classement</p>
                  <p className="text-2xl font-bold text-white text-outline">Voir le classement</p>
                </div>
              </div>
              <p className="mb-4 text-slate-300 text-outline">
                Découvre où tu te situes parmi les autres apprenants !
              </p>
              <div className="flex items-center gap-2 text-sm text-yellow-300">
                <span className="font-semibold">Voir →</span>
              </div>
            </div>
          </Link>

          {/* Bibliothèque de cours */}
          <Link
            href="/tous-les-cours"
            className="comic-card-dark group relative p-8"
            style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-500 p-3">
                  <BookIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 text-outline">Bibliothèque</p>
                  <p className="text-2xl font-bold text-white text-outline">Tous les cours</p>
                </div>
              </div>
              <p className="mb-4 text-slate-300 text-outline">
                Explore tous les cours disponibles et choisis celui qui t'intéresse.
              </p>
              <div className="flex items-center gap-2 text-sm text-indigo-300">
                <span className="font-semibold">Explorer →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Section "Continue ta série" - Style BD */}
        <div
          className="comic-panel-dark mt-8 p-6"
          style={{ background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)" }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 text-outline">
                <span className="text-3xl">🔥</span> Continue ta série !
              </h2>
              <p className="text-slate-300 text-outline">
                {userData.dailyStreak > 0
                  ? `Tu es sur une série de ${userData.dailyStreak} jour${userData.dailyStreak > 1 ? "s" : ""} consécutif${userData.dailyStreak > 1 ? "s" : ""} ! Continue comme ça !`
                  : "Commence ta série quotidienne dès aujourd'hui !"}
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isActive = day <= userData.dailyStreak;
                return (
                  <div
                    key={day}
                    className={`h-14 w-14 rounded-xl border-[3px] border-black flex items-center justify-center font-bold text-lg ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}
                    style={{
                      boxShadow: isActive
                        ? "0 3px 0 0 black"
                        : "0 3px 0 0 rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    {isActive ? "✓" : day}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

