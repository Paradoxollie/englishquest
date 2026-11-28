import { LearnerReport } from "@/components/learning/learner-report";
import type { ReportQuery } from "@/lib/learning/report";
export const dynamic = "force-dynamic";
export const metadata = { title: "Mon suivi", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<ReportQuery> }) {
  return <LearnerReport scope={{ kind: "self" }} query={await searchParams} />;
}
