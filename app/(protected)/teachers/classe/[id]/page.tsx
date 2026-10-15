import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AssignmentForm } from "@/components/classes/assignment-form";
import { AssignmentList } from "@/components/classes/assignment-list";
import { ClassSettings } from "@/components/classes/class-settings";
import { PupilsTable } from "@/components/classes/pupils-table";
import { TeacherOnlyNotice } from "@/components/classes/teacher-only-notice";
import {
  MAX_DUE_DATE_DAYS_AHEAD,
  addDaysToDateString,
  formatClassCode,
  formatShortDate,
  isTeacherRole,
  isUuid,
  parisDateString,
  validateCourseId,
} from "@/lib/classes/classes";
import { buildMissionOptionGroups, getTeacherClassDetail, getViewer } from "@/lib/classes/classes-data";

export const metadata: Metadata = { title: "Suivi de classe" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type ClassPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mission?: string }>;
};

function scoreTone(average: number) {
  if (average < 50) return "eq-chip-coral";
  if (average < 80) return "eq-chip-gold-soft";
  return "eq-chip-mint";
}

export default async function TeacherClassPage({ params, searchParams }: ClassPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/auth/login");
  }
  if (!isTeacherRole(viewer.role)) {
    return <TeacherOnlyNotice />;
  }
  if (!isUuid(id)) {
    notFound();
  }

  const detail = await getTeacherClassDetail(viewer, id);
  if (!detail) {
    notFound();
  }

  const { summary, pupils, assignments, struggling, today } = detail;
  const archived = Boolean(summary.archivedAt);
  const assignedIds = assignments.map((assignment) => assignment.courseId);
  const requested = validateCourseId(query.mission);
  const initialCourseId = requested.ok && !assignedIds.includes(requested.value) ? requested.value : null;
  const defaultDueDate = addDaysToDateString(parisDateString(), 7);
  const maxDueDate = addDaysToDateString(today, MAX_DUE_DATE_DAYS_AHEAD);
  const createdOn = formatShortDate(parisDateString(new Date(summary.createdAt)), true);

  return (
    <div className="eq-container eq-section eq-teach">
      <nav aria-label="Fil d'Ariane">
        <Link href="/teachers" className="eq-teach-back">
          Toutes vos classes
        </Link>
      </nav>

      <header className="eq-teach-head">
        <div>
          <p className="eq-kicker">{archived ? "Classe archivée" : "Classe"}</p>
          <h1 className="eq-h1">{summary.name}</h1>
          <p className="eq-muted">
            {pupils.length === 0 ? "Aucun élève" : `${pupils.length} élève${pupils.length > 1 ? "s" : ""}`} · créée le {createdOn}
            {!summary.isOwn && summary.teacherName ? ` · classe de ${summary.teacherName}` : ""}
          </p>
        </div>
        <div className="eq-teach-head-code">
          <p className="eq-teach-code-label">Code de la classe</p>
          <p className="eq-teach-code" aria-label={`Code : ${summary.code.split("").join(" ")}`}>
            {formatClassCode(summary.code)}
          </p>
          <Link href={`/teachers/classe/${summary.id}/code`} className="eq-btn eq-btn-gold eq-btn-sm">
            Afficher le code en grand
          </Link>
        </div>
      </header>

      {archived ? (
        <p className="eq-class-banner" role="status">
          Classe archivée : son code ne permet plus de la rejoindre et les devoirs sont en pause. Vous pouvez la réactiver
          en bas de page.
        </p>
      ) : null}

      <section className="eq-teach-block" aria-labelledby="class-pupils">
        <div className="eq-home-section-head">
          <h2 id="class-pupils" className="eq-h2">
            Élèves
          </h2>
          <span className="eq-muted text-sm">Pseudo et progression seulement, jamais d&apos;adresse e-mail.</span>
        </div>
        {pupils.length === 0 ? (
          <div className="eq-card eq-teach-empty">
            <p className="eq-h3">Personne pour l&apos;instant</p>
            <p className="eq-muted">
              Projetez le code avec « Afficher le code en grand ». Les élèves vont sur /rejoindre, tapent le code, et
              apparaissent ici.
            </p>
          </div>
        ) : (
          <PupilsTable classId={summary.id} pupils={pupils} today={today} />
        )}
      </section>

      <div className="eq-teach-split">
        <section id="devoirs" className="eq-teach-block" aria-labelledby="class-homework">
          <h2 id="class-homework" className="eq-h2">
            Devoirs
          </h2>
          <div className="eq-card">
            <p className="eq-muted text-sm">
              La mission s&apos;ouvre sur la carte de chaque élève de la classe, même s&apos;il n&apos;y est pas encore
              arrivé. Elle compte comme faite quand l&apos;élève la valide (quiz à 80 %).
            </p>
            <AssignmentForm
              key={initialCourseId ?? "none"}
              classId={summary.id}
              groups={buildMissionOptionGroups(assignedIds)}
              today={today}
              defaultDueDate={defaultDueDate}
              maxDueDate={maxDueDate}
              initialCourseId={initialCourseId}
              disabled={archived}
            />
          </div>
          <AssignmentList assignments={assignments} today={today} />
        </section>

        <section className="eq-teach-block" aria-labelledby="class-struggles">
          <h2 id="class-struggles" className="eq-h2">
            Notions qui coincent
          </h2>
          <div className="eq-card">
            {struggling.length === 0 ? (
              <p className="eq-muted text-sm">
                Rien à signaler pour l&apos;instant : aucun élève de la classe n&apos;a encore fait de quiz.
              </p>
            ) : (
              <>
                <p className="eq-muted text-sm">
                  Les missions où les meilleurs scores au quiz sont les plus bas, parmi celles que les élèves ont tentées.
                </p>
                <ol className="eq-class-struggles">
                  {struggling.map((course) => (
                    <li key={course.courseId}>
                      <div>
                        <b>{course.label}</b>
                        <small className="eq-muted">
                          Chapitre {course.chapterId} · {course.attempts} élève{course.attempts > 1 ? "s" : ""}
                        </small>
                      </div>
                      <span className={`eq-chip ${scoreTone(course.average)}`}>{course.average} %</span>
                      <div className="eq-class-struggles-actions">
                        <Link href={`/cours/${course.courseId}`} className="eq-btn eq-btn-ghost eq-btn-sm" target="_blank">
                          Revoir le cours
                        </Link>
                        {!archived && !assignedIds.includes(course.courseId) ? (
                          <Link
                            href={`/teachers/classe/${summary.id}?mission=${course.courseId}#devoirs`}
                            className="eq-btn eq-btn-ghost eq-btn-sm"
                          >
                            Donner en devoir
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="eq-teach-block" aria-labelledby="class-settings">
        <h2 id="class-settings" className="eq-h2">
          Réglages de la classe
        </h2>
        <div className="eq-card">
          <ClassSettings classId={summary.id} name={summary.name} archived={archived} />
        </div>
      </section>
    </div>
  );
}
