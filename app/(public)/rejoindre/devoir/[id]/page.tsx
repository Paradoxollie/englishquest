import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GuestHomework } from "@/components/classes/guest-homework";
import { isUuid } from "@/lib/classes/classes";
import { getViewer } from "@/lib/classes/classes-data";
import { currentClassGuest, guestAssignments } from "@/lib/classes/guests";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Devoir de la classe", robots: { index: false, follow: false } };

export default async function GuestAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  if (await getViewer()) redirect("/rejoindre");
  const guest = await currentClassGuest();
  if (!guest) redirect("/rejoindre");
  const work = (await guestAssignments(guest.classId)).find(a => a.id === id);
  if (!work) notFound();
  const { data, error } = await createSupabaseAdminClient().from("class_guest_work").select("marks")
    .eq("guest_id", guest.id).eq("assignment_id", id).maybeSingle();
  if (error) throw new Error("Le devoir est momentanément indisponible.");
  const marks = (data?.marks ?? []) as { id: string; ok: boolean }[];
  const correct = marks.filter(mark => mark.ok).length;
  return <section className="eq-container eq-section">
    <Link href="/rejoindre" className="eq-text-link">Retour à ma classe</Link>
    <h1 className="eq-h2 mt-3">{work.title}</h1>
    {work.note && <p>{work.note}</p>}
    <GuestHomework assignment={id} course={work.course} initial={{ courseId: work.course, correct, score: 100 * correct,
      answered: marks.length, answers: marks.map(({ id }) => ({ id })) }} />
  </section>;
}
