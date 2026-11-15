import Link from "next/link";
import { ASSIGNMENT_STATUS_LABELS, formatShortDate, type AssignmentStatus } from "@/lib/classes/classes";
import type { TeacherAssignment } from "@/lib/classes/classes-data";
import { deleteAssignment } from "@/lib/classes/classes-server";
import { ConfirmActionButton } from "./confirm-action-button";

const STATUS_CHIP: Record<AssignmentStatus, string> = {
  fait: "eq-chip eq-chip-mint",
  en_retard: "eq-chip eq-chip-coral",
  a_faire: "eq-chip eq-chip-muted",
};

function dueLabel(dueDate: string | null, today: string) {
  if (!dueDate) return "Sans date limite";
  if (dueDate < today) return `Date passée : ${formatShortDate(dueDate, true)}`;
  if (dueDate === today) return "Pour aujourd'hui";
  return `Pour le ${formatShortDate(dueDate, true)}`;
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

export function AssignmentList({ assignments, today }: { assignments: TeacherAssignment[]; today: string }) {
  if (assignments.length === 0) {
    return <p className="eq-muted text-sm">Aucun devoir pour l&apos;instant.</p>;
  }

  return (
    <ul className="eq-class-assignments">
      {assignments.map((assignment) => {
        const total = assignment.pupils.length;
        return (
          <li key={assignment.id} className="eq-class-assignment">
            <div className="eq-class-assignment-head">
              <div>
                <p className="eq-class-assignment-title">{assignment.courseLabel}</p>
                <p className={`text-sm ${assignment.dueDate && assignment.dueDate < today ? "text-[var(--coral)]" : "eq-muted"}`}>
                  {dueLabel(assignment.dueDate, today)}
                </p>
              </div>
              <Link href={`/cours/${assignment.courseId}`} className="eq-btn eq-btn-ghost eq-btn-sm" target="_blank">
                Voir le cours
              </Link>
            </div>

            {assignment.note ? <p className="eq-class-assignment-note">{assignment.note}</p> : null}

            {total > 0 ? (
              <>
                <div className="eq-class-assignment-counts" aria-label="Avancement du devoir">
                  <span className="eq-chip eq-chip-mint">{plural(assignment.counts.fait, "fait", "faits")}</span>
                  {assignment.counts.en_retard > 0 ? (
                    <span className="eq-chip eq-chip-coral">{assignment.counts.en_retard} en retard</span>
                  ) : null}
                  {assignment.counts.a_faire > 0 ? (
                    <span className="eq-chip eq-chip-muted">{assignment.counts.a_faire} à faire</span>
                  ) : null}
                  <span className="eq-muted text-sm">sur {plural(total, "élève", "élèves")}</span>
                </div>
                <div className="eq-bar eq-bar-mint" aria-hidden="true">
                  <i style={{ width: `${Math.round((assignment.counts.fait / total) * 100)}%` }} />
                </div>
                <details className="eq-class-details">
                  <summary>Détail par élève</summary>
                  <ul className="eq-class-status-list">
                    {assignment.pupils.map((pupil) => (
                      <li key={pupil.userId}>
                        <span>{pupil.username}</span>
                        <span className={STATUS_CHIP[pupil.status]}>{ASSIGNMENT_STATUS_LABELS[pupil.status]}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            ) : (
              <p className="eq-muted text-sm">Aucun élève dans la classe pour l&apos;instant.</p>
            )}

            <div className="eq-class-assignment-foot">
              <ConfirmActionButton
                label="Supprimer le devoir"
                question="Supprimer ce devoir ? La progression des élèves ne change pas."
                confirmLabel="Oui, supprimer"
                action={deleteAssignment.bind(null, assignment.id)}
                showSuccess={false}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
