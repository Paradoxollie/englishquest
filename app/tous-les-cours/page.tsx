import { publicPageMetadata } from "@/lib/site/metadata";
import { getGuestProgress } from "@/lib/courses/guest-progress-server";
import { buildGuestCourseRoadmap } from "@/lib/courses/progress";
import { RecoverGuestPlacement } from "@/components/quest/recover-guest-placement";
import { isCoursePlacementSkip } from "@/lib/courses/mission-telemetry";
import Link from "next/link";
import { PageHead } from "@/components/comic/page-head";
import { CourseLibraryExplorer } from "@/components/courses/course-library-explorer";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { getCachedUserCourseRoadmap } from "@/lib/courses/roadmap-cache";
import { getServerUser } from "@/lib/supabase/auth-cache";

export const metadata = publicPageMetadata({
  path: "/tous-les-cours",
  title: "50 cours d’anglais avec quiz, de A1 à B1+",
  description: "50 cours d'anglais du niveau A1 au niveau B1+, avec des exemples et un quiz de dix questions par mission. Commence sans compte et retrouve ta progression sur cet appareil.",
});

export default async function TousLesCoursPage() {
  const user = await getServerUser();
  const isLoggedIn = Boolean(user);
  const guest = user ? null : await getGuestProgress();
  const roadmap = user ? await getCachedUserCourseRoadmap(user.id) : buildGuestCourseRoadmap(guest?.scores, guest?.placementChapter ?? 1);
  const recommendedCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const placedCount = roadmap.entries.filter((entry) => isCoursePlacementSkip(entry.missionTelemetry)).length;
  const missionPlans = await getResolvedCourseMissionPlans(roadmap.entries);

  return (
    <div>
      {!user ? <RecoverGuestPlacement /> : null}
      <PageHead caption="La bibliothèque" title="Les 50 cours">
        <p>
          Choisis librement une notion ou suis les cinq chapitres dans l’ordre. Chaque cours propose des exemples,
          un entraînement et un quiz de dix questions.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/tous-les-cours/parcours" className="eq-btn eq-btn-primary">Ma carte des 50 missions</Link>
          {(isLoggedIn || guest?.placementChapter || roadmap.completedCount > 0) && recommendedCourse ? (
            <>
              <Link href={`/cours/${recommendedCourse.courseId}`} className="eq-text-link">
                Reprendre le cours {recommendedCourse.courseId}
              </Link>
              <span className="text-sm font-bold">
                {placedCount ? `${roadmap.completedCount - placedCount} cours validés par quiz · ${placedCount} acquis au test de niveau` : `${roadmap.completedCount} / ${roadmap.totalCourses} validés`}
              </span>
            </>
          ) : roadmap.completedCount < roadmap.totalCourses ? (
            <Link href="/test-de-niveau" className="eq-text-link">
              Tu ne sais pas par où commencer ? Teste ton niveau
            </Link>
          ) : null}
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
