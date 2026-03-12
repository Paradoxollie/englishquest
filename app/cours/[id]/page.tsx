import type { Metadata } from "next";
import Link from "next/link";
import {
  LessonLayout,
  LessonSection,
  createLessonSectionId,
} from "@/components/courses/lesson-layout";
import { CourseExperiencePanel } from "@/components/courses/course-experience-panel";
import { CourseTableOfContents } from "@/components/courses/course-table-of-contents";
import { getCourseById, getPalierForCourse, paliers } from "@/lib/courses/data";
import { lessons } from "@/lib/courses/lessons";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
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
    return {
      title: "Cours introuvable",
    };
  }

  const description =
    lesson?.objective ||
    `${course.title} - cours d'anglais English Quest${palier ? ` (${palier.level})` : ""}.`;

  return {
    title: `Cours ${course.id} - ${course.title}`,
    description,
    alternates: {
      canonical: `/cours/${course.id}`,
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const courseId = Number.parseInt(id, 10);
  const lesson = lessons[courseId];
  const course = getCourseById(courseId);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const roadmapEntry =
    roadmap.entries.find((entry) => entry.courseId === courseId) ?? null;
  const previousEntry =
    roadmap.entries.find((entry) => entry.courseId === courseId - 1) ?? null;
  const nextEntry =
    roadmap.entries.find((entry) => entry.courseId === courseId + 1) ?? null;
  const sectionAnchors = lesson
    ? lesson.sections.map((section, index) => ({
        id: createLessonSectionId(section.title, index),
        title: section.title,
      }))
    : [];

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6 comic-dot-pattern">
        <div className="comic-panel-dark w-full max-w-2xl space-y-6 p-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800">
            <span className="text-4xl">?</span>
          </div>
          <h1 className="text-3xl font-bold text-white text-outline md:text-4xl">
            {course ? `${course.title}` : `Cours #${courseId}`} en construction
          </h1>
          <p className="text-lg text-slate-300">
            Ce cours est en cours de redaction par l'equipe pedagogique.
          </p>
          <div className="pt-6">
            <Link
              href="/tous-les-cours"
              className="comic-button inline-block bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
            >
              Retour a la liste des cours
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LessonLayout
      courseNumber={lesson.courseNumber}
      title={lesson.title}
      objective={lesson.objective}
    >
      {roadmapEntry && (
        <CourseExperiencePanel
          entry={roadmapEntry}
          previousEntry={previousEntry}
          nextEntry={nextEntry}
          isAuthenticated={Boolean(user)}
        />
      )}
      {sectionAnchors.length > 1 && <CourseTableOfContents sections={sectionAnchors} />}
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
    </LessonLayout>
  );
}
