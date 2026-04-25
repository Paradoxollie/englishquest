import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminOrTeacher } from "@/lib/auth/roles";
import { getUserHomeData } from "./user-data";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  FlameIcon,
  GameIcon,
  GoldIcon,
  LevelIcon,
  QuestIcon,
  TeacherIcon,
  TrophyIcon,
  XPIcon,
} from "@/components/ui/icons";
import { getGameBySlug } from "@/lib/games/config";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import type { Profile } from "@/types/profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const focusCards = [
  {
    label: "Aventure",
    title: "Continuer la campagne",
    href: "/quest",
    Icon: QuestIcon,
    accent: "#34d399",
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.24) 0%, rgba(15, 23, 42, 0.98) 74%)",
  },
  {
    label: "Cours",
    title: "Reprendre la notion",
    href: "/tous-les-cours",
    Icon: BookIcon,
    accent: "#22d3ee",
    background: "linear-gradient(135deg, rgba(6, 182, 212, 0.24) 0%, rgba(15, 23, 42, 0.98) 74%)",
  },
  {
    label: "Jeux",
    title: "S'entrainer vite",
    href: "/play",
    Icon: GameIcon,
    accent: "#facc15",
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(15, 23, 42, 0.98) 74%)",
  },
] as const;

function getXPForNextLevel(level: number): number {
  return Math.max(level, 1) * 1000;
}

function getXPProgress(currentXP: number, level: number) {
  const required = getXPForNextLevel(level);
  const percentage = required > 0 ? Math.min((currentXP / required) * 100, 100) : 0;

  return {
    current: currentXP,
    required,
    percentage: Math.round(percentage),
  };
}

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
  const username =
    profile?.username ??
    user.user_metadata?.username ??
    user.email?.split("@")[0] ??
    "Joueur";
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const gold = profile?.gold ?? 0;
  const xpProgress = getXPProgress(xp, level);
  const activeCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const recommendedGames = roadmap.recommendedGameSlugs
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));
  const primaryGame = recommendedGames[0] ?? null;
  const focusGames = recommendedGames.slice(0, 3);
  const visibleFocusTags = activeCourse?.focusTags.slice(0, 4) ?? [];
  const nextCourseHref = activeCourse ? `/cours/${activeCourse.courseId}` : "/tous-les-cours";
  const nextDailyGameSlug =
    userData.requiredGames.find((slug) => !userData.dailyPlayedGames.includes(slug)) ??
    userData.requiredGames[0] ??
    null;
  const nextDailyGame = nextDailyGameSlug ? getGameBySlug(nextDailyGameSlug) : null;
  const dailyGames = userData.requiredGames
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));
  const completedPercent =
    roadmap.totalCourses > 0 ? Math.round((roadmap.completedCount / roadmap.totalCourses) * 100) : 0;
  const missionInstruction = activeCourse
    ? `Cours ${activeCourse.courseId}: ${activeCourse.title}`
    : "Parcours principal termine";
  const gameInstruction = primaryGame
    ? `Defi conseille: ${primaryGame.name}`
    : "Choisis un jeu rapide pour garder le rythme.";
  const missionSteps = activeCourse
    ? [
        {
          label: "Cours",
          value: `Mission ${activeCourse.courseId}`,
          detail: activeCourse.title,
        },
        {
          label: "Quiz",
          value: "80% minimum",
          detail: "Valide la notion avant de passer au defi.",
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
          value: "Catalogue libre",
          detail: "Reprends une notion precise dans les cours.",
        },
        {
          label: "Quiz",
          value: "Revision",
          detail: "Refais un quiz pour consolider.",
        },
        {
          label: "Jeu",
          value: "Play",
          detail: "Lance un jeu court pour pratiquer.",
        },
      ];

  return (
    <div className="-m-6 overflow-hidden bg-[#020617] text-white md:-m-8">
      <section className="relative overflow-hidden border-b-4 border-black">
        <Image
          src="/page-art/home-hero.png"
          alt="Illustration comic book de l'academie English Quest."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/88 to-[#020617]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/42" />
        <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />

        <div className="relative mx-auto grid min-h-[610px] max-w-[1280px] gap-6 px-4 py-8 md:min-h-[650px] md:px-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="self-end">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 text-outline">
              Accueil joueur
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] text-white text-outline md:text-6xl">
              Bon retour, {username}.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-xl">
              Ta page d'accueil met maintenant la mission active, le defi du jour
              et les raccourcis importants au premier plan.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/quest"
                className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <QuestIcon className="h-4 w-4" />
                Ouvrir l'aventure
              </Link>
              <Link
                href={nextCourseHref}
                className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
              >
                <BookIcon className="h-4 w-4" />
                Continuer le cours
              </Link>
              <Link
                href={nextDailyGame ? `/play/${nextDailyGame.slug}` : "/play"}
                className="comic-button inline-flex items-center gap-2 bg-amber-600 px-5 py-3 text-sm font-bold text-white hover:bg-amber-700"
              >
                <GameIcon className="h-4 w-4" />
                Defi du jour
              </Link>
            </div>

            <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
              <div className="border-l-4 border-cyan-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Progression
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{completedPercent}%</p>
                <p className="mt-1 text-xs font-semibold text-slate-300">
                  {roadmap.completedCount}/{roadmap.totalCourses} cours
                </p>
              </div>
              <div className="border-l-4 border-emerald-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Serie
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{userData.dailyStreak}</p>
                <p className="mt-1 text-xs font-semibold text-slate-300">jours actifs</p>
              </div>
              <div className="border-l-4 border-amber-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Niveau
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{level}</p>
                <p className="mt-1 text-xs font-semibold text-slate-300">{gold} or</p>
              </div>
            </div>
          </div>

          <aside className="self-end border-4 border-black bg-slate-950/90 p-5 shadow-[0_4px_0_#000] backdrop-blur-sm md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black bg-cyan-600 shadow-[0_3px_0_#000]">
                <LevelIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
                  Profil
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight text-white text-outline">
                  Niveau {level}
                </h2>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <XPIcon className="h-4 w-4 text-emerald-300" />
                  <span>Experience</span>
                </div>
                <span className="font-bold text-slate-300">
                  {xpProgress.current.toLocaleString("fr-FR")} / {xpProgress.required.toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border border-black bg-slate-900">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-300"
                  style={{ width: `${xpProgress.percentage}%` }}
                >
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <XPIcon className="h-4 w-4 text-emerald-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    XP
                  </p>
                </div>
                <p className="text-2xl font-bold text-emerald-300">{xp.toLocaleString("fr-FR")}</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <GoldIcon className="h-4 w-4 text-amber-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Or
                  </p>
                </div>
                <p className="text-2xl font-bold text-amber-300">{gold.toLocaleString("fr-FR")}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-14">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="relative overflow-hidden border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <div className="absolute inset-0 comic-dot-pattern-light opacity-15" />
            <div className="relative z-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 text-outline">
                    Mission prioritaire
                  </p>
                  <h2 className="mt-2 text-3xl font-bold leading-tight text-white text-outline md:text-4xl">
                    {missionInstruction}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-300 md:text-base">
                    {activeCourse
                      ? "Le chemin est simple: cours, quiz, puis jeu cible pour debloquer la suite."
                      : "Tu peux reprendre librement un cours ou lancer un entrainement rapide."}
                  </p>
                </div>
                <Link
                  href="/quest"
                  className="comic-button inline-flex w-fit items-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Carte aventure
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {missionSteps.map((step, index) => (
                  <div key={step.label} className="border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                      Etape {index + 1}
                    </p>
                    <p className="mt-2 text-sm font-bold text-white">
                      {step.label}: {step.value}
                    </p>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-300">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>

              {visibleFocusTags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {visibleFocusTags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-cyan-300/25 bg-cyan-950/35 px-3 py-1 text-xs font-bold text-cyan-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={nextCourseHref}
                  className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700"
                >
                  <BookIcon className="h-4 w-4" />
                  Ouvrir le cours
                </Link>
                <Link
                  href={primaryGame ? `/play/${primaryGame.slug}` : "/play"}
                  className="comic-button inline-flex items-center gap-2 bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700"
                >
                  <GameIcon className="h-4 w-4" />
                  {primaryGame ? primaryGame.name : "Choisir un jeu"}
                </Link>
              </div>
            </div>
          </div>

          <aside className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black bg-amber-600 shadow-[0_3px_0_#000]">
                <FlameIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  Defi quotidien
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight text-white text-outline">
                  {userData.dailyChallengeLabel}
                </h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Jeux
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  {userData.dailyGoalProgress}/{userData.dailyGoalTarget}
                </p>
              </div>
              <div className="border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  XP
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-300">+{userData.dailyBonusXp}</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Or
                </p>
                <p className="mt-2 text-lg font-bold text-amber-300">+{userData.dailyBonusGold}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {dailyGames.map((game) => {
                const isPlayed = userData.dailyPlayedGames.includes(game.slug);

                return (
                  <Link
                    key={game.slug}
                    href={`/play/${game.slug}`}
                    className="flex items-center gap-3 border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center border-2 border-black ${game.iconBg}`}>
                      {game.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-white">{game.name}</span>
                      <span className="block text-xs font-semibold text-slate-300">
                        {isPlayed ? "Valide aujourd'hui" : "A faire"}
                      </span>
                    </span>
                    {isPlayed ? (
                      <CheckIcon className="h-5 w-5 shrink-0 text-emerald-300" />
                    ) : (
                      <ArrowRightIcon className="h-5 w-5 shrink-0 text-amber-300" />
                    )}
                  </Link>
                );
              })}
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">{userData.nextRefreshLabel}</p>
          </aside>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {focusCards.map((card) => {
            const Icon = card.Icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group comic-card-dark min-h-[230px] p-5 md:p-6"
                style={{ background: card.background }}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black bg-slate-950 shadow-[0_3px_0_#000]"
                      style={{ color: card.accent }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: card.accent }}>
                      {card.label}
                    </p>
                  </div>
                  <h2 className="mt-5 text-2xl font-bold leading-tight text-white text-outline">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
                    {card.label === "Aventure"
                      ? missionInstruction
                      : card.label === "Cours"
                        ? activeCourse?.title ?? "Catalogue complet"
                        : gameInstruction}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold" style={{ color: card.accent }}>
                    Ouvrir
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 text-outline">
              Serie
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white text-outline">
              {userData.dailyStreak > 0
                ? `${userData.dailyStreak} jour${userData.dailyStreak > 1 ? "s" : ""} de suite`
                : "Demarre ta serie"}
            </h2>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isActive = day <= userData.dailyStreak;

                return (
                  <div
                    key={day}
                    className={`flex aspect-square items-center justify-center border-2 border-black text-sm font-black shadow-[0_2px_0_#000] ${
                      isActive ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isActive ? "OK" : day}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-4 border-black bg-gradient-to-r from-cyan-950 via-slate-950 to-emerald-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
                  Prochain mouvement
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                  Avance d'une mission, puis verrouille avec un jeu.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/quest"
                  className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Aventure
                </Link>
                <Link
                  href="/play"
                  className="comic-button inline-flex items-center gap-2 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Jeux
                </Link>
                {canAccessTeachers && (
                  <Link
                    href="/teachers"
                    className="comic-button inline-flex items-center gap-2 bg-amber-600 px-5 py-3 text-sm font-bold text-white hover:bg-amber-700"
                  >
                    <TeacherIcon className="h-4 w-4" />
                    Professeurs
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 text-outline">
                Jeux conseilles
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                Pour la mission active
              </h2>
            </div>
            <Link href="/play" className="text-sm font-bold text-amber-300 hover:underline">
              Tout voir
            </Link>
          </div>

          {focusGames.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {focusGames.map((game) => (
                <Link
                  key={game.slug}
                  href={`/play/${game.slug}`}
                  className="border-4 border-black bg-slate-950 p-4 shadow-[0_4px_0_#000] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black ${game.iconBg}`}>
                      {game.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-bold text-white text-outline">
                        {game.name}
                      </span>
                      <span className="block text-xs font-semibold text-slate-300">
                        {game.tags.slice(0, 2).join(" / ")}
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000]">
              <p className="text-sm font-semibold text-slate-300">
                Aucun jeu cible pour l'instant. Le catalogue Play reste disponible.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
