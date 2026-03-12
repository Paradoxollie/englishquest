import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminOrTeacher } from "@/lib/auth/roles";
import { getUserHomeData } from "./user-data";
import {
  BookIcon,
  FlameIcon,
  GameIcon,
  QuestIcon,
  TeacherIcon,
  TrophyIcon,
} from "@/components/ui/icons";
import { getGameBySlug } from "@/lib/games/config";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import type { Profile } from "@/types/profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [userData, roadmap, canAccessTeachers] = await Promise.all([
    getUserHomeData(user.id),
    getUserCourseRoadmap(user.id),
    isAdminOrTeacher(),
  ]);

  const adminClient = createSupabaseAdminClient();
  const { data: profileData } = await adminClient
    .from("profiles")
    .select("username, role, xp, gold, level")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;
  const activeCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const recommendedGames = roadmap.recommendedGameSlugs
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));

  return (
    <div className="space-y-8 md:space-y-12">
      {profile && (
        <header className="comic-panel-dark mb-4 flex flex-col gap-3 p-3 md:mb-8 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 text-outline md:text-sm md:tracking-[0.3em]">
              EnglishQuest
            </p>
            <h1 className="text-xl font-bold leading-tight text-white text-outline md:text-3xl md:leading-normal">
              Welcome back, <span className="text-cyan-300">{profile.username}</span>
            </h1>
            <p className="text-xs text-slate-400 text-outline md:text-sm">
              Role: <span className="font-bold text-amber-300">{profile.role}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs md:gap-4 md:text-sm">
            <div className="comic-panel border-2 border-black px-2 py-1.5 md:border-4 md:px-4 md:py-2" style={{ background: "#059669" }}>
              <span className="font-bold text-white">XP</span> <span className="font-bold text-white">{profile.xp}</span>
            </div>
            <div className="comic-panel border-2 border-black px-2 py-1.5 md:border-4 md:px-4 md:py-2" style={{ background: "#d97706" }}>
              <span className="font-bold text-white">Gold</span> <span className="font-bold text-white">{profile.gold}</span>
            </div>
            <div className="comic-panel border-2 border-black px-2 py-1.5 md:border-4 md:px-4 md:py-2" style={{ background: "#0891b2" }}>
              <span className="font-bold text-white">Level</span> <span className="font-bold text-white">{profile.level}</span>
            </div>
          </div>
        </header>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr_1fr]">
        <section
          className="comic-card-dark p-6"
          style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.22) 100%)" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500 p-3">
              <QuestIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 text-outline">
                Plan du jour
              </p>
              <h2 className="text-2xl font-bold text-white text-outline">Parcours pilote</h2>
            </div>
          </div>

          <div className="space-y-3">
            {roadmap.studyPlan.map((step) => (
              <div
                key={step}
                className="comic-panel border-2 border-black bg-slate-900/70 p-4 text-sm font-semibold text-slate-100 text-outline"
              >
                {step}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="comic-panel border-2 border-black bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Progression</p>
              <p className="mt-2 text-lg font-bold text-white">
                {roadmap.completedCount}/{roadmap.totalCourses} cours
              </p>
            </div>
            <div className="comic-panel border-2 border-black bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Completion</p>
              <p className="mt-2 text-lg font-bold text-white">{roadmap.completionRate}%</p>
            </div>
          </div>
        </section>

        <section
          className="comic-card-dark p-6"
          style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(59, 130, 246, 0.18) 100%)" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500 p-3">
              <BookIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 text-outline">
                Focus actuel
              </p>
              <h2 className="text-2xl font-bold text-white text-outline">Prochain cours</h2>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-300 text-outline">
            {activeCourse
              ? `Cours ${activeCourse.courseId}: ${activeCourse.title}`
              : "Le parcours principal est termine. Reprends les modules avances pour consolider."}
          </p>

          {roadmap.currentPalier && (
            <div className="mt-4 comic-panel border-2 border-black bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Palier en cours</p>
              <p className="mt-2 text-lg font-bold text-white">{roadmap.currentPalier.title}</p>
              <p className="text-sm font-semibold text-slate-300">{roadmap.currentPalier.level}</p>
              <p className="mt-2 text-sm font-semibold text-cyan-300">
                {roadmap.currentPalier.completedCount}/{roadmap.currentPalier.totalCourses} modules valides
              </p>
            </div>
          )}

          {activeCourse && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeCourse.focusTags.map((tag) => (
                <span
                  key={tag}
                  className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold text-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        <section
          className="comic-card-dark p-6"
          style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(249, 115, 22, 0.2) 100%)" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-amber-500 p-3">
              <GameIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 text-outline">
                Pratique ciblee
              </p>
              <h2 className="text-2xl font-bold text-white text-outline">Jeux conseilles</h2>
            </div>
          </div>

          <div className="space-y-3">
            {recommendedGames.map((game) => (
              <Link
                key={game.slug}
                href={`/play/${game.slug}`}
                className="comic-panel flex items-center justify-between gap-3 border-2 border-black bg-slate-900/70 px-4 py-3 transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className={`comic-panel border-2 border-black ${game.iconBg} p-2`}>
                    <span className="text-lg">{game.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white text-outline">{game.name}</p>
                    <p className="text-xs text-slate-300">{game.tags.slice(0, 2).join(" · ")}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-300">Jouer</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          className="comic-card-dark group relative p-8 md:col-span-2 lg:col-span-1"
          style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10">
            <Link href="/play" className="mb-4 flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="rounded-xl bg-cyan-500 p-3">
                <FlameIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 text-outline">
                  Jeu du jour
                </p>
                <p className="text-2xl font-bold text-white text-outline">Defi quotidien</p>
              </div>
            </Link>
            <p className="mb-4 text-slate-300 text-outline">
              Complete les 3 jeux du jour pour gagner le bonus quotidien et entretenir ta serie.
            </p>
            <div className="mb-4">
              <div className="mb-2 flex justify-center gap-4">
                {userData.requiredGames.map((slug) => {
                  const game = getGameBySlug(slug);
                  if (!game) {
                    return null;
                  }

                  const isPlayed = userData.dailyPlayedGames.includes(slug);

                  return (
                    <Link
                      key={slug}
                      href={`/play/${slug}`}
                      className={`relative flex cursor-pointer flex-col items-center rounded-lg border-2 border-black p-2 transition-all hover:scale-105 ${
                        isPlayed
                          ? "border-emerald-400 bg-emerald-600/50"
                          : "border-slate-600 bg-slate-800 hover:border-cyan-400"
                      }`}
                      title={game.name}
                    >
                      <div className="mb-1 text-2xl">{game.icon}</div>
                      {isPlayed && (
                        <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-black bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                          OK
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                {userData.dailyGoalProgress}/3 jeux du jour termines
              </p>
            </div>
            <Link href="/play" className="flex items-center gap-2 text-sm text-cyan-300 hover:underline">
              <span className="font-semibold">Commencer -&gt;</span>
            </Link>
          </div>
        </div>

        <Link
          href="/quest"
          className="comic-card-dark group relative flex h-full flex-col p-8"
          style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-grow flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500 p-3">
                <QuestIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 text-outline">
                  Aventure
                </p>
                <p className="text-2xl font-bold text-white text-outline">Continuer l'aventure</p>
              </div>
            </div>
            <p className="mb-4 flex-grow text-balance text-slate-300 text-outline">
              {activeCourse
                ? `Continue le cours #${activeCourse.courseId}: ${activeCourse.title}`
                : "Commence ton premier cours et lance le parcours principal."}
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm text-emerald-300">
              <span className="font-semibold">{activeCourse ? "Continuer ->" : "Commencer ->"}</span>
            </div>
          </div>
        </Link>

        <Link
          href="/play"
          className="comic-card-dark group relative flex h-full flex-col p-8"
          style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-grow flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-purple-500 p-3">
                <GameIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-300 text-outline">
                  Jeux
                </p>
                <p className="text-2xl font-bold text-white text-outline">Choisir son jeu</p>
              </div>
            </div>
            <p className="mb-4 flex-grow text-balance text-slate-300 text-outline">
              Explore tous les jeux disponibles et travaille la notion du moment avec les bons formats.
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm text-purple-300">
              <span className="font-semibold">Explorer -&gt;</span>
            </div>
          </div>
        </Link>

        {canAccessTeachers && (
          <Link
            href="/teachers"
            className="comic-card-dark group relative flex h-full flex-col p-8"
            style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex flex-grow flex-col">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-amber-500 p-3">
                  <TeacherIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 text-outline">
                    Professeurs
                  </p>
                  <p className="text-2xl font-bold text-white text-outline">Le coin des profs</p>
                </div>
              </div>
              <p className="mb-4 flex-grow text-balance text-slate-300 text-outline">
                Accede aux ressources, activites et outils de suivi pour la classe.
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm text-amber-300">
                <span className="font-semibold">Acceder -&gt;</span>
              </div>
            </div>
          </Link>
        )}

        <Link
          href="/leaderboard"
          className="comic-card-dark group relative flex h-full flex-col p-8"
          style={{ background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-grow flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-yellow-500 p-3">
                <TrophyIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-yellow-300 text-outline">
                  Classement
                </p>
                <p className="text-2xl font-bold text-white text-outline">Voir le classement</p>
              </div>
            </div>
            <p className="mb-4 flex-grow text-balance text-slate-300 text-outline">
              Situe ta progression par rapport aux autres joueurs et garde le cap.
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm text-yellow-300">
              <span className="font-semibold">Voir -&gt;</span>
            </div>
          </div>
        </Link>

        <Link
          href="/tous-les-cours"
          className="comic-card-dark group relative flex h-full flex-col p-8"
          style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-grow flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500 p-3">
                <BookIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 text-outline">
                  Bibliotheque
                </p>
                <p className="text-2xl font-bold text-white text-outline">Tous les cours</p>
              </div>
            </div>
            <p className="mb-4 flex-grow text-balance text-slate-300 text-outline">
              Parcours principal, revision libre et recherche rapide dans tout le catalogue.
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm text-indigo-300">
              <span className="font-semibold">Explorer -&gt;</span>
            </div>
          </div>
        </Link>
      </div>

      <div
        className="comic-panel-dark mt-8 p-6"
        style={{ background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-white text-outline">
              Continue ta serie
            </h2>
            <p className="text-slate-300 text-outline">
              {userData.dailyStreak > 0
                ? `Tu es sur une serie de ${userData.dailyStreak} jour${userData.dailyStreak > 1 ? "s" : ""}.`
                : "Commence ta serie quotidienne des aujourd'hui."}
            </p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isActive = day <= userData.dailyStreak;

              return (
                <div
                  key={day}
                  className={`flex h-14 w-14 items-center justify-center rounded-xl border-[3px] border-black text-lg font-bold ${
                    isActive ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? "0 3px 0 0 black"
                      : "0 3px 0 0 rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {isActive ? "OK" : day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
