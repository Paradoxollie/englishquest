import Link from "next/link";
import { CourseLibraryExplorer } from "@/components/courses/course-library-explorer";
import { BookIcon, QuestIcon } from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";

export default async function TousLesCoursPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const recommendedCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-6 md:p-8">
          <div
            className="comic-panel-dark mb-6 p-4 md:mb-12 md:p-8"
            style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-4">
                <div className="comic-panel border-2 border-black bg-indigo-600 p-2 md:p-4">
                  <BookIcon className="h-6 w-6 text-white text-outline md:h-8 md:w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="break-words text-2xl font-bold text-white text-outline md:text-5xl">
                    Bibliotheque de cours
                  </h1>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-200 text-outline md:text-lg">
                    Catalogue complet, parcours principal et revision libre dans la meme interface.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="comic-panel border-2 border-black bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Catalogue</p>
                  <p className="mt-2 text-2xl font-bold text-white">{roadmap.totalCourses} cours</p>
                </div>
                <div className="comic-panel border-2 border-black bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Progression</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {roadmap.completedCount}/{roadmap.totalCourses} termines
                  </p>
                </div>
                <div className="comic-panel border-2 border-black bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Focus</p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {recommendedCourse
                      ? `Cours ${recommendedCourse.courseId}: ${recommendedCourse.title}`
                      : "Revision libre"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="mb-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signup"
                className="comic-button bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
              >
                Creer mon compte
              </Link>
              <Link
                href="/auth/login"
                className="comic-button bg-slate-800 px-6 py-3 font-bold text-white hover:bg-slate-700"
              >
                Se connecter
              </Link>
            </div>
          )}

          <CourseLibraryExplorer
            entries={roadmap.entries}
            recommendedCourseId={recommendedCourse?.courseId ?? null}
            isAuthenticated={isLoggedIn}
          />

          <div className="mt-12 text-center">
            <Link
              href="/quest"
              className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
            >
              <QuestIcon className="h-5 w-5" />
              Revenir au parcours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
