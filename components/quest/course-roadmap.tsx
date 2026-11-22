import { GuestMissionTransfer } from "@/components/quest/guest-mission-transfer";
import { getGuestProgress } from "@/lib/courses/guest-progress-server";
import { RecoverGuestPlacement } from "@/components/quest/recover-guest-placement";
import Image from "next/image";
import Link from "next/link";
import quay from "@/public/art/passage/quai.webp";
import { resolveArt } from "@/lib/art-server";
import { AdventureMap, type MapChapter, type MapMission } from "@/components/quest/adventure-map";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { chapters, getCourseShortName } from "@/lib/courses/chapters";
import { lessons } from "@/lib/courses/lessons";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { decodeCourseMissionTelemetry } from "@/lib/courses/mission-telemetry";
import { isCourseQuizScorePassing } from "@/lib/courses/quiz-score";
import { buildMissionSummary } from "@/lib/courses/mission-summary";
import {
  buildGuestCourseRoadmap,
  completeCourseAndGrantRewards,
  getUserCourseRoadmap,
  type CourseRoadmap,
  type CourseRoadmapEntry,
} from "@/lib/courses/progress";
import { getCachedUserCourseRoadmap } from "@/lib/courses/roadmap-cache";
import { getPlacementStatus, isPlacementSkip } from "@/lib/placement/placement";
import { getUserCoursePractice } from "@/lib/courses/practice-server";
import { getMissionStars, STARS_PER_MISSION, sumStars } from "@/lib/courses/stars";
import { getChapterExamReward, getLevelProgress } from "@/lib/profile/economy";
import { EXAM_QUESTION_COUNT, examStatus, getUserChapterExams } from "@/lib/exams/exams";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEquippedPortraitUrl } from "@/lib/shop/equipped-portrait";
import { DEFAULT_CHARACTER_FACE } from "@/lib/shop/characters";
import { getServerUser } from "@/lib/supabase/auth-cache";

type PlayerSummary = {
  username: string;
  avatarUrl: string;
  xp: number;
  gold: number;
};

async function getPlayerSummary(userId: string, fallbackName: string | undefined): Promise<PlayerSummary> {
  const name = fallbackName ?? "Joueur";
  try {
    const adminClient = createSupabaseAdminClient();
    const [{ data: profile }, avatarUrl] = await Promise.all([
      adminClient.from("profiles").select("username, xp, gold").eq("id", userId).maybeSingle(),
      getEquippedPortraitUrl(adminClient, userId),
    ]);
    const username = profile?.username ?? name;
    return {
      username,
      avatarUrl,
      xp: profile?.xp ?? 0,
      gold: profile?.gold ?? 0,
    };
  } catch {
    return { username: name, avatarUrl: DEFAULT_CHARACTER_FACE, xp: 0, gold: 0 };
  }
}

async function resolveRoadmap(userId: string): Promise<{
  roadmap: CourseRoadmap;
  justCompleted: CourseRoadmapEntry | null;
}> {
  let roadmap = await getCachedUserCourseRoadmap(userId);
  let justCompleted: CourseRoadmapEntry | null = null;
  // A guest may already have passed a later quiz before opening its prerequisite.
  for (let index = 0; index < roadmap.entries.length; index += 1) {
    const entry = roadmap.entries[index];
    if (entry.status !== "unlocked" && entry.status !== "in_progress") continue;
    const proof = decodeCourseMissionTelemetry(entry.missionTelemetry);
    if (!isCourseQuizScorePassing(proof.quizScore, proof.quizTotal)) continue;
    const result = await completeCourseAndGrantRewards(userId, entry.courseId);
    if (result.rewards.xp || result.rewards.gold) justCompleted = entry;
    roadmap = await getUserCourseRoadmap(userId);
  }
  return { roadmap, justCompleted };
}

export async function CourseRoadmap() {
  const user = await getServerUser();
  const isLoggedIn = Boolean(user);
  const guest = await getGuestProgress();
  const hasGuestProgress = guest.scores.size > 0 || guest.placementChapter !== null;

  const { roadmap, justCompleted } = user
    ? await resolveRoadmap(user.id)
    : { roadmap: buildGuestCourseRoadmap(guest.scores, guest.placementChapter ?? 1), justCompleted: null };

  const currentCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const fallbackName = user?.user_metadata?.username ?? (user?.email ? user.email.split("@")[0] : undefined);

  const [missionPlans, player, missionState, placement, examRecords, practice] = await Promise.all([
    getResolvedCourseMissionPlans(roadmap.entries),
    user ? getPlayerSummary(user.id, fallbackName) : Promise.resolve(null),
    user && currentCourse && currentCourse.status !== "locked"
      ? getUserCourseMissionState(user.id, currentCourse)
      : Promise.resolve(null),
    user ? getPlacementStatus(user.id) : Promise.resolve({ taken: false, chapter: null }),
    user ? getUserChapterExams(user.id) : Promise.resolve([]),
    user ? getUserCoursePractice(user.id) : Promise.resolve(new Map<number, number>()),
  ]);
  const starsByCourse = new Map(
    roadmap.entries.map((entry) => [entry.courseId, getMissionStars(entry, practice.get(entry.courseId))])
  );
  const totalStars = sumStars([...starsByCourse.values()]);

  const entriesById = new Map(roadmap.entries.map((entry) => [entry.courseId, entry]));
  const mapChapters: MapChapter[] = chapters.map((chapter) => {
    const nodes = chapter.courseIds
      .map((courseId) => entriesById.get(courseId))
      .filter((entry): entry is CourseRoadmapEntry => Boolean(entry))
      .map((entry) => {
        const plan = missionPlans[entry.courseId];
        const title = lessons[entry.courseId]?.title ?? entry.title;
        return {
          courseId: entry.courseId,
          title,
          shortName: getCourseShortName(title),
          status: entry.status,
          placed: isPlacementSkip(entry.missionTelemetry),
          stars: user ? starsByCourse.get(entry.courseId) ?? null : null,
          practiceBest: practice.get(entry.courseId) ?? 0,
          isCurrent: currentCourse?.courseId === entry.courseId,
          estimatedMinutes: entry.estimatedMinutes,
          rewardXp: entry.rewardXp,
          rewardGold: entry.rewardGold,
          gameName: plan?.primaryGameName ?? null,
          gameSlug: plan?.primaryGameSlug ?? null,
          challengeCompact: plan?.gameChallengeCompact ?? null,
        };
      });
    return {
      id: chapter.id,
      name: chapter.name,
      level: chapter.level,
      tagline: chapter.tagline,
      accent: chapter.accent,
      gradient: chapter.gradient,
      artSrc: resolveArt(chapter.artSrc),
      completedCount: nodes.filter((node) => node.status === "completed").length,
      nodes,
      exam: user
        ? (() => {
            const record = examRecords.find((item) => item.chapter === chapter.id);
            const chapterCompleted = nodes.length > 0 && nodes.every((node) => node.status === "completed");
            const reward = getChapterExamReward(chapter.id);
            return {
              status: examStatus(record, chapterCompleted),
              bestCorrect: record?.bestCorrect ?? null,
              total: record?.total ?? EXAM_QUESTION_COUNT,
              rewardXp: reward.xp,
              rewardGold: reward.gold,
            };
          })()
        : null,
    };
  });

  const currentPlan = currentCourse ? missionPlans[currentCourse.courseId] ?? null : null;

  const mission: MapMission | null =
    currentCourse && currentPlan
      ? buildMissionSummary({ entry: currentCourse, plan: currentPlan, state: missionState, isLoggedIn })
      : null;

  const level = player ? getLevelProgress(player.xp) : null;
  const completedPercent = roadmap.totalCourses > 0 ? Math.round((roadmap.completedCount / roadmap.totalCourses) * 100) : 0;
  const placedCount = roadmap.entries.filter((entry) => isPlacementSkip(entry.missionTelemetry)).length;

  return (
    <div className="eq-quest">
      {!guest.placementChapter ? <RecoverGuestPlacement /> : null}
      {isLoggedIn && hasGuestProgress ? <GuestMissionTransfer /> : null}
      <section className="eq-quest-head">
        <div className="eq-container eq-quest-head-row">
          <div className="grid justify-items-start gap-4">
            <Link href="/tous-les-cours" className="eq-text-link">← Tous les cours</Link>
            <h1 className="eq-cover-title eq-slam eq-slam-2">
              {player ? `${player.username}, ta carte des cours` : "50 missions, 5 chapitres"}
            </h1>
            <div className="eq-quest-progress eq-slam eq-slam-3" aria-label="Ta progression">
              <b>
                {roadmap.completedCount} / {roadmap.totalCourses}
              </b>
              <span>{placedCount ? `missions acquises · ${roadmap.completedCount - placedCount} par quiz, ${placedCount} au test de niveau` : "missions validées"}</span>
              <span className="eq-bar eq-bar-mint" aria-hidden="true">
                <i style={{ width: `${completedPercent}%` }} />
              </span>
              {level ? (
                <span className="eq-quest-progress-level">
                  Niveau {level.level} · {level.xpIntoLevel} / {level.xpForLevel} XP
                </span>
              ) : null}
            </div>
          </div>
          <div className="eq-quest-next eq-slam eq-slam-4">
            <span className="eq-caption">{currentCourse ? "Mon prochain cours" : "Parcours terminé"}</span>
            <p>
              {currentCourse ? (
                <>
                  <b>
                    Mission {currentCourse.courseId} ·{" "}
                    {getCourseShortName(lessons[currentCourse.courseId]?.title ?? currentCourse.title)}
                  </b>
                  <br />
                  Lis la leçon, entraîne-toi et réussis le quiz à 80 %.
                </>
              ) : (
                "Toutes les missions sont validées. Les jeux restent ouverts."
              )}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {mission ? (
                <Link href={mission.cta.href} className="eq-btn eq-btn-primary">
                  {mission.cta.label}
                </Link>
              ) : null}
              {isLoggedIn && roadmap.completedCount === 0 && !placement.taken ? (
                <Link href="/test-de-niveau" className="eq-text-link">
                  Tester mon niveau
                </Link>
              ) : null}
              {!isLoggedIn ? (
                <Link href="/auth/signup?next=/tous-les-cours/parcours" className="eq-text-link">
                  {hasGuestProgress ? "Garder ma progression avec un compte" : "Créer un compte"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="eq-container eq-atlas-invitation">
        <Link href="/quest/atlas" prefetch={false} aria-labelledby="atlas-invitation-title" aria-describedby="atlas-invitation-intro">
          <Image src={quay} alt="" width={112} height={72} sizes="112px" />
          <span>
            <strong id="atlas-invitation-title">Essayer l’aventure BD</strong>
            <span id="atlas-invitation-intro">Au quai 7, le robot attend ton nom de code. À toi de te présenter en anglais.</span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {justCompleted ? (
        <div className="eq-container">
          <div className="eq-quest-toast eq-pop" role="status">
            <b>Mission {justCompleted.courseId} validée.</b> {lessons[justCompleted.courseId]?.title ?? justCompleted.title} :
            {" "}+{justCompleted.rewardXp} XP et +{justCompleted.rewardGold} or.
            {justCompleted.courseId === 50 ? " Tu as atteint la dernière mission." : " La mission suivante est ouverte."}
            {" "}<Link href="/profile#boutique" className="eq-text-link">Voir ma collection</Link>
          </div>
        </div>
      ) : null}

      <div className="eq-container eq-quest-legend" aria-label="Légende">
        <span><i className="eq-legend-dot is-completed" /> Validée</span>
        <span><i className="eq-legend-dot is-current" /> En cours</span>
        <span><i className="eq-legend-dot is-locked" /> À venir, lisible quand même</span>
        {user ? (
          <span className="eq-quest-legend-stars">
            <b>
              Étoiles : {totalStars} / {roadmap.entries.length * STARS_PER_MISSION}
            </b>{" "}
            Une pour la mission validée, une pour le quiz à 10 sur 10, une pour 5 bonnes réponses ciblées dans Grammar Rush.
          </span>
        ) : null}
      </div>

      <div className="eq-container eq-quest-map-wrap">
        <AdventureMap
          chapters={mapChapters}
          mission={mission}
          playerFaceUrl={player?.avatarUrl ?? DEFAULT_CHARACTER_FACE}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}
