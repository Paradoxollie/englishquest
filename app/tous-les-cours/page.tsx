import Image from "next/image";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
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

  const heroArt = resolveArt(ART.heroCourses) ?? resolveArt(ART.act(4));

  return (
    <div>
      <section className="eq-editorial-band">
        <div className="eq-container eq-split-hero">
          <div className="grid gap-4">
            <p className="eq-kicker">Bibliothèque · 50 notions</p>
            <h1 className="eq-h1">Tous les cours d&apos;anglais, du niveau A1 au niveau B1+</h1>
            <p className="eq-lead">
              Une leçon claire par notion, les pièges classiques du francophone décryptés et un quiz de validation de dix
              questions. Tout le programme reste consultable librement sans compte.
            </p>
            {isLoggedIn && recommendedCourse ? (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href={`/cours/${recommendedCourse.courseId}`} className="eq-btn eq-btn-gold">
                  Reprendre le cours {recommendedCourse.courseId}
                </Link>
                <span className="text-sm font-bold text-[var(--muted)]">
                  {roadmap.completedCount} / {roadmap.totalCourses} validés
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/test-de-niveau" className="eq-btn eq-btn-primary">
                  Trouver mon niveau
                </Link>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  5 chapitres progressifs · Accès libre sans inscription
                </span>
              </div>
            )}
          </div>

          {heroArt ? (
            <div className="eq-comic-panel">
              <div className="eq-comic-panel-media">
                <Image
                  src={heroArt}
                  alt="Bibliothèque circulaire des 50 cours English Quest"
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="eq-comic-panel-bar">
                <span>
                  <strong>50 fiches</strong> rédigées
                </span>
                <span>A1 Fondations → B1+ Maîtrise</span>
              </div>
            </div>
          ) : null}
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
