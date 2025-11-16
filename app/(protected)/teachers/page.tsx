import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TeacherIcon, ScrollIcon, BookIcon, TrophyIcon, UsersIcon, SparklesIcon } from "@/components/ui/icons";
import { MotionCard } from "@/components/ui/motion-card";

// Force dynamic rendering - this page requires authentication and teacher/admin role
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function TeachersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  // Permettre à tous les utilisateurs connectés de voir la page "en construction"
  // mais afficher un message différent si l'utilisateur n'est pas prof/admin
  const isTeacherOrAdmin = profile?.role === "teacher" || profile?.role === "admin";

  const features = [
    {
      icon: ScrollIcon,
      title: "Cours clés en main",
      description: "Accédez à une bibliothèque complète de cours prêts à utiliser, adaptés aux différents niveaux de vos élèves.",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: BookIcon,
      title: "Activités pédagogiques",
      description: "Téléchargez des activités ludiques et interactives pour rendre l'apprentissage de l'anglais plus engageant.",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: TrophyIcon,
      title: "Tableaux de bord de classe",
      description: "Suivez la progression de vos élèves, leurs scores, leurs niveaux et leurs réalisations en temps réel.",
      color: "from-amber-500 to-yellow-600",
    },
    {
      icon: UsersIcon,
      title: "Gestion des élèves",
      description: "Créez et gérez les comptes de vos élèves, assignez des missions et suivez leur parcours d'apprentissage.",
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12">
        {/* Hero Section */}
        <div className="comic-panel-dark mb-8 p-6" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)" }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="comic-panel bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-black p-4">
              <TeacherIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white text-outline">
                Le coin des profs
              </h1>
              <p className="text-slate-300 text-outline font-semibold mt-1">
                Espace dédié aux professeurs d'anglais
              </p>
            </div>
          </div>
        </div>

        {/* Construction Notice */}
        <MotionCard>
          <div className="comic-panel-dark p-8 text-center">
            <div className="mb-6 text-6xl">🚧</div>
            <h2 className="text-3xl font-bold text-white mb-4 text-outline">
              En construction
            </h2>
            {isTeacherOrAdmin ? (
              <p className="text-lg text-slate-300 text-outline font-semibold mb-6 max-w-2xl mx-auto">
                Cette section est actuellement en développement. Nous travaillons activement pour vous offrir des outils pédagogiques complets et innovants.
              </p>
            ) : (
              <p className="text-lg text-slate-300 text-outline font-semibold mb-6 max-w-2xl mx-auto">
                Cette section est réservée aux professeurs. Si vous êtes professeur et souhaitez accéder à cette section, veuillez contacter l&apos;administrateur pour obtenir le rôle approprié.
              </p>
            )}
          </div>
        </MotionCard>

        {/* Features Preview - Only show if teacher/admin */}
        {isTeacherOrAdmin && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-outline text-center">
            Ce qui vous attend
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionCard key={index}>
                  <div className="comic-panel-dark p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className={`comic-panel bg-gradient-to-br ${feature.color} border-2 border-black p-3 flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2 text-outline">
                          {feature.title}
                        </h4>
                        <p className="text-slate-300 text-outline font-semibold">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </MotionCard>
              );
            })}
          </div>
        </div>
        )}

        {/* Premium Access Section - Only show if teacher/admin */}
        {isTeacherOrAdmin && (
        <MotionCard>
          <div className="comic-panel-dark p-8 mt-8" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)" }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="comic-panel bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-black p-3">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 text-outline">
                  Accès Premium
                </h3>
                <p className="text-slate-300 text-outline font-semibold">
                  Un accès premium sera disponible pour accéder à l'ensemble des cours et activités clés en main.
                </p>
              </div>
            </div>
            <div className="space-y-4 text-slate-200 text-outline">
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">✓</span>
                <p className="font-semibold">
                  <strong className="text-white">Cours complets</strong> : Accédez à tous les cours de la bibliothèque avec leurs supports pédagogiques détaillés
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">✓</span>
                <p className="font-semibold">
                  <strong className="text-white">Activités exclusives</strong> : Téléchargez des activités premium non disponibles dans la version standard
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">✓</span>
                <p className="font-semibold">
                  <strong className="text-white">Ressources imprimables</strong> : Fiches d'exercices, missions et supports de cours prêts à imprimer
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">✓</span>
                <p className="font-semibold">
                  <strong className="text-white">Support prioritaire</strong> : Bénéficiez d'un support dédié pour vos questions et besoins pédagogiques
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 comic-panel bg-slate-800/50 border-2 border-purple-500/30 rounded-lg">
              <p className="text-sm text-slate-300 text-outline font-semibold">
                💡 <strong className="text-purple-300">Bientôt disponible</strong> : Les informations sur les tarifs et l'abonnement premium seront communiquées prochainement.
              </p>
            </div>
          </div>
        </MotionCard>
        )}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-outline font-semibold">
            Restez connecté pour être informé de l'ouverture de cette section !
          </p>
        </div>
    </div>
  );
}

