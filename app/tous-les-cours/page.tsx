import Link from "next/link";
import { paliers } from "@/lib/courses/data";
import { BookIcon, QuestIcon } from "@/components/ui/icons";
import { MotionCard } from "@/components/ui/motion-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Page "Tous les cours" - Bibliothèque complète des 50 cours
 * 
 * Cette page est distincte de "Continuer l'aventure" (/quest) :
 * - /quest = mode aventure/progression (quêtes, niveaux, narration)
 * - /tous-les-cours = terrain d'entraînement / index des cours
 * 
 * Les utilisateurs peuvent choisir librement n'importe quel cours
 * pour s'entraîner ou renforcer leurs compétences.
 */
export default async function TousLesCoursPage() {
  // Vérifier si l'utilisateur est connecté (pour affichage conditionnel si nécessaire)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-6 md:p-8">
        {/* Hero Section */}
        <div className="comic-panel-dark mb-12 p-8" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}>
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-4">
              <div className="comic-panel bg-indigo-600 border-2 border-black p-4">
                <BookIcon className="w-8 h-8 text-white text-outline" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white md:text-5xl text-outline">
                  Tous les cours
                </h1>
                <p className="mt-2 text-lg text-slate-200 font-semibold text-outline">
                  Choisis un cours pour t'entraîner avant de retourner dans l'aventure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Explicative Paragraph */}
        <div className="comic-panel-dark mb-12 p-6">
          <div className="relative z-10">
            <p className="mb-4 text-base leading-relaxed text-slate-200 text-outline">
              Cette page est une <strong className="text-white">liste complète d'entraînement</strong> de tous les cours de grammaire et de méthodologie fondamentaux. 
              Chaque bloc de 10 cours constitue un <strong className="text-white">palier</strong> dans ton parcours d'apprentissage.
            </p>
            <p className="text-base leading-relaxed text-slate-200 text-outline">
              Tu peux soit suivre les cours dans l'ordre (1 → 50), soit accéder directement à un sujet spécifique quand tu en as besoin.
            </p>
          </div>
        </div>

        {/* Call to Action for non-logged users */}
        {!isLoggedIn && (
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="comic-button bg-emerald-600 text-white px-6 py-3 font-bold hover:bg-emerald-700"
            >
              Créer mon compte
            </Link>
            <Link
              href="/auth/login"
              className="comic-button bg-slate-800 text-white px-6 py-3 font-bold hover:bg-slate-700"
            >
              Se connecter
            </Link>
          </div>
        )}

        {/* Paliers Section */}
        <div className="space-y-8">
          {paliers.map((palier) => {
            // Couleurs des paliers selon la difficulté (progression du vert au rouge)
            const palierColors = [
              { // Palier 1 - Facile (Vert/Emerald)
                bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(34, 197, 94, 0.25) 100%)",
                badge: "bg-emerald-600",
                border: "border-emerald-500/30",
              },
              { // Palier 2 - Facile-Intermediaire (Cyan/Blue)
                bg: "linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)",
                badge: "bg-cyan-600",
                border: "border-cyan-500/30",
              },
              { // Palier 3 - Intermediaire (Indigo/Purple)
                bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)",
                badge: "bg-indigo-600",
                border: "border-indigo-500/30",
              },
              { // Palier 4 - Intermediaire-Avancé (Purple/Pink)
                bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)",
                badge: "bg-purple-600",
                border: "border-purple-500/30",
              },
              { // Palier 5 - Avancé (Red/Orange)
                bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(249, 115, 22, 0.25) 100%)",
                badge: "bg-red-600",
                border: "border-red-500/30",
              },
            ];
            
            const palierColor = palierColors[palier.id - 1];
            
            return (
              <MotionCard key={palier.id}>
                <div 
                  className="comic-card-dark p-6 md:p-8 border-2" 
                  style={{ 
                    background: palierColor.bg,
                    borderColor: palier.id === 1 ? 'rgba(16, 185, 129, 0.3)' :
                                 palier.id === 2 ? 'rgba(6, 182, 212, 0.3)' :
                                 palier.id === 3 ? 'rgba(99, 102, 241, 0.3)' :
                                 palier.id === 4 ? 'rgba(168, 85, 247, 0.3)' :
                                 'rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <div className="relative z-10">
                    {/* Palier Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <div className={`comic-panel ${palierColor.badge} border-2 border-black px-4 py-2`}>
                            <span className="text-xl font-bold text-white text-outline">
                              Palier {palier.id}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 text-outline">
                          {palier.title}
                        </h2>
                        <p className="text-slate-300 text-outline">
                          {palier.description}
                        </p>
                      </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {palier.courses.map((course) => {
                        // Code couleur pour grammaire (bleu) vs méthodologie (ambre)
                        const courseBgColor = course.type === "methodology"
                          ? "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)"
                          : "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)";
                        
                        return (
                          <Link
                            key={course.id}
                            href={`/cours/${course.id}`}
                            className="comic-card-dark group relative p-5 transition-transform duration-200 hover:scale-105 flex flex-col items-center text-center"
                            style={{ background: courseBgColor }}
                            aria-label={`Accéder au cours ${course.id}: ${course.title}`}
                          >
                            <div className="relative z-10 w-full flex flex-col items-center">
                              {/* Course Number - Simple bulle avec juste le numéro */}
                              <div className="mb-4 flex items-center justify-center">
                                <div className="comic-panel bg-slate-800 border-2 border-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-lg font-bold text-white text-outline">
                                    {course.id}
                                  </span>
                                </div>
                              </div>

                              {/* Course Title - Centré avec meilleure lisibilité */}
                              <div className="mb-4 min-h-[4rem] flex items-center justify-center px-2">
                                <h3 className="text-base font-bold text-white text-outline line-clamp-3 leading-tight" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)' }}>
                                  {course.title}
                                </h3>
                              </div>

                              {/* CTA Button */}
                              <div className="comic-button bg-emerald-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-emerald-700 w-full">
                                Voir le cours
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </MotionCard>
            );
          })}
        </div>

        {/* Link back to adventure */}
        <div className="mt-12 text-center">
          <Link
            href="/quest"
            className="comic-button bg-emerald-600 text-white px-6 py-3 font-bold hover:bg-emerald-700 inline-flex items-center gap-2"
          >
            <QuestIcon className="w-5 h-5" />
            Retourner à l'aventure
          </Link>
        </div>

        {/* TODO: Later, integrate with real course routes:
        
        - Replace href={`/course/${course.id}`} with actual course routes
        - Fetch user progress from Supabase to show completion status
        - Add locked/unlocked states based on progression
        - Add search/filter functionality
        - Add course previews or descriptions
        
        */}
        </div>
      </div>
    </div>
  );
}

