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
  const primaryGame = recommendedGames[0] ?? null;
  const focusGames = recommendedGames.slice(0, 3);
  const visibleFocusTags = activeCourse?.focusTags.slice(0, 3) ?? [];
  const nextCourseHref = activeCourse ? `/cours/${activeCourse.courseId}` : "/tous-les-cours";
  const nextDailyGameSlug =
    userData.requiredGames.find((slug) => !userData.dailyPlayedGames.includes(slug)) ??
    userData.requiredGames[0] ??
    null;
  const nextDailyGame = nextDailyGameSlug ? getGameBySlug(nextDailyGameSlug) : null;
  const missionSteps = activeCourse
    ? [
        {
          label: "Cours",
          value: `Cours ${activeCourse.courseId}`,
          detail: activeCourse.title,
        },
        {
          label: "Quiz",
          value: "80% minimum",
          detail: "Descends jusqu'au quiz et valide la notion.",
        },
        {
          label: "Jeu",
          value: primaryGame?.name ?? "Defi final",
          detail: "Atteins le score demande pour ouvrir la suite.",
        },
      ]
    : [
        {
          label: "Cours",
          value: "Bibliotheque libre",
          detail: "Choisis un cours pour repartir.",
        },
        {
          label: "Quiz",
          value: "Revision",
          detail: "Refais un quiz pour reprendre le rythme.",
        },
        {
          label: "Jeu",
          value: "Play",
          detail: "Relance un jeu rapide pour continuer.",
        },
      ];
  const campaignSummary = activeCourse
    ? `Cours ${activeCourse.courseId}: ${activeCourse.title}`
    : "Parcours principal termine";
  const focusSummary = activeCourse
    ? `Pour valider: quiz 80% puis score sur ${primaryGame?.name ?? "le jeu demande"}.`
    : "Choisis un cours libre ou un jeu rapide pour continuer a pratiquer.";

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
        <section
          className="comic-card-dark overflow-hidden p-6 md:p-7"
          style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.22) 100%)" }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500 p-3">
                    <QuestIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 text-outline">
                      Mission du jour
                    </p>
                    <h2 className="text-2xl font-bold text-white text-outline md:text-3xl">
                      Continue la campagne
                    </h2>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl break-words text-sm font-semibold leading-6 text-slate-100 text-outline md:text-base">
                  {activeCourse
                    ? "Un seul objectif: ouvre le cours, valide le quiz, puis reussis le defi jeu pour deverrouiller la suite."
                    : "Le parcours principal est termine. Repars sur un cours libre ou un jeu cible pour garder le rythme."}
                </p>
              </div>

              <Link
                href="/quest"
                className="comic-panel inline-flex items-center justify-center border-2 border-black bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Aller dans Aventure
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {missionSteps.map((step, index) => (
                <div
                  key={step.label}
                  className="comic-panel min-w-0 border-2 border-black bg-slate-950/75 p-4"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                    Etape {index + 1}
                  </p>
                  <p className="mt-2 break-words text-sm font-bold text-white text-outline">
                    {step.label} · {step.value}
                  </p>
                  <p className="mt-2 break-words text-xs font-semibold leading-5 text-slate-300">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="comic-panel border-2 border-black bg-black/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cours valides</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {roadmap.completedCount}/{roadmap.totalCourses}
                </p>
              </div>
              <div className="comic-panel border-2 border-black bg-black/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Progression</p>
                <p className="mt-2 text-lg font-bold text-white">{roadmap.completionRate}%</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={nextCourseHref}
                className="comic-panel inline-flex items-center justify-center border-2 border-black bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                {activeCourse ? "Ouvrir le cours" : "Voir les cours"}
              </Link>
              <Link
                href={primaryGame ? `/play/${primaryGame.slug}` : "/play"}
                className="comic-panel inline-flex items-center justify-center border-2 border-black bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-200 transition-transform hover:-translate-y-0.5"
              >
                {primaryGame ? `Jouer a ${primaryGame.name}` : "Lancer un jeu"}
              </Link>
            </div>
          </div>
        </section>

        <section
          className="comic-card-dark overflow-hidden p-6 md:p-7"
          style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(245, 158, 11, 0.16) 100%)" }}
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500 p-3">
                <BookIcon className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 text-outline">
                  En ce moment
                </p>
                <h2 className="text-2xl font-bold text-white text-outline">Cap actuel</h2>
              </div>
            </div>

            <div className="comic-panel min-w-0 border-2 border-black bg-slate-950/75 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cours actif</p>
              <p className="mt-2 break-words text-xl font-bold leading-tight text-white text-outline">
                {campaignSummary}
              </p>
              <p className="mt-3 break-words text-sm font-semibold leading-6 text-slate-300 text-outline">
                {focusSummary}
              </p>

              {roadmap.currentPalier && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="comic-panel border-2 border-black bg-indigo-500/80 px-3 py-1 text-xs font-bold text-white">
                    {roadmap.currentPalier.title}
                  </span>
                  <span className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold text-slate-100">
                    {roadmap.currentPalier.level}
                  </span>
                  <span className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold text-cyan-300">
                    {roadmap.currentPalier.completedCount}/{roadmap.currentPalier.totalCourses} valides
                  </span>
                </div>
              )}

              {visibleFocusTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {visibleFocusTags.map((tag) => (
                    <span
                      key={tag}
                      className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold text-slate-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 text-outline">
                    Jeux utiles maintenant
                  </p>
                </div>
                <Link href="/play" className="text-sm font-bold text-amber-300 hover:underline">
                  Voir tout
                </Link>
              </div>

              {focusGames.length > 0 ? (
                <div className="grid gap-3">
                  {focusGames.map((game) => (
                    <Link
                      key={game.slug}
                      href={`/play/${game.slug}`}
                      className="comic-panel flex min-w-0 items-center gap-3 border-2 border-black bg-slate-900/75 px-4 py-3 transition-transform hover:-translate-y-0.5"
                    >
                      <div className={`comic-panel shrink-0 border-2 border-black ${game.iconBg} p-2`}>
                        <span className="text-lg">{game.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold text-white text-outline">{game.name}</p>
                        <p className="break-words text-xs text-slate-300">{game.tags.slice(0, 2).join(" / ")}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-amber-300">Jouer</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="comic-panel border-2 border-black bg-slate-900/75 p-4">
                  <p className="break-words text-sm font-semibold text-slate-200 text-outline">
                    Aucun jeu cible pour l'instant. Va dans Play pour choisir ton prochain defi.
                  </p>
                </div>
              )}
            </div>
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
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500 p-3">
                <FlameIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 text-outline">
                  Defi quotidien
                </p>
                <p className="text-2xl font-bold text-white text-outline">
                  {userData.dailyChallengeLabel}
                </p>
              </div>
            </div>

            <p className="mb-4 text-slate-300 text-outline">
              Chaque jour, 3 jeux changent. Termine les 3 pour gagner un petit bonus et nourrir ta serie.
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              <div className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2 text-xs font-bold text-white">
                +{userData.dailyBonusXp} XP
              </div>
              <div className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2 text-xs font-bold text-white">
                +{userData.dailyBonusGold} or
              </div>
              <div className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2 text-xs font-bold text-cyan-200">
                {userData.nextRefreshLabel}
              </div>
            </div>

            <div className="mb-4 space-y-3">
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
                    className={`comic-panel flex items-center gap-3 border-2 border-black px-4 py-3 transition-transform hover:-translate-y-0.5 ${
                      isPlayed
                        ? "bg-emerald-600/45"
                        : "bg-slate-900/80 hover:border-cyan-400"
                    }`}
                  >
                    <div
                      className={`comic-panel shrink-0 border-2 border-black ${game.iconBg} flex h-12 w-12 items-center justify-center`}
                    >
                      <span className="text-xl">{game.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-bold text-white text-outline">
                        {game.name}
                      </p>
                      <p className="break-words text-xs text-slate-300">
                        {isPlayed ? "Valide aujourd'hui" : "A faire aujourd'hui"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-bold uppercase ${
                        isPlayed ? "text-emerald-200" : "text-cyan-200"
                      }`}
                    >
                      {isPlayed ? "OK" : "Jouer"}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="comic-panel border-2 border-black bg-slate-950/70 p-4">
              <p className="text-sm font-bold text-white text-outline">
                {userData.dailyGoalProgress}/{userData.dailyGoalTarget} jeux valides aujourd'hui
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-300">
                {userData.dailyBonusClaimedToday
                  ? "Bonus du jour recupere. Reviens demain pour une nouvelle selection."
                  : userData.dailyGoalReached
                    ? "Le bonus est pret a tomber des la validation du dernier score."
                    : "Il reste encore des jeux a terminer pour gagner le bonus du jour."}
              </p>
            </div>

            <Link
              href={nextDailyGame ? `/play/${nextDailyGame.slug}` : "/play"}
              className="mt-4 flex items-center gap-2 text-sm text-cyan-300 hover:underline"
            >
              <span className="font-semibold">
                {nextDailyGame ? `Lancer ${nextDailyGame.name} ->` : "Voir les jeux ->"}
              </span>
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
