import { notFound } from "next/navigation";
import { LessonLayout, LessonSection } from "@/components/courses/lesson-layout";
import { lessons } from "@/lib/courses/lessons";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  // Vérifier que le cours existe
  const lesson = lessons[courseId];
  if (!lesson) {
    notFound();
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

