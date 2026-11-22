"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { culturalClues, type Passage } from "@/lib/adventure/catalog";
import { panels } from "@/lib/adventure/panels";
import { landscapeSizes, passageArt } from "./passage-art";

const otherVoice: Record<number, string> = {
  1: "Quand tu entends I’m, le prénom qui suit est celui de la personne qui parle.",
  2: "Garde en tête nos trois objets : une clé, un sac, une carte. La couleur s’annonce avant l’objet.",
  3: "Quand je parle de moi, je dis I have. Quand je parle de mon équipier, je dis Maya has ou Sam has.",
  4: "Imagine le sac devant toi. In, c’est dedans. On, c’est sur le sac. Under, c’est dessous.",
  5: "Prends un indice à la fois. Tu peux revenir à la carte des mondes, ou réécouter la radio avant de répondre.",
};

export function PassageStage({ episode, index, total, saved, open }: {
  episode: Passage; index: number; total: number; saved: number; open: () => void;
}) {
  const [voice, setVoice] = useState<"story" | "companion" | "clue">("story");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    title.current?.closest("article")?.scrollIntoView({ block: "start", behavior: "instant" });
  }, []);
  const panel = panels[episode.id][index] ?? { hero: "Maya" as const, line: "Avant d’ouvrir le passage, une dernière vérification. À toi de remplir le carnet de bord.", action: "Ouvrir mon carnet de bord", x: 49, y: 62 };
  const companion = panel.hero === "Maya" ? "Sam" : "Maya";
  const speaker = voice === "companion" ? companion : panel.hero;
  const clue = culturalClues[episode.id];
  const found = saved >= clue.after;
  return <section className="atlas-theatre" aria-label={episode.place}>
    <div className="atlas-strip"><span>{episode.place}</span><h1 ref={title} tabIndex={-1}>{episode.title}</h1>
      <span className="atlas-sequence">Scène {index + 1} / {total}</span></div>
    <div className="atlas-landscape">
      <Image src={passageArt[episode.art]} alt={episode.alt} placeholder="blur" priority sizes={landscapeSizes} />
      <button type="button" className="atlas-pin" onClick={open} style={{ left: `${panel.x}%`, top: `${panel.y}%` }} aria-label={panel.action}>
        <span aria-hidden="true">✦</span><b>{panel.action}</b>
      </button>
      {found && <button className="atlas-secret" type="button" onClick={() => setVoice(voice === "clue" ? "story" : "clue")} aria-label={`Examiner le détail caché : ${clue.object}`} aria-pressed={voice === "clue"}>✧</button>}
    </div>
    <div className="atlas-talk">
      <Image src={speaker === "Maya" ? "/art/personnages/maya-visage.webp" : "/art/personnages/sam-visage.webp"} alt="" width={64} height={64} />
      <div key={voice} className="atlas-bubble" aria-live="polite">
        <strong>{voice === "clue" ? clue.source : speaker}</strong>
        <p>{voice === "clue" ? clue.note : voice === "companion" ? otherVoice[episode.id] : panel.line}</p>
      </div>
      <div className="atlas-stage-actions"><button onClick={open} className="atlas-cta">{panel.action} →</button>
        <button type="button" className="atlas-talk-link" onClick={() => setVoice(voice === "story" ? "companion" : "story")}>
          {voice === "story" ? `Parler à ${companion}` : "Revenir au dialogue"}</button></div>
    </div>
  </section>;
}

export function ActivitySheet({ children, back, leave }: { children: ReactNode; back: () => void; leave: (event: { preventDefault: () => void }) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);
  return <dialog ref={ref} className="atlas-dialog" aria-labelledby="atlas-stage-title" onCancel={event => { event.preventDefault(); back(); }}>
    <div className="atlas-dialog-nav"><button type="button" onClick={back}>← Revoir le décor</button>
      <Link href="/quest#atlas" onNavigate={leave}>Quitter vers la carte ↗</Link></div>
    {children}
  </dialog>;
}
