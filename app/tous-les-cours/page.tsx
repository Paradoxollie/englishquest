import Link from "next/link";
import { CourseLibraryExplorer } from "@/components/courses/course-library-explorer";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { buildGuestCourseRoadmap } from "@/lib/courses/progress";
import { getCachedUserCourseRoadmap } from "@/lib/courses/roadmap-cache";
import { getServerUser } from "@/lib/supabase/auth-cache";

export const metadata = {
  title: "Les cours",
  description:
    "50 cours d'anglais du niveau A1 au niveau B1+ : une notion par cours, des exemples, un quiz de dix questions. Lecture libre, progression avec un compte.",
};

export default async function TousLesCoursPage() {
  const user = await getServerUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getCachedUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const recommendedCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const missionPlans = await getResolvedCourseMissionPlans(roadmap.entries);

  return (
    <div>
      <section className="eq-editorial-band">
        <div className="eq-container grid gap-4">
          <h1 className="eq-h1">Les 50 cours</h1>
          <p className="eq-lead">
            Une notion par cours, de A1 à B1+ : la règle, des exemples, les pièges des francophones et un quiz de dix
            questions. Tout est en accès libre.
          </p>
          {isLoggedIn && recommendedCourse ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              <Link href={`/cours/${recommendedCourse.courseId}`} className="eq-btn eq-btn-primary">
                Reprendre le cours {recommendedCourse.courseId}
              </Link>
              <span className="text-sm font-bold text-[var(--muted)]">
                {roadmap.completedCount} / {roadmap.totalCourses} validés
              </span>
            </div>
          ) : (
            <div className="pt-1">
              <Link href="/test-de-niveau" className="eq-text-link">
                Tu ne sais pas par où commencer ? Teste ton niveau
              </Link>
            </div>
          )}
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
