import Image from "next/image";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
import Link from "next/link";
import { CourseLibraryExplorer } from "@/components/courses/course-library-explorer";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Les cours",
  description:
    "50 cours d'anglais du niveau A1 au niveau C1 : une notion par cours, des exemples, un quiz de dix questions. Lecture libre, progression avec un compte.",
};

export default async function TousLesCoursPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const recommendedCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const missionPlans = await getResolvedCourseMissionPlans(roadmap.entries);

  const heroArt = resolveArt(ART.act(4));

  return (
    <div>
      <section className="eq-hero">
        {heroArt ? (
          <div className="eq-hero-art">
            <Image src={heroArt} alt="" fill priority sizes="100vw" className="object-cover object-[65%_center]" />
          </div>
        ) : null}
        <div className="eq-container eq-hero-body">
          <div className="eq-reveal grid min-h-[380px] content-end gap-4 py-14 md:max-w-[620px] md:py-20">
            <h1 className="eq-h1">Les cours</h1>
            <p className="eq-lead">
              Cinquante notions, du niveau A1 au niveau C1. Une notion par cours, des exemples,
              le piège du francophone, puis un quiz de dix questions. Tout est lisible sans
              compte.
            </p>
            {isLoggedIn && recommendedCourse ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/cours/${recommendedCourse.courseId}`} className="eq-btn eq-btn-gold">
                  Reprendre : cours {recommendedCourse.courseId}
                </Link>
                <span className="text-sm text-[var(--muted)]">
                  {roadmap.completedCount} cours validés sur {roadmap.totalCourses}
                </span>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Avec un compte, chaque cours validé fait avancer ta carte et rapporte de
                l&apos;expérience.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="eq-container eq-section">
        <CourseLibraryExplorer
          entries={roadmap.entries}
          missionPlans={missionPlans}
          recommendedCourseId={recommendedCourse?.courseId ?? null}
          isAuthenticated={isLoggedIn}
        />
      </section>
    </div>
  );
}
