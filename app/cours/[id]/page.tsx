import { getGuestRoadmap } from "@/lib/courses/guest-progress-server";
import { createHash } from "node:crypto";
import { LessonPractice } from "@/components/courses/lesson-practice";
import { getCoursePracticeHref } from "@/lib/courses/practice";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LessonLayout,
  LessonSection,
  createLessonSectionId,
} from "@/components/courses/lesson-layout";
import { CourseMissionProvider } from "@/components/courses/course-mission-provider";
import { CourseTableOfContents } from "@/components/courses/course-table-of-contents";
import { MissionBar } from "@/components/courses/mission-bar";
import { getCourseById, getPalierForCourse, paliers } from "@/lib/courses/data";
import { lessons } from "@/lib/courses/lessons";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getResolvedCourseMissionPlan } from "@/lib/courses/campaign-server";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { getChapterForCourse } from "@/lib/courses/chapters";
import { publicPageMetadata } from "@/lib/site/metadata";
import { getCachedUserCourseRoadmap } from "@/lib/courses/roadmap-cache";
import { getUserCoursePractice } from "@/lib/courses/practice-server";
import { getCourseExtraExercises } from "@/lib/courses/exercises-server";
import { lessonPrompts } from "@/lib/courses/lesson-prompts";
import { getServerUser } from "@/lib/supabase/auth-cache";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = false;
export const revalidate = 0;
export const fetchCache = "force-no-store";

export function generateStaticParams() {
  return paliers.flatMap((palier) =>
    palier.courses.map((course) => ({
      id: String(course.id),
    }))
  );
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const courseId = Number.parseInt(id, 10);
  const course = getCourseById(courseId);
  const palier = getPalierForCourse(courseId);
  const lesson = lessons[courseId];

  if (!course) {
    return { title: "Cours introuvable" };
  }

  const title = lesson?.title ?? course.title;
  const description =
    lesson?.objective || `${title}, cours d'anglais English Quest${palier ? ` (${palier.level})` : ""}.`;

  const chapter = getChapterForCourse(course.id);
  return publicPageMetadata({
    path: `/cours/${course.id}`,
    title: course.id === 23 ? "For ou since en anglais ? La règle et le quiz" : `${title} · Cours ${course.id}`,
    description,
    image: chapter.artSrc,
    imageAlt: `Illustration du chapitre « ${chapter.name} » d’English Quest.`,
  });
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const courseId = Number.parseInt(id, 10);
  const lesson = lessons[courseId];
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const user = await getServerUser();
  const roadmap = user ? await getCachedUserCourseRoadmap(user.id) : await getGuestRoadmap();
  const roadmapEntry = roadmap.entries.find((entry) => entry.courseId === courseId) ?? null;
  const nextEntry = roadmap.entries.find((entry) => entry.courseId === courseId + 1) ?? null;
  const palier = getPalierForCourse(courseId);
  const chapter = getChapterForCourse(courseId);

  const [missionState, missionPlan, practice] = await Promise.all([
    user && roadmapEntry ? getUserCourseMissionState(user.id, roadmapEntry) : Promise.resolve(null),
    roadmapEntry ? getResolvedCourseMissionPlan(roadmapEntry) : Promise.resolve(null),
    user ? getUserCoursePractice(user.id) : Promise.resolve(new Map<number, number>()),
  ]);

  const sectionAnchors = lesson
    ? lesson.sections.map((section, index) => ({
        id: createLessonSectionId(section.title, index),
        title: section.title,
      }))
    : [];

  const isMissionTrackingEnabled = Boolean(
    user && roadmapEntry && (roadmapEntry.status === "in_progress" || roadmapEntry.status === "completed")
  );
  const shouldAutoLaunch = Boolean(
    user &&
      roadmapEntry &&
      (roadmapEntry.status === "unlocked" || (roadmapEntry.status === "locked" && courseId === 1))
  );

  if (!lesson) {
    return (
      <div className="eq-container eq-section">
        <div className="eq-card mx-auto max-w-xl p-8 text-center">
          <h1 className="eq-h2">{course.title}</h1>
          <p className="mt-3 text-[var(--muted)]">Ce cours est en cours d&apos;écriture.</p>
          <Link href="/tous-les-cours" className="eq-btn eq-btn-ghost mt-6">
            Retour aux cours
          </Link>
        </div>
      </div>
    );
  }

  const chapterLabel = `Chapitre ${chapter.id} · ${chapter.name}`;
  const prompt = lessonPrompts[courseId];
  const mission = roadmapEntry ? missionPlan ?? getCourseMissionPlan(roadmapEntry) : null;
  const practiceHref = mission?.primaryGameSlug && (!user || roadmapEntry?.status !== "locked") ? getCoursePracticeHref(courseId) : null;
  const reader = user ? createHash("sha256").update(user.id).digest("hex").slice(0, 20) : "guest";

  return (
    <CourseMissionProvider
      courseNumber={lesson.courseNumber}
      isAuthenticated={Boolean(user)}
      isMissionTrackingEnabled={isMissionTrackingEnabled}
      initialMissionState={missionState}
      autoLaunch={shouldAutoLaunch}
      extraExercises={getCourseExtraExercises(courseId)}
    >
      <LessonLayout
        courseNumber={lesson.courseNumber}
        title={lesson.title}
        objective={lesson.objective}
        levelLabel={palier?.level}
        typeLabel={roadmapEntry?.typeLabel}
        topBar={
          roadmapEntry && mission ? (
            <MissionBar
              entry={roadmapEntry}
              mission={mission}
              chapterLabel={chapterLabel}
              nextEntry={nextEntry}
              practiceBest={practice.get(courseId) ?? 0}
            />
          ) : null
        }
        aside={
          sectionAnchors.length > 1 ? (
            <CourseTableOfContents sections={sectionAnchors} estimatedMinutes={roadmapEntry?.estimatedMinutes} />
          ) : null
        }
      >
        {lesson.sections.map((section, index) => {
          const quiz = /^quiz\b/i.test(section.title);
          return <div key={sectionAnchors[index].id}>
            {index === 0 && <h2 className="eq-course-part" id="lecon"><small>Partie 1</small> Le cours</h2>}
            {quiz && <>
              {prompt && <LessonPractice key={`${reader}-${courseId}`} course={courseId} prompt={prompt} gameHref={practiceHref} reader={reader} />}
              <h2 className="eq-course-part" id="validation"><small>Partie 3</small> Le quiz</h2>
            </>}
            <LessonSection id={sectionAnchors[index].id} sectionIndex={index} title={section.title}>{section.content}</LessonSection>
          </div>;
        })}
        <nav className="eq-lesson-nav" aria-label="Cours voisins">
          {courseId > 1 ? (
            <Link href={`/cours/${courseId - 1}`} className="eq-btn eq-btn-ghost">
              Cours {courseId - 1}
            </Link>
          ) : (
            <span />
          )}
          <Link href="/tous-les-cours" className="eq-btn eq-btn-ghost">
            Tous les cours
          </Link>
          {nextEntry ? (
            <Link href={`/cours/${nextEntry.courseId}`} className="eq-btn eq-btn-ghost">
              Cours {nextEntry.courseId}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </LessonLayout>
    </CourseMissionProvider>
  );
}
