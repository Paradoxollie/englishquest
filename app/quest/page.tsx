import type { Metadata } from "next";
import Link from "next/link";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
import { AdventureMap, type MapChapter, type MapMission } from "@/components/quest/adventure-map";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { chapters, getChapterForCourse, getCourseShortName } from "@/lib/courses/chapters";
import { lessons } from "@/lib/courses/lessons";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { buildMissionSummary } from "@/lib/courses/mission-summary";
import {
  buildGuestCourseRoadmap,
  completeCourseAndGrantRewards,
  getUserCourseRoadmap,
  type CourseRoadmap,
  type CourseRoadmapEntry,
} from "@/lib/courses/progress";
import { getPlacementStatus, isPlacementSkip } from "@/lib/placement/placement";
import { getChapterExamReward, getLevelProgress } from "@/lib/profile/economy";
import { EXAM_QUESTION_COUNT, examStatus, getUserChapterExams } from "@/lib/exams/exams";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Aventure",
  description:
    "La carte d'aventure English Quest : 50 missions en 5 chapitres, du niveau débutant au niveau avancé. Un cours, un quiz, un défi de jeu, puis la suite.",
};

export const dynamic = "force-dynamic";

type PlayerSummary = {
  username: string;
  initial: string;
  avatarUrl: string | null;
  xp: number;
  gold: number;
};

async function getPlayerSummary(userId: string, fallbackName: string | undefined): Promise<PlayerSummary> {
  const name = fallbackName ?? "Joueur";
  try {
    const adminClient = createSupabaseAdminClient();
    const [{ data: profile }, { data: equipped }] = await Promise.all([
      adminClient.from("profiles").select("username, xp, gold").eq("id", userId).maybeSingle(),
      adminClient
        .from("user_equipped_items")
        .select("equipped_avatar:shop_items!equipped_avatar_id(image_url)")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    const avatar = Array.isArray(equipped?.equipped_avatar) ? equipped.equipped_avatar[0] : equipped?.equipped_avatar;
    const username = profile?.username ?? name;
    return {
      username,
      initial: username.charAt(0).toUpperCase(),
      avatarUrl: avatar?.image_url ?? null,
      xp: profile?.xp ?? 0,
      gold: profile?.gold ?? 0,
    };
  } catch {
    return { username: name, initial: name.charAt(0).toUpperCase(), avatarUrl: null, xp: 0, gold: 0 };
  }
}

async function resolveRoadmap(userId: string): Promise<{
  roadmap: CourseRoadmap;
  justCompleted: CourseRoadmapEntry | null;
}> {
  const roadmap = await getUserCourseRoadmap(userId);
  const active = roadmap.currentCourse;
  if (!active || active.status !== "in_progress") {
    return { roadmap, justCompleted: null };
  }
  const state = await getUserCourseMissionState(userId, active);
  if (!state.readyToComplete) {
    return { roadmap, justCompleted: null };
  }
  await completeCourseAndGrantRewards(userId, active.courseId);
  return { roadmap: await getUserCourseRoadmap(userId), justCompleted: active };
}

export default async function QuestPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  const { roadmap, justCompleted } = user
    ? await resolveRoadmap(user.id)
    : { roadmap: buildGuestCourseRoadmap(), justCompleted: null };

  const currentCourse = roadmap.currentCourse ?? roadmap.recommendedCourse ?? roadmap.entries[0] ?? null;
  const fallbackName = user?.user_metadata?.username ?? (user?.email ? user.email.split("@")[0] : undefined);

  const [missionPlans, player, missionState, placement, examRecords] = await Promise.all([
    getResolvedCourseMissionPlans(roadmap.entries),
    user ? getPlayerSummary(user.id, fallbackName) : Promise.resolve(null),
    user && currentCourse && currentCourse.status !== "locked"
      ? getUserCourseMissionState(user.id, currentCourse)
      : Promise.resolve(null),
    user ? getPlacementStatus(user.id) : Promise.resolve({ taken: false, chapter: null }),
    user ? getUserChapterExams(user.id) : Promise.resolve([]),
  ]);

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
  const currentChapter = currentCourse ? getChapterForCourse(currentCourse.courseId) : chapters[0];

  const mission: MapMission | null =
    currentCourse && currentPlan
      ? buildMissionSummary({ entry: currentCourse, plan: currentPlan, state: missionState, isLoggedIn })
      : null;

  const level = player ? getLevelProgress(player.xp) : null;
  const completedPercent = roadmap.totalCourses > 0 ? Math.round((roadmap.completedCount / roadmap.totalCourses) * 100) : 0;
  const heroArt = resolveArt(ART.act(1));

  return (
    <div className="eq-quest">
      <section className="eq-quest-hero" style={heroArt ? { backgroundImage: `url(${heroArt})` } : undefined}>
        <div className="eq-container eq-quest-hero-grid">
          <div>
            <p className="eq-kicker">Aventure</p>
            <h1 className="eq-h1">
              {player ? `${player.username}, ta route continue.` : "Cinquante missions, une seule route."}
            </h1>
            <p className="eq-lead">
              Chaque mission, c&apos;est un cours à lire, un quiz à réussir à 80 % et un défi dans un jeu. Quand les
              trois sont faits, la mission suivante s&apos;ouvre. Pas de classe, pas d&apos;âge : seulement ton niveau.
            </p>
            <div className="eq-quest-actions">
              {mission ? (
                <Link href={mission.cta.href} className="eq-btn eq-btn-gold eq-btn-lg">
                  {mission.cta.label}
                </Link>
              ) : null}
              {isLoggedIn && roadmap.completedCount === 0 && !placement.taken ? (
                <Link href="/test-de-niveau" className="eq-btn eq-btn-primary eq-btn-lg">
                  Test de niveau
                </Link>
              ) : null}
              <a href="#mission-courante" className="eq-btn eq-btn-ghost eq-btn-lg">
                Me situer sur la carte
              </a>
              {!isLoggedIn ? (
                <Link href="/auth/signup" className="eq-btn eq-btn-ghost eq-btn-lg">
                  Créer un compte
                </Link>
              ) : null}
            </div>
          </div>

          <div className="eq-quest-stats" aria-label="Ta progression">
            <div className="eq-quest-stat">
              <span>Missions validées</span>
              <b>
                {roadmap.completedCount} <small>/ {roadmap.totalCourses}</small>
              </b>
              <span className="eq-bar eq-bar-mint" aria-hidden="true">
                <i style={{ width: `${completedPercent}%` }} />
              </span>
            </div>
            <div className="eq-quest-stat">
              <span>Chapitre en cours</span>
              <b>
                {currentChapter.id} <small>{currentChapter.name}</small>
              </b>
              <em>{currentChapter.level}</em>
            </div>
            {level ? (
              <div className="eq-quest-stat">
                <span>Niveau</span>
                <b>
                  {level.level} <small>{level.xpIntoLevel} / {level.xpForLevel} XP</small>
                </b>
                <span className="eq-bar eq-bar-cyan" aria-hidden="true">
                  <i style={{ width: `${level.percent}%` }} />
                </span>
              </div>
            ) : (
              <div className="eq-quest-stat">
                <span>Lecture libre</span>
                <b>50 <small>cours ouverts</small></b>
                <em>Sans compte, tout se lit. Avec un compte, tout compte.</em>
              </div>
            )}
          </div>
        </div>
      </section>

      {justCompleted ? (
        <div className="eq-container">
          <div className="eq-quest-toast eq-pop" role="status">
            <b>Mission {justCompleted.courseId} validée.</b> {lessons[justCompleted.courseId]?.title ?? justCompleted.title} :
            {" "}+{justCompleted.rewardXp} XP et +{justCompleted.rewardGold} or. La mission suivante est ouverte.
          </div>
        </div>
      ) : null}

      <div className="eq-container eq-quest-legend" aria-label="Légende">
        <span><i className="eq-legend-dot is-completed" /> Validée</span>
        <span><i className="eq-legend-dot is-current" /> En cours</span>
        <span><i className="eq-legend-dot is-locked" /> À venir, lisible quand même</span>
      </div>

      <div className="eq-container eq-quest-map-wrap">
        <AdventureMap
          chapters={mapChapters}
          mission={mission}
          player={player ? { initial: player.initial, avatarUrl: player.avatarUrl } : null}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}
