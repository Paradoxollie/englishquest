import Link from "next/link";
import { MotionCard } from "@/components/ui/motion-card";
import { BookIcon, GoldIcon, QuestIcon, XPIcon } from "@/components/ui/icons";
import { paliers } from "@/lib/courses/data";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type QuestStatus = "locked" | "unlocked" | "in_progress" | "completed";

const palierGradients = [
  "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(34, 197, 94, 0.22) 100%)",
  "linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(59, 130, 246, 0.22) 100%)",
  "linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.22) 100%)",
  "linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(236, 72, 153, 0.22) 100%)",
  "linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(249, 115, 22, 0.22) 100%)",
];

const statusStyles: Record<QuestStatus, string> = {
  locked: "bg-slate-700",
  unlocked: "bg-cyan-600",
  in_progress: "bg-amber-600",
  completed: "bg-emerald-600",
};

const statusLabels: Record<QuestStatus, string> = {
  locked: "Verrouille",
  unlocked: "Debloque",
  in_progress: "En cours",
  completed: "Termine",
};

export default async function QuestPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const flatCourses = roadmap.entries;
  const totalCourses = roadmap.totalCourses;
  const completedCount = roadmap.completedCount;
  const activeCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-6 md:p-8">
          <div
            className="comic-panel-dark mb-8 p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.22) 100%)",
            }}
          >
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="comic-panel border-2 border-black bg-emerald-600 p-4">
                  <QuestIcon className="h-8 w-8 text-white text-outline" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white text-outline md:text-5xl">
                    Chemin de cours
                  </h1>
                  <p className="mt-2 text-lg font-semibold text-slate-200 text-outline">
                    Le parcours principal s'appuie sur les 50 vrais cours du site, organises en 5
                    paliers progressifs.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="comic-panel border-2 border-black bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Contenu
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">{totalCourses} cours</p>
                </div>
                <div className="comic-panel border-2 border-black bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Progression
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {completedCount}/{totalCourses} termines
                  </p>
                </div>
                <div className="comic-panel border-2 border-black bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Focus
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {activeCourse
                      ? `Cours ${activeCourse.courseId} : ${activeCourse.title}`
                      : "Tout le parcours est complete"}
                  </p>
                </div>
              </div>

              {!isLoggedIn && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-amber-300 text-outline">
                    Connectez-vous pour sauvegarder votre progression, l'XP et l'or gagnes sur ce
                    parcours.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/auth/signup"
                      className="comic-button bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
                    >
                      Creer mon compte
                    </Link>
                    <Link
                      href="/tous-les-cours"
                      className="comic-button bg-slate-800 px-6 py-3 font-bold text-white hover:bg-slate-700"
                    >
                      Voir la bibliotheque complete
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {paliers.map((palier, palierIndex) => (
              <MotionCard key={palier.id}>
                <section
                  className="comic-card-dark border-2 border-black p-6 md:p-8"
                  style={{ background: palierGradients[palierIndex] }}
                >
                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="comic-panel border-2 border-black bg-slate-900 px-4 py-2">
                            <span className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                              Palier {palier.id}
                            </span>
                          </div>
                          <div className="comic-panel border-2 border-black bg-black/40 px-4 py-2">
                            <span className="text-sm font-bold text-white">{palier.level}</span>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white text-outline md:text-3xl">
                            {palier.title}
                          </h2>
                          <p className="mt-2 max-w-3xl text-slate-200 text-outline">
                            {palier.description}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/tous-les-cours"
                        className="comic-button inline-flex items-center gap-2 bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
                      >
                        <BookIcon className="h-5 w-5" />
                        Bibliotheque
                      </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {palier.courses.map((course) => {
                        const entry = flatCourses.find((item) => item.courseId === course.id)!;
                        const isCurrentCourse =
                          activeCourse?.courseId === course.id && entry.status !== "completed";

                        return (
                          <div
                            key={course.id}
                            className={`comic-panel border-2 border-black p-5 ${
                              isCurrentCourse
                                ? "bg-gradient-to-br from-cyan-900/40 to-emerald-900/30"
                                : "bg-slate-900/70"
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="comic-panel border-2 border-black bg-slate-800 px-3 py-2">
                                  <span className="text-lg font-bold text-white text-outline">
                                    {entry.courseId}
                                  </span>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                  <span
                                    className={`comic-panel border-2 border-black px-3 py-1 text-xs font-bold text-white text-outline ${statusStyles[entry.status]}`}
                                  >
                                    {statusLabels[entry.status]}
                                  </span>
                                  <span className="comic-panel border-2 border-black bg-black/40 px-3 py-1 text-xs font-bold text-slate-200">
                                    {course.type === "grammar" ? "Grammaire" : "Methodologie"}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                  <h3 className="text-xl font-bold text-white text-outline">
                                  {entry.title}
                                </h3>
                                {isCurrentCourse && (
                                  <p className="text-sm font-semibold text-cyan-300">
                                    Prochain cours conseille
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <div className="comic-panel border-2 border-black bg-emerald-700/70 px-3 py-2">
                                  <div className="flex items-center gap-2 text-xs font-bold text-white text-outline">
                                    <XPIcon className="h-4 w-4" />
                                    <span>{entry.rewardXp} XP</span>
                                  </div>
                                </div>
                                <div className="comic-panel border-2 border-black bg-amber-600/80 px-3 py-2">
                                  <div className="flex items-center gap-2 text-xs font-bold text-white text-outline">
                                    <GoldIcon className="h-4 w-4" />
                                    <span>{entry.rewardGold} or</span>
                                  </div>
                                </div>
                              </div>

                              <Link
                                href={`/cours/${course.id}`}
                                className={`comic-button inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white ${
                                  entry.status === "completed"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : entry.status === "in_progress" || entry.status === "unlocked"
                                      ? "bg-cyan-600 hover:bg-cyan-700"
                                      : "bg-slate-700 hover:bg-slate-600"
                                }`}
                              >
                                {entry.status === "completed"
                                  ? "Reviser le cours"
                                  : entry.status === "in_progress"
                                    ? "Continuer"
                                    : entry.status === "unlocked"
                                      ? "Commencer"
                                      : "Consulter"}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </MotionCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
