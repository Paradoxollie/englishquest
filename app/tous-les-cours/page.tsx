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
  title: "Cours d’anglais gratuits avec exercices et quiz, de A1 à B1+",
  description: "Débute avec be et have ou révise une notion précise. Chaque cours d’anglais propose une leçon, des exercices interactifs et un quiz de dix questions. Accès sans inscription.",
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
      <PageHead caption="La bibliothèque · A1 à B1+" title="Cours d’anglais avec exercices et quiz">
        <p>
          Choisis parmi 50 leçons gratuites. Tu peux commencer par{" "}
          <Link href="/cours/1" className="eq-text-link">être et avoir en anglais</Link>, revoir{" "}
          <Link href="/cours/19" className="eq-text-link">quand employer much ou many</Link>{" "}
          ou suivre les cinq chapitres dans l’ordre.
          {!user && " Sans compte, tes quiz réussis restent sur ce navigateur. Avec un compte, tu peux les retrouver sur un autre appareil."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/tous-les-cours/parcours" className="eq-btn eq-btn-primary">Mon parcours guidé de 50 cours</Link>
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
