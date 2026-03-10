import type { Metadata } from "next";
import Link from "next/link";
import { LessonLayout, LessonSection } from "@/components/courses/lesson-layout";
import { getCourseById, getPalierForCourse, paliers } from "@/lib/courses/data";
import { lessons } from "@/lib/courses/lessons";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

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
      {lesson.sections.map((section, index) => (
        <LessonSection key={index} title={section.title}>
          {section.content}
        </LessonSection>
      ))}
    </LessonLayout>
  );
}
