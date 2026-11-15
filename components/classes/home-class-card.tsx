import Link from "next/link";
import { Suspense } from "react";
import { ASSIGNMENT_STATUS_LABELS, formatDueDate } from "@/lib/classes/classes";
import { getPupilClassOverview, getViewer, openCoursesForPupils } from "@/lib/classes/classes-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const VISIBLE_HOMEWORK = 4;

/**
 * Accueil connecté : la carte « Devoirs » quand l'élève a des missions à
 * faire pour sa classe, ou un lien discret vers le profil s'il n'a pas de
 * classe. Se charge à part (Suspense) pour ne pas retarder le reste de la page.
 */
export function HomeClassCard() {
  return (
    <Suspense fallback={null}>
      <HomeClassCardContent />
    </Suspense>
  );
}

async function HomeClassCardContent() {
  const viewer = await getViewer();
  if (!viewer) return null;

  let overview;
  try {
    overview = await getPupilClassOverview(viewer.id);
  } catch (error) {
    console.error("HomeClassCard", error);
    return null;
  }

  if (overview.classes.length === 0) {
    if (viewer.role !== "student") return null;
    return (
      <p className="eq-class-hint">
        <Link href="/profile#classe">Tu as un code de classe ?</Link>
      </p>
    );
  }

  const pending = overview.pending;
  if (pending.length === 0) return null;

  // Un compte tout neuf n'avait pas encore de carte quand le devoir a été donné :
  // on ouvre ici les missions demandées (sans effet si elles le sont déjà).
  try {
    await openCoursesForPupils(
      createSupabaseAdminClient(),
      [viewer.id],
      pending.map((homework) => homework.courseId)
    );
  } catch (error) {
    console.error("HomeClassCard open courses", error);
  }

  const late = pending.filter((homework) => homework.status === "en_retard").length;
  const showClass = overview.classes.length > 1;
  const visible = pending.slice(0, VISIBLE_HOMEWORK);
  const hidden = pending.length - visible.length;

  return (
    <section className="eq-card eq-class-homework" aria-labelledby="home-homework">
      <div className="eq-class-homework-head">
        <div>
          <p className="eq-kicker">Devoirs</p>
          <h2 id="home-homework" className="eq-h3">
            {pending.length > 1 ? `${pending.length} missions à faire pour ta classe` : "Une mission à faire pour ta classe"}
          </h2>
        </div>
        {late > 0 ? <span className="eq-chip eq-chip-coral">{late} en retard</span> : null}
      </div>
      <ul className="eq-class-homework-list">
        {visible.map((homework) => (
          <li key={homework.assignmentId} className={homework.status === "en_retard" ? "is-late" : undefined}>
            <div className="eq-class-homework-text">
              <b>{homework.courseLabel}</b>
              <small>
                {formatDueDate(homework.dueDate, overview.today)}
                {showClass ? ` · ${homework.className}` : ""}
              </small>
              {homework.note ? <small className="eq-class-homework-note">{homework.note}</small> : null}
            </div>
            <span className={`eq-chip ${homework.status === "en_retard" ? "eq-chip-coral" : "eq-chip-cyan"}`}>
              {ASSIGNMENT_STATUS_LABELS[homework.status]}
            </span>
            <Link href={`/cours/${homework.courseId}`} className="eq-btn eq-btn-primary eq-btn-sm">
              Ouvrir le cours
            </Link>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <p className="eq-muted text-sm">
          Et {hidden} autre{hidden > 1 ? "s" : ""} devoir{hidden > 1 ? "s" : ""} après ceux-ci.
        </p>
      ) : null}
    </section>
  );
}
