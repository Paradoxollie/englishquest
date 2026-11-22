import Image from "next/image";
import Link from "next/link";
import { atlasChapters, passages } from "@/lib/adventure/catalog";
import { partForStage, partTitles } from "@/lib/adventure/parts";
import { scenes } from "@/lib/adventure/scenes";
import { getAdventureProgress } from "@/lib/adventure/progress";
import "./atlas.css";
import { AtlasGuestImport } from "./atlas-guest-import";
import { passageArt } from "./passage-art";

export async function AtlasCover() {
  const { stages, guestStages, userId } = await getAdventureProgress();
  const current = passages.find(p => stages[p.id - 1] < scenes[p.id].length);
  const featured = current ?? passages[0];
  const complete = passages.filter(p => stages[p.id - 1] >= scenes[p.id].length).length;
  return <section className="atlas-cover" id="atlas" aria-labelledby="atlas-name">
    <div className="atlas-cover-layout">
      <div className="atlas-cover-copy">
        <span className="atlas-label">Aventure · Premiers pas en anglais</span>
        <h1 id="atlas-name">L’Atlas des <em>passages</em></h1>
        <p>{featured.id > 5 ? "Le port a retrouvé sa route. Mais qui a envoyé ce film d’une île absente des cartes ? Avec Maya et Sam, remonte la piste du courrier." : "Au quai 7, Maya et Sam t’attendent pour le dernier départ. Cap sur l’observatoire, une escale après l’autre."} Tu peux t’arrêter et reprendre à la même case.</p>
        <Link className="atlas-cta" href={`/quest/atlas/${featured.id}`}>
          {complete === passages.length ? "Revoir la première escale" : stages.some(Boolean) ? "Reprendre l’aventure" : "Commencer l’aventure"} <span aria-hidden="true">→</span>
        </Link>
        <span className="atlas-cover-progress">{complete} / {passages.length} mondes explorés</span>
        {!userId && <Link className="atlas-login" href="/auth/login?next=/quest/atlas">Continuer sur plusieurs appareils avec un compte</Link>}
      </div>
      <div className="atlas-cover-art">
        <Image src={passageArt[featured.art]} alt={featured.alt} placeholder="blur" fill sizes="(max-width: 760px) 100vw, 60vw" priority />
        <span className="atlas-place">{featured.place}</span>
      </div>
    </div>
    {userId && guestStages.some((n, i) => n > stages[i]) && <AtlasGuestImport />}
    {atlasChapters.map((chapter, i) => <section className="atlas-chapter" key={chapter.first} aria-labelledby={`atlas-chapter-${i}`}>
      <div className="atlas-chapter-head"><h2 id={`atlas-chapter-${i}`}><small>Chapitre {i + 1}</small>{chapter.title}</h2>
      <span>{passages.filter(p => p.id >= chapter.first && p.id <= chapter.last && stages[p.id - 1] >= scenes[p.id].length).length} / {chapter.last - chapter.first + 1} escales validées</span></div>
      <ol className="atlas-stops" start={chapter.first} aria-labelledby={`atlas-chapter-${i}`}>
      {passages.filter(p => p.id >= chapter.first && p.id <= chapter.last).map(p => {
        const done = stages[p.id - 1] >= scenes[p.id].length;
        const locked = current !== undefined && p.id > current.id;
        const part = partForStage(stages[p.id - 1], scenes[p.id].length);
        return <li key={p.id}><Link className="atlas-stop" href={`/quest/atlas/${p.id}`} data-current={p.id === current?.id || undefined}>
          <div className="atlas-thumb"><Image src={passageArt[p.art]} placeholder="blur" fill sizes="(max-width: 720px) 45vw, 220px" alt="" />
            <span>{String(p.id).padStart(2, "0")}</span></div>
          <strong>{p.title}</strong><small>{done ? "Validée ✓" : locked ? "À découvrir" : stages[p.id - 1] ? "En cours" : "À jouer"} · {p.minutes}</small>
          {p.id === current?.id && <span className="atlas-stop-part">Partie {part + 1} · {partTitles[part]}</span>}
        </Link></li>;
      })}
    </ol></section>)}
    <Link href="/tous-les-cours/parcours" className="atlas-login">Retrouver ma carte des 50 cours</Link>
  </section>;
}
