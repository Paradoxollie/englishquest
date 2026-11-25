import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { courseTitle } from "@/lib/classes/classes-data";
import { eraseGuestParticipation } from "@/lib/classes/classes-server";
import { ConfirmActionButton } from "./confirm-action-button";

// The class detail page checks ownership before rendering this server component.
export async function GuestClassReport({ classId }: { classId: string }) {
  const { data, error } = await createSupabaseAdminClient().from("class_guests")
    .select("id,nickname,created_at,class_guest_work(marks,class_assignments(course_id))")
    .eq("class_id", classId).gt("report_until", new Date().toISOString()).order("created_at", { ascending: false });
  type Row = { id: string; nickname: string; created_at: string; class_guest_work: { marks: { ok: boolean }[]; class_assignments: { course_id: number } }[] };
  const guests = (data ?? []) as unknown as Row[];
  return <section className="eq-teach-block" aria-labelledby="guest-report-name">
    <h2 className="eq-h2" id="guest-report-name">Participations sans compte</h2>
    <p className="eq-muted">Les pseudos et le bilan des devoirs restent visibles dix jours après l’entrée en classe.
      Retrouvez les résultats par manche dans l’historique des séances en direct, pendant dix jours après leur fin.</p>
    {error ? <p role="alert">Le bilan invité est momentanément indisponible.</p> : guests.length ? <ul className="eq-class-status-list">
      {guests.map(g => <li key={g.id}><div><strong>{g.nickname}</strong>{" · "}
        <time dateTime={g.created_at}>{new Date(g.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" })}</time>
        {g.class_guest_work.map(work => <p key={work.class_assignments.course_id}>{courseTitle(work.class_assignments.course_id)}
          {" · "}Réponses justes : {work.marks.filter(m => m.ok).length} / {work.marks.length}</p>)}
      </div><ConfirmActionButton label="Effacer" question={`Effacer la participation de ${g.nickname} et ses résultats ?`}
        confirmLabel="Oui, effacer" action={eraseGuestParticipation.bind(null, classId, g.id)} /></li>)}</ul>
      : <p className="eq-muted">Aucune participation invitée au cours des dix derniers jours.</p>}
  </section>;
}
