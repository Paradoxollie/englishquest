import Link from "next/link";
import { CourseLibraryExplorer } from "@/components/courses/course-library-explorer";
import { BookIcon, QuestIcon, TrophyIcon } from "@/components/ui/icons";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { getCourseVisualProfile } from "@/lib/courses/presentation";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TousLesCoursPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const recommendedCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const missionPlans = await getResolvedCourseMissionPlans(roadmap.entries);
  const recommendedMission = recommendedCourse
    ? missionPlans[recommendedCourse.courseId] ?? getCourseMissionPlan(recommendedCourse)
    : null;
  const recommendedProfile = getCourseVisualProfile(recommendedCourse?.palierId ?? 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-4 md:p-6">
          <section className="mb-8 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
            <div
              className="comic-panel-dark relative overflow-hidden p-6 md:p-8"
              style={{ background: recommendedProfile.bannerBackground }}
            >
              <div className="absolute inset-0 opacity-[0.16] comic-dot-pattern-light" />
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  background:
                    "repeating-linear-gradient(128deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 18px)",
                }}
              />
              <div className="absolute inset-y-0 left-0 w-3" style={{ background: recommendedProfile.rail }} />

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
                  Bibliotheque libre
                </p>
                <h1 className="mt-3 break-words text-3xl font-bold text-white text-outline md:text-5xl">
                  Choisis un cours librement
                </h1>
                <p className="mt-4 max-w-3xl break-words text-sm font-semibold leading-relaxed text-slate-200 text-outline md:text-lg">
                  `Cours` est le hub libre pour reviser, explorer et ouvrir un module quand tu veux.
                  `Aventure` reste le chemin principal verrouille par la progression.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="comic-panel border-2 border-black bg-slate-950/55 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Catalogue</p>
                    <p className="mt-2 text-xl font-bold text-white">{roadmap.totalCourses} cours</p>
                  </div>
                  <div className="comic-panel border-2 border-black bg-slate-950/55 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Campagne</p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {roadmap.completedCount}/{roadmap.totalCourses} validees
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/quest"
                    className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <QuestIcon className="h-4 w-4" />
                    Aller dans Aventure
                  </Link>
                  {recommendedCourse && (
                    <Link
                      href={`/cours/${recommendedCourse.courseId}`}
                      className="comic-button inline-flex items-center gap-2 bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                    >
                      <BookIcon className="h-4 w-4" />
                      Ouvrir le cours conseille
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div
              className="comic-panel relative overflow-hidden border-2 border-black p-5 md:p-6"
              style={{ background: recommendedProfile.cardBackground }}
            >
              <div className="absolute inset-0 opacity-[0.16] comic-dot-pattern-light" />
              <div className="absolute inset-y-0 left-0 w-2" style={{ background: recommendedProfile.rail }} />

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border-2 border-black p-3" style={{ background: recommendedProfile.rail }}>
                    <TrophyIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                      Focus du moment
                    </p>
                    <h2 className="text-xl font-bold text-white text-outline md:text-2xl">
                      {recommendedCourse
                        ? `Cours ${recommendedCourse.courseId}: ${recommendedCourse.title}`
                        : "Revision libre"}
                    </h2>
                  </div>
                </div>

                {recommendedCourse && recommendedMission ? (
                  <div className="mt-5 space-y-4">
                    <p className="text-sm font-semibold leading-relaxed text-slate-100 text-outline">
                      {recommendedCourse.summary}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[11px] font-semibold text-slate-100">
                        {recommendedCourse.estimatedMinutes} min
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[11px] font-semibold text-slate-100">
                        {recommendedCourse.levelLabel.split(" - ")[0]}
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[11px] font-semibold text-slate-100">
                        {recommendedMission.primaryGameName ?? "Revision"}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-300">
                      {recommendedMission.primaryGameName
                        ? `Si tu passes par Aventure, le defi associe se joue sur ${recommendedMission.primaryGameName}.`
                        : "Ce cours peut aussi s'integrer au parcours Aventure."}
                    </p>

                    <Link
                      href={`/cours/${recommendedCourse.courseId}`}
                      className="comic-button inline-flex items-center gap-2 bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-900"
                    >
                      Ouvrir le cours
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-semibold text-slate-300">
                    Explore librement les modules disponibles.
                  </p>
                )}
              </div>
            </div>
          </section>

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
            missionPlans={missionPlans}
            recommendedCourseId={recommendedCourse?.courseId ?? null}
            isAuthenticated={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}
