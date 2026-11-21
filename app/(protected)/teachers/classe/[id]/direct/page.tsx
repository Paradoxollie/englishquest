import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LiveTeacher } from "@/components/classes/live-teacher";
import { TeacherOnlyNotice } from "@/components/classes/teacher-only-notice";
import { isTeacherRole, isUuid } from "@/lib/classes/classes";
import { findManagedClass, getViewer } from "@/lib/classes/classes-data";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { SITE_URL } from "@/lib/site/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import "@/components/classes/live-teacher.css";

export const metadata: Metadata = { title: "Séance en direct", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function TeacherLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(await loginForCurrentPage(`/teachers/classe/${encodeURIComponent(id)}/direct`));
  if (!isTeacherRole(viewer.role)) return <TeacherOnlyNotice />;
  if (!isUuid(id)) notFound();
  const classroom = await findManagedClass(createSupabaseAdminClient(), viewer, id);
  if (!classroom) notFound();

  return (
    <div className="eq-container eq-section live-teacher">
      <nav aria-label="Fil d’Ariane">
        <Link href={`/teachers/classe/${classroom.id}`} className="eq-teach-back">
          {classroom.name}
        </Link>
      </nav>
      <h1 className="eq-h1">Séance en direct</h1>
      <LiveTeacher
        classId={classroom.id}
        className={classroom.name}
        archived={Boolean(classroom.archived_at)}
        joinAddress={`${new URL(SITE_URL).host}/rejoindre`}
      />
    </div>
  );
}
