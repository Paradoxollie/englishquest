import { LearnerReport } from "@/components/learning/learner-report";
import type { ReportQuery } from "@/lib/learning/report";
export const dynamic = "force-dynamic";
export const metadata = { title: "Parcours de l’élève", robots: { index: false } };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; pupil: string }>;
  searchParams: Promise<ReportQuery>;
}) {
  const [{ id, pupil }, query] = await Promise.all([params, searchParams]);
  return <LearnerReport scope={{ kind: "class", classId: id, id: pupil }} query={query} />;
}
