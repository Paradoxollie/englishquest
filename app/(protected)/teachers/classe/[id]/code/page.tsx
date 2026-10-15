import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectionCode } from "@/components/classes/projection-code";
import { TeacherOnlyNotice } from "@/components/classes/teacher-only-notice";
import { isTeacherRole, isUuid } from "@/lib/classes/classes";
import { findManagedClass, getViewer } from "@/lib/classes/classes-data";
import { SITE_URL } from "@/lib/site/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Code de la classe" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function joinAddress() {
  try {
    return `${new URL(SITE_URL).host}/rejoindre`;
  } catch {
    return "englishquest-omega.vercel.app/rejoindre";
  }
}

export default async function ClassCodeProjectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const record = await findManagedClass(createSupabaseAdminClient(), viewer, id);
  if (!record) {
    notFound();
  }

  return (
    <ProjectionCode
      classLabel={record.name}
      code={record.code}
      joinAddress={joinAddress()}
      backHref={`/teachers/classe/${record.id}`}
      archived={Boolean(record.archived_at)}
    />
  );
}
