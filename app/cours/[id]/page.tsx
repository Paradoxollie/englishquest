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

  // Récupérer le cours depuis les métadonnées (titre, etc.)
  // Note: On devrait importer getCourseById depuis @/lib/courses/data
  // Mais pour l'instant on va le faire dynamiquement ou importer si possible.
  // Pour éviter d'ajouter un import qui pourrait casser si le fichier n'exporte pas ce qu'on veut,
  // on va supposer que lessons[courseId] est la source de vérité pour le CONTENU,
  // mais on veut afficher quelque chose même si le contenu est vide.
  
  const lesson = lessons[courseId];

  if (!lesson) {
    // Si pas de leçon, on affiche une page "En construction" au lieu de 404
    // On essaie de récupérer le titre du cours depuis data.ts si possible, sinon titre générique
    // Pour simplifier ici sans modifier les imports, on met un placeholder.
    // Idéalement on importerait { getCourseById } from "@/lib/courses/data";
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern p-6 flex items-center justify-center">
        <div className="comic-panel-dark max-w-2xl w-full p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-600 mb-4">
            <span className="text-4xl">🚧</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-outline">
            Cours #{courseId} en construction
          </h1>
          <p className="text-lg text-slate-300">
            Ce cours est en cours de rédaction par notre équipe pédagogique.
            Revenez bientôt pour découvrir ce contenu !
          </p>
          <div className="pt-6">
            <a 
              href="/tous-les-cours" 
              className="comic-button bg-emerald-600 text-white px-6 py-3 font-bold hover:bg-emerald-700 inline-block"
            >
              Retour à la liste des cours
            </a>
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

