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
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return {
    title: `Cours ${course.id} : ${title}`,
    description,
    alternates: { canonical: `/cours/${course.id}` },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const courseId = Number.parseInt(id, 10);
  const lesson = lessons[courseId];
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const roadmapEntry = roadmap.entries.find((entry) => entry.courseId === courseId) ?? null;
  const nextEntry = roadmap.entries.find((entry) => entry.courseId === courseId + 1) ?? null;
  const palier = getPalierForCourse(courseId);
  const chapter = getChapterForCourse(courseId);

  const [missionState, missionPlan] = await Promise.all([
    user && roadmapEntry ? getUserCourseMissionState(user.id, roadmapEntry) : Promise.resolve(null),
    roadmapEntry ? getResolvedCourseMissionPlan(roadmapEntry) : Promise.resolve(null),
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
  const mission = roadmapEntry ? missionPlan ?? getCourseMissionPlan(roadmapEntry) : null;

  return (
    <CourseMissionProvider
      courseNumber={lesson.courseNumber}
      isAuthenticated={Boolean(user)}
      isMissionTrackingEnabled={isMissionTrackingEnabled}
      initialMissionState={missionState}
      autoLaunch={shouldAutoLaunch}
    >
      <LessonLayout
        courseNumber={lesson.courseNumber}
        title={lesson.title}
        objective={lesson.objective}
        levelLabel={palier?.level}
        typeLabel={roadmapEntry?.typeLabel}
        topBar={
          roadmapEntry && mission ? (
            <MissionBar entry={roadmapEntry} mission={mission} chapterLabel={chapterLabel} nextEntry={nextEntry} />
          ) : null
        }
        aside={
          sectionAnchors.length > 1 ? (
            <CourseTableOfContents sections={sectionAnchors} estimatedMinutes={roadmapEntry?.estimatedMinutes} />
          ) : null
        }
      >
        {lesson.sections.map((section, index) => (
          <LessonSection
            key={sectionAnchors[index]?.id ?? index}
            id={sectionAnchors[index]?.id}
            sectionIndex={index}
            title={section.title}
          >
            {section.content}
          </LessonSection>
        ))}
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
