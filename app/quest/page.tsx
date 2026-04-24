import Image from "next/image";
import Link from "next/link";
import { completeCourseAction, launchCourseMissionAction } from "@/app/cours/actions";
import {
  CampaignTreasureMap,
  type QuestPlayerToken,
} from "@/components/quest/campaign-treasure-map";
import {
  BookIcon,
  GameIcon,
  GoldIcon,
  QuestIcon,
  TrophyIcon,
  XPIcon,
} from "@/components/ui/icons";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { getCourseVisualProfile } from "@/lib/courses/presentation";
import {
  buildGuestCourseRoadmap,
  completeCourseAndGrantRewards,
  getUserCourseRoadmap,
  type CourseRoadmap,
  type CourseRoadmapEntry,
} from "@/lib/courses/progress";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getQuestPlayerToken(
  userId: string,
  fallbackName: string | undefined
): Promise<QuestPlayerToken | null> {
  try {
    const adminClient = createSupabaseAdminClient();
    const [{ data: profile }, { data: equipped }] = await Promise.all([
      adminClient.from("profiles").select("username").eq("id", userId).maybeSingle(),
      adminClient
        .from("user_equipped_items")
        .select(
          `
            equipped_avatar:shop_items!equipped_avatar_id(image_url,color_theme,name),
            equipped_background:shop_items!equipped_background_id(image_url,color_theme,name)
          `
        )
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    const avatar = Array.isArray(equipped?.equipped_avatar)
      ? equipped.equipped_avatar[0]
      : equipped?.equipped_avatar;
    const background = Array.isArray(equipped?.equipped_background)
      ? equipped.equipped_background[0]
      : equipped?.equipped_background;
    const username = profile?.username ?? fallbackName ?? "Joueur";

    return {
      username,
      initial: username.charAt(0).toUpperCase(),
      avatarImageUrl: avatar?.image_url ?? null,
      backgroundImageUrl: background?.image_url ?? null,
      backgroundTheme: background?.color_theme ?? avatar?.color_theme ?? null,
    };
  } catch {
    if (!fallbackName) {
      return null;
    }

    return {
      username: fallbackName,
      initial: fallbackName.charAt(0).toUpperCase(),
      avatarImageUrl: null,
      backgroundImageUrl: null,
      backgroundTheme: "cyan",
    };
  }
}

async function resolveQuestRoadmap(userId: string): Promise<{
  roadmap: CourseRoadmap;
  activeMissionState: Awaited<ReturnType<typeof getUserCourseMissionState>> | null;
  recentlyCompletedMission: CourseRoadmapEntry | null;
}> {
  const initialRoadmap = await getUserCourseRoadmap(userId);
  const activeCourse = initialRoadmap.currentCourse;

  if (!activeCourse || activeCourse.status !== "in_progress") {
    return {
      roadmap: initialRoadmap,
      activeMissionState: null,
      recentlyCompletedMission: null,
    };
  }

  const activeMissionState = await getUserCourseMissionState(userId, activeCourse);

  if (!activeMissionState.readyToComplete) {
    return {
      roadmap: initialRoadmap,
      activeMissionState,
      recentlyCompletedMission: null,
    };
  }

  await completeCourseAndGrantRewards(userId, activeCourse.courseId);
  const refreshedRoadmap = await getUserCourseRoadmap(userId);

  return {
    roadmap: refreshedRoadmap,
    activeMissionState: null,
    recentlyCompletedMission: activeCourse,
  };
}

export default async function QuestPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const questState = user
    ? await resolveQuestRoadmap(user.id)
    : {
        roadmap: buildGuestCourseRoadmap(),
        activeMissionState: null,
        recentlyCompletedMission: null,
      };
  const roadmap = questState.roadmap;
  const activeCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const activeProfile = getCourseVisualProfile(activeCourse?.palierId ?? 1);
  const fallbackName =
    user?.user_metadata?.username ??
    (user?.email ? user.email.split("@")[0] : undefined);
  const [missionPlans, playerToken, activeMissionState] = await Promise.all([
    getResolvedCourseMissionPlans(roadmap.entries),
    user ? getQuestPlayerToken(user.id, fallbackName) : Promise.resolve(null),
    user && activeCourse?.status === "in_progress"
      ? questState.activeMissionState
        ? Promise.resolve(questState.activeMissionState)
        : getUserCourseMissionState(user.id, activeCourse)
      : Promise.resolve(null),
  ]);
  const activeMission = activeCourse
    ? missionPlans[activeCourse.courseId] ?? null
    : null;
  const completedPercent =
    roadmap.totalCourses > 0 ? Math.round((roadmap.completedCount / roadmap.totalCourses) * 100) : 0;
  const missionInstruction =
    activeCourse && activeMission
      ? activeCourse.status === "unlocked"
        ? `Lance la mission, ouvre le cours, atteins 80% au quiz, puis reussis le defi ${activeMission.primaryGameName ?? "jeu"}.`
        : activeMissionState?.readyToComplete
          ? "Tout est valide. Tu peux finaliser la mission pour ouvrir la suite."
          : activeMissionState?.quizPassed
            ? `Le quiz est valide. Il reste le score a atteindre dans ${activeMission.primaryGameName ?? "le jeu demande"}.`
            : `Commence par le cours, descends jusqu'au quiz, puis vise 80% minimum avant le defi ${activeMission.primaryGameName ?? "jeu"}.`
      : null;

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-[#020617] text-white">
      <section className="relative overflow-hidden border-b-4 border-black">
        <Image
          src="/page-art/quest-hero.png"
          alt="Illustration comic book d'une carte d'aventure English Quest."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/86 to-[#020617]/24" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/45" />
        <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />

        <div className="relative mx-auto grid min-h-[580px] max-w-[1460px] gap-8 px-4 py-10 md:min-h-[640px] md:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end xl:px-10">
          <div className="max-w-4xl self-end">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 text-outline">
              Aventure
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] text-white text-outline md:text-6xl">
              Avance mission par mission, sans perdre le cap.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-xl">
              La carte Aventure donne une route claire: un cours, un quiz, un defi
              de jeu, puis la mission suivante. Tu sais toujours quoi faire ensuite.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {activeCourse && activeCourse.status === "unlocked" && isLoggedIn ? (
                <form action={launchCourseMissionAction}>
                  <input type="hidden" name="courseNumber" value={activeCourse.courseId} />
                  <button
                    type="submit"
                    className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <QuestIcon className="h-4 w-4" />
                    Lancer la mission
                  </button>
                </form>
              ) : activeCourse ? (
                <Link
                  href={`/cours/${activeCourse.courseId}`}
                  className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <BookIcon className="h-4 w-4" />
                  Continuer le cours
                </Link>
              ) : null}
              <Link
                href="#carte"
                className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
              >
                Voir la carte
              </Link>
              <Link
                href="/tous-les-cours"
                className="comic-button inline-flex items-center gap-2 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                <BookIcon className="h-4 w-4" />
                Catalogue libre
              </Link>
            </div>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="border-l-4 border-cyan-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Missions
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{roadmap.totalCourses}</p>
              </div>
              <div className="border-l-4 border-emerald-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Progression
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{completedPercent}%</p>
              </div>
              <div className="border-l-4 border-amber-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Acte
                </p>
                <p className="mt-2 truncate text-lg font-bold text-white">
                  {activeCourse ? activeProfile.chapterLabel : "Depart"}
                </p>
              </div>
            </div>
          </div>

          <aside className="self-end border-4 border-black bg-slate-950/88 p-5 shadow-[0_4px_0_#000] backdrop-blur-sm md:p-6">
            <div className="flex items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black shadow-[0_3px_0_#000]"
                style={{ background: activeProfile.rail }}
              >
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
                  Mission active
                </p>
                <h2 className="mt-2 text-xl font-bold leading-tight text-white text-outline md:text-2xl">
                  {activeCourse
                    ? `Mission ${activeCourse.courseId}: ${activeCourse.title}`
                    : "Mission 1"}
                </h2>
              </div>
            </div>

            {activeCourse && activeMission ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm font-semibold leading-relaxed text-slate-200">
                  {activeMission.objective}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
                    {activeCourse.estimatedMinutes} min
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
                    {activeCourse.rewardXp} XP
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
                    {activeMission.primaryGameName ?? "Defi final"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-slate-300">
                La campagne commence par la premiere mission du parcours.
              </p>
            )}
          </aside>
        </div>
      </section>

      <main className="mx-auto max-w-[1460px] px-4 py-10 md:px-6 md:py-14 xl:px-10">
        {questState.recentlyCompletedMission && (
          <div className="mb-8 border-4 border-black bg-emerald-950 p-5 shadow-[0_4px_0_#000]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
              Mission validee
            </p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-emerald-100 text-outline">
              Mission {questState.recentlyCompletedMission.courseId} bouclee. La suite de la
              campagne est maintenant ouverte.
            </p>
          </div>
        )}

        <section id="carte" className="scroll-mt-8">
          <CampaignTreasureMap
            entries={roadmap.entries}
            activeCourseId={activeCourse?.courseId ?? null}
            missionPlans={missionPlans}
            playerToken={playerToken}
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          <div
            className="relative overflow-hidden border-4 border-black p-5 shadow-[0_4px_0_#000] md:p-6"
            style={{ background: activeProfile.cardBackground }}
          >
            <div className="absolute inset-y-0 left-0 w-2" style={{ background: activeProfile.rail }} />
            <div className="absolute inset-0 comic-dot-pattern-light opacity-15" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center border-4 border-black shadow-[0_3px_0_#000]"
                  style={{ background: activeProfile.rail }}
                >
                  <TrophyIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                    Objectif actuel
                  </p>
                  <h2 className="text-2xl font-bold text-white text-outline">
                    {activeCourse ? activeCourse.title : "Premiere mission"}
                  </h2>
                </div>
              </div>

              {activeCourse && activeMission ? (
                <div className="mt-6 space-y-5">
                  <p className="text-sm font-semibold leading-relaxed text-slate-100 text-outline md:text-base">
                    {activeMission.objective}
                  </p>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="border border-cyan-400/20 bg-cyan-950/25 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                        1. Cours
                      </p>
                      <p className="mt-2 text-sm font-bold text-white">
                        {activeMissionState?.readingCheckpointReached ? "Checkpoint atteint" : "Lire la lecon"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-300">
                        {activeCourse.estimatedMinutes} min
                      </p>
                    </div>
                    <div className="border border-indigo-400/20 bg-indigo-950/25 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        2. Quiz
                      </p>
                      <p className="mt-2 text-sm font-bold text-white">
                        {activeMissionState?.quizPassed ? "Quiz valide" : "80% minimum"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-300">
                        {activeMissionState?.quizScore != null &&
                        activeMissionState?.quizTotal != null
                          ? `${activeMissionState.quizScore}/${activeMissionState.quizTotal}`
                          : activeMission.validationLabel}
                      </p>
                    </div>
                    <div className="border border-amber-400/20 bg-amber-950/25 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                        3. Jeu
                      </p>
                      <p className="mt-2 text-sm font-bold text-white">
                        {activeMission.primaryGameName ?? "Defi final"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-300">
                        {activeMissionState?.gameChallengeReached
                          ? "Score cible atteint"
                          : activeMission.gameChallengeLabel}
                      </p>
                    </div>
                  </div>

                  {missionInstruction && (
                    <div className="border border-white/10 bg-slate-950/72 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                        Ce que tu dois faire
                      </p>
                      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-100 text-outline">
                        {missionInstruction}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {isLoggedIn && activeCourse.status === "unlocked" && (
                      <form action={launchCourseMissionAction}>
                        <input type="hidden" name="courseNumber" value={activeCourse.courseId} />
                        <button
                          type="submit"
                          className="comic-button inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-white"
                          style={{ background: activeProfile.rail }}
                        >
                          <QuestIcon className="h-4 w-4" />
                          Lancer et ouvrir le cours
                        </button>
                      </form>
                    )}
                    {isLoggedIn &&
                      activeCourse.status === "in_progress" &&
                      activeMissionState?.readyToComplete && (
                        <form action={completeCourseAction}>
                          <input type="hidden" name="courseNumber" value={activeCourse.courseId} />
                          <button
                            type="submit"
                            className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                          >
                            <TrophyIcon className="h-4 w-4" />
                            Valider la mission
                          </button>
                        </form>
                      )}
                    {activeCourse.status !== "unlocked" && (
                      <Link
                        href={`/cours/${activeCourse.courseId}`}
                        className="comic-button inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-white"
                        style={{ background: activeProfile.rail }}
                      >
                        <BookIcon className="h-4 w-4" />
                        Continuer le cours
                      </Link>
                    )}
                    {activeMission.primaryGameSlug && (
                      <Link
                        href={`/play/${activeMission.primaryGameSlug}`}
                        className="comic-button inline-flex items-center gap-2 bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700"
                      >
                        <GameIcon className="h-4 w-4" />
                        Lancer le defi
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm font-semibold text-slate-300">
                  La campagne commence par la premiere mission du parcours.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Regles du parcours
              </p>
              <div className="mt-4 space-y-3 text-sm font-semibold leading-relaxed text-slate-300">
                <p>1. Lis le cours jusqu'au point de passage.</p>
                <p>2. Valide le quiz avec au moins 80%.</p>
                <p>3. Reussis le score demande dans le jeu associe.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {activeCourse && (
                <>
                  <div className="border border-white/10 bg-slate-950/72 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <XPIcon className="h-4 w-4 text-emerald-300" />
                      <span>{activeCourse.rewardXp} XP a gagner</span>
                    </div>
                  </div>
                  <div className="border border-white/10 bg-slate-950/72 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <GoldIcon className="h-4 w-4 text-amber-300" />
                      <span>{activeCourse.rewardGold} or a gagner</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isLoggedIn && (
              <div className="border-4 border-black bg-amber-950/40 p-5 shadow-[0_4px_0_#000]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  Mode invite
                </p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-amber-100 text-outline">
                  La carte reste visible, mais la progression n'est pas sauvegardee.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/auth/signup"
                    className="comic-button bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    Creer mon compte
                  </Link>
                  <Link
                    href="/auth/login"
                    className="comic-button bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    Me connecter
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
