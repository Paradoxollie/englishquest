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
  const missionPlans = await getResolvedCourseMissionPlans(roadmap.entries);
  const activeMission = activeCourse
    ? missionPlans[activeCourse.courseId] ?? null
    : null;
  const activeMissionState =
    user && activeCourse?.status === "in_progress"
      ? questState.activeMissionState ??
        (await getUserCourseMissionState(user.id, activeCourse))
      : null;
  const activeProfile = getCourseVisualProfile(activeCourse?.palierId ?? 1);
  const fallbackName =
    user?.user_metadata?.username ??
    (user?.email ? user.email.split("@")[0] : undefined);
  const playerToken = user ? await getQuestPlayerToken(user.id, fallbackName) : null;
  const missionInstruction =
    activeCourse && activeMission
      ? activeCourse.status === "unlocked"
        ? `1. Clique sur "Lancer et ouvrir le cours". 2. Va jusqu'au quiz et atteins 80% minimum. 3. Reussis le defi ${activeMission.primaryGameName ?? "jeu"}. 4. Reviens ici pour valider la mission.`
        : activeMissionState?.readyToComplete
          ? "Tout est valide. Recharge la carte si besoin: la mission se finalise et la suite s'ouvre automatiquement."
          : activeMissionState?.quizPassed
            ? `Le quiz est valide. Il reste seulement le score a atteindre dans ${activeMission.primaryGameName ?? "le jeu demande"}.`
            : `Commence par ouvrir le cours, descends jusqu'au quiz, puis vise 80% minimum avant de tenter ${activeMission.primaryGameName ?? "le defi jeu"}.`
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-4 md:p-6">
          <section
            className="comic-panel-dark relative overflow-hidden p-5 md:p-6"
            style={{ background: activeProfile.bannerBackground }}
          >
            <div className="absolute inset-0 opacity-[0.16] comic-dot-pattern-light" />
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                background:
                  "repeating-linear-gradient(128deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 18px)",
              }}
            />
            <div className="absolute inset-y-0 left-0 w-3" style={{ background: activeProfile.rail }} />

            <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300 text-outline">
                  Campagne Marvel
                </p>
                <h1 className="mt-3 text-3xl font-bold text-white text-outline md:text-5xl">
                  La carte de campagne
                </h1>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-200 text-outline md:text-lg">
                  Traverse les actes, avance sur la route principale et fais progresser ton pion de
                  mission en mission. `Aventure` devient enfin une vraie carte de progression.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-full border border-black/50 bg-slate-950/72 px-4 py-2 text-sm font-bold text-white">
                  {roadmap.completedCount}/{roadmap.totalCourses} missions validees
                </div>
                {activeCourse && (
                  <div className="rounded-full border border-black/50 bg-slate-950/56 px-4 py-2 text-sm font-bold text-slate-100">
                    Acte {activeCourse.palierId} / {activeProfile.chapterLabel}
                  </div>
                )}
                <Link
                  href="/tous-les-cours"
                  className="comic-button inline-flex items-center gap-2 bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <BookIcon className="h-4 w-4" />
                  Bibliotheque libre
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-6 space-y-6">
            {questState.recentlyCompletedMission && (
              <div className="rounded-[24px] border border-emerald-400/25 bg-emerald-500/14 px-5 py-4 text-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                  Mission validee
                </p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-outline">
                  Mission {questState.recentlyCompletedMission.courseId} bouclee. La suite de la
                  campagne est maintenant ouverte.
                </p>
              </div>
            )}

            <CampaignTreasureMap
              entries={roadmap.entries}
              activeCourseId={activeCourse?.courseId ?? null}
              missionPlans={missionPlans}
              playerToken={playerToken}
            />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <div
                className="comic-panel relative overflow-hidden border-2 border-black p-5 md:p-6"
                style={{ background: activeProfile.cardBackground }}
              >
                <div className="absolute inset-0 opacity-[0.16] comic-dot-pattern-light" />
                <div className="absolute inset-y-0 left-0 w-2" style={{ background: activeProfile.rail }} />

                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border-2 border-black p-3" style={{ background: activeProfile.rail }}>
                      <TrophyIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                        Mission active
                      </p>
                      <h2 className="text-xl font-bold text-white text-outline md:text-2xl">
                        {activeCourse
                          ? `Mission ${activeCourse.courseId}: ${activeCourse.title}`
                          : "Mission 1"}
                      </h2>
                    </div>
                  </div>

                  {activeCourse && activeMission ? (
                    <div className="mt-5 space-y-5">
                      <p className="text-sm font-semibold leading-relaxed text-slate-100 text-outline">
                        {activeMission.objective}
                      </p>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/25 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                            1. Point
                          </p>
                          <p className="mt-2 text-sm font-bold text-white">
                            {activeMissionState?.readingCheckpointReached
                              ? "Point atteint"
                              : "Atteindre le quiz"}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-300">
                            {activeCourse.estimatedMinutes} min pour descendre au checkpoint
                          </p>
                        </div>
                        <div className="rounded-2xl border border-indigo-400/20 bg-indigo-950/25 p-4">
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
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-950/25 p-4">
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

                      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-[26rem]">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-white">
                            <XPIcon className="h-4 w-4 text-emerald-300" />
                            <span>{activeCourse.rewardXp} XP</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-white">
                            <GoldIcon className="h-4 w-4 text-amber-300" />
                            <span>{activeCourse.rewardGold} or</span>
                          </div>
                        </div>
                      </div>

                      {missionInstruction && (
                        <div
                          className={`rounded-2xl border p-4 ${
                            activeMissionState?.readyToComplete
                              ? "border-emerald-400/25 bg-emerald-500/14 text-emerald-100"
                              : activeCourse.status === "unlocked"
                                ? "border-cyan-400/25 bg-cyan-500/14 text-cyan-100"
                                : "border-amber-400/25 bg-amber-500/14 text-amber-100"
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                            Ce que tu dois faire
                          </p>
                          <p className="mt-2 text-sm font-bold leading-relaxed text-outline">
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

                      {isLoggedIn && activeCourse.status === "unlocked" && (
                        <p className="text-sm font-semibold text-cyan-200 text-outline">
                          Un clic ici lance la mission puis ouvre directement le cours au bon mode.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm font-semibold text-slate-300">
                      La campagne commence par la premiere mission du parcours.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="comic-panel border-2 border-black bg-slate-900/82 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Regles du parcours
                  </p>
                  <div className="mt-4 space-y-3 text-sm font-semibold leading-relaxed text-slate-200">
                    <p>Atteins le point de passage en descendant jusqu'au quiz du cours.</p>
                    <p>Valide ensuite le quiz avec au moins 80% de bonnes reponses.</p>
                    <p>Termine par le score de jeu demande pour deverrouiller le point suivant.</p>
                  </div>

                  {!isLoggedIn && (
                      <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-950/20 p-4">
                        <p className="text-sm font-semibold text-amber-200 text-outline">
                          En invite, la carte reste visible mais la progression n'est pas sauvegardee.
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
                </div>

                {activeCourse && activeMission && (
                  <div className="comic-panel border-2 border-black bg-slate-900/82 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                      Mission en vue
                    </p>
                    <p className="mt-3 text-xl font-bold leading-tight text-white text-outline">
                      {activeCourse.title}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-200">
                      {activeMission.gameChallengeLabel}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
