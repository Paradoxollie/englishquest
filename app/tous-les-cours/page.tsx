import Link from "next/link";
import { PageHead } from "@/components/comic/page-head";
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
      <PageHead caption="La bibliothèque" title="Les 50 cours" tone="blue">
        <p>
          Une notion par cours, de A1 à B1+ : la règle, des exemples, les pièges des francophones et un quiz de dix
          questions. Tout est en accès libre.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          {isLoggedIn && recommendedCourse ? (
            <>
              <Link href={`/cours/${recommendedCourse.courseId}`} className="eq-btn eq-btn-primary">
                Reprendre le cours {recommendedCourse.courseId}
              </Link>
              <span className="text-sm font-bold">
                {roadmap.completedCount} / {roadmap.totalCourses} validés
              </span>
            </>
          ) : (
            <Link href="/test-de-niveau" className="eq-text-link">
              Tu ne sais pas par où commencer ? Teste ton niveau
            </Link>
          )}
        </div>
      </PageHead>

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
