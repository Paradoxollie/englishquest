import Link from "next/link";
import { notFound } from "next/navigation";
import { createHash } from "node:crypto";
import { passages } from "@/lib/adventure/catalog";
import { scenes } from "@/lib/adventure/scenes";
import { learnerActivity } from "@/lib/adventure/activities";
import { getAdventureProgress, getAccountDraft } from "@/lib/adventure/progress";
import { PassageReader } from "@/components/quest/passage-reader";
import { publicPageMetadata } from "@/lib/site/metadata";
import "@/components/quest/atlas.css";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const episode = passages.find(p => String(p.id) === id);
  if (!episode) notFound();
  if (episode.id !== passages[0].id) {
    // Une première visite afficherait la consigne pour débloquer cette escale.
    return { title: episode.title, robots: { index: false, follow: true } };
  }
  return publicPageMetadata({
    path: `/quest/atlas/${episode.id}`,
    title: `Se présenter en anglais en BD · ${episode.title}`,
    description: "Sur le quai, choisis comment dire bonjour et au revoir, puis présente-toi en anglais avec ton nom de héros. Une courte BD pour débutants, jouable sans inscription.",
    image: `/art/passage/${episode.art}.webp`,
    imageAlt: episode.alt,
  });
}
export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const episode = passages.find(p => String(p.id) === id);
  if (!episode) notFound();
  const { stages, synced, userId } = await getAdventureProgress();
  const current = passages.find(p => stages[p.id - 1] < scenes[p.id].length);
  if (current && current.id < episode.id) return <div className="atlas-lock">
    <span className="atlas-label">Escale {episode.id} · {episode.place}</span>
    <h1>{episode.title}</h1><p>Ton équipe est encore à l’escale {current.id}. Termine « {current.title} » pour poursuivre le voyage dans l’ordre.</p>
    <Link href={`/quest/atlas/${current.id}`} className="atlas-cta">Rejoindre mon équipe →</Link>
    <Link href="/quest/atlas" className="atlas-link">Revenir à la carte des mondes</Link>
  </div>;
  const draft = await getAccountDraft(episode.id, userId, stages[episode.id - 1]);
  return <PassageReader key={episode.id} episode={episode} steps={scenes[episode.id].map(learnerActivity)} cloudDraft={draft}
    saved={stages[episode.id - 1]} savedOnAccount={synced}
    draftKey={`eq-atlas-draft-v1-${userId ? createHash("sha256").update(userId).digest("hex").slice(0, 20) : "guest"}-${episode.id}`} />;
}
