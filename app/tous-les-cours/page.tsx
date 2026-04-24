import Image from "next/image";
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
  const completedPercent =
    roadmap.totalCourses > 0 ? Math.round((roadmap.completedCount / roadmap.totalCourses) * 100) : 0;

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-[#020617] text-white">
      <section className="relative overflow-hidden border-b-4 border-black">
        <Image
          src="/page-art/courses-hero.png"
          alt="Illustration comic book d'une bibliotheque de cours."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/86 to-[#020617]/28" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/45" />
        <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />

        <div className="relative mx-auto grid min-h-[560px] max-w-[1460px] gap-8 px-4 py-10 md:min-h-[620px] md:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end xl:px-10">
          <div className="max-w-4xl self-end">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 text-outline">
              Catalogue des cours
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] text-white text-outline md:text-6xl">
              Choisis le bon cours, au bon moment.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-xl">
              Tous les modules restent accessibles pour reviser librement. Le parcours
              Aventure garde, lui, une route conseillee et une progression suivie.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#catalogue"
                className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
              >
                Explorer le catalogue
              </Link>
              <Link
                href="/quest"
                className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <QuestIcon className="h-4 w-4" />
                Ouvrir Aventure
              </Link>
              {recommendedCourse && (
                <Link
                  href={`/cours/${recommendedCourse.courseId}`}
                  className="comic-button inline-flex items-center gap-2 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <BookIcon className="h-4 w-4" />
                  Reprendre le focus
                </Link>
              )}
            </div>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="border-l-4 border-cyan-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Catalogue
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{roadmap.totalCourses} cours</p>
              </div>
              <div className="border-l-4 border-emerald-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Campagne
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{completedPercent}%</p>
              </div>
              <div className="border-l-4 border-amber-300 bg-black/52 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Mode
                </p>
                <p className="mt-2 text-lg font-bold text-white">Libre</p>
              </div>
            </div>
          </div>

          <aside className="self-end border-4 border-black bg-slate-950/88 p-5 shadow-[0_4px_0_#000] backdrop-blur-sm md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black shadow-[0_3px_0_#000]" style={{ background: recommendedProfile.rail }}>
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
                  Focus du moment
                </p>
                <h2 className="mt-2 text-xl font-bold leading-tight text-white text-outline md:text-2xl">
                  {recommendedCourse
                    ? `Cours ${recommendedCourse.courseId}: ${recommendedCourse.title}`
                    : "Revision libre"}
                </h2>
              </div>
            </div>

            {recommendedCourse && recommendedMission ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm font-semibold leading-relaxed text-slate-200">
                  {recommendedCourse.summary}
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
                    {recommendedCourse.estimatedMinutes} min
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
                    {recommendedCourse.levelLabel.split(" - ")[0]}
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
                    {recommendedMission.primaryGameName ?? "Revision"}
                  </span>
                </div>

                <Link
                  href={`/cours/${recommendedCourse.courseId}`}
                  className="comic-button inline-flex items-center gap-2 bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Ouvrir ce cours
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-slate-300">
                Explore les modules disponibles et reprends le parcours quand tu veux.
              </p>
            )}
          </aside>
        </div>
      </section>

      <main id="catalogue" className="mx-auto max-w-[1460px] px-4 py-10 md:px-6 md:py-14 xl:px-10">
        {!isLoggedIn && (
          <div className="mb-8 flex flex-col gap-3 border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                Progression sauvegardee
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
                Les cours restent consultables en mode invite. Un compte permet de conserver la progression.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="comic-button bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Creer mon compte
              </Link>
              <Link
                href="/auth/login"
                className="comic-button bg-slate-800 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}

        <CourseLibraryExplorer
          entries={roadmap.entries}
          missionPlans={missionPlans}
          recommendedCourseId={recommendedCourse?.courseId ?? null}
          isAuthenticated={isLoggedIn}
        />
      </main>
    </div>
  );
}
