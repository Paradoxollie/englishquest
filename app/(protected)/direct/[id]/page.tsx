import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LivePlayer } from "@/components/classes/live-player";
import { isUuid } from "@/lib/classes/classes";
import { getViewer } from "@/lib/classes/classes-data";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import "@/components/classes/live-player.css";

export const metadata: Metadata = {
  title: "Séance en direct",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const viewer = await getViewer();
  if (!viewer) redirect(await loginForCurrentPage(`/direct/${id}`));
  if (viewer.role !== "student") redirect("/teachers");
  return <LivePlayer key={`${viewer.id}:${id}`} classId={id} playerId={viewer.id} />;
}
