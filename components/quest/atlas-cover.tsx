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
  const featured = current ?? passages[passages.length - 1];
  const explored = passages.filter(p => stages[p.id - 1] >= scenes[p.id].length);
  const chapterIntro = atlasChapters.find(c => featured.id >= c.first && featured.id <= c.last)?.intro;
  return <section className="atlas-cover" id="atlas" aria-labelledby="atlas-name">
    <div className="atlas-cover-layout">
      <div className="atlas-cover-copy">
        <span className="atlas-label">BD interactive · Débuter en anglais</span>
        <h1 id="atlas-name">L’Atlas des <em>passages</em></h1>
        <p>{current ? chapterIntro : featured.ending}{" "}
          {userId ? "Tu peux t’arrêter et reprendre à la même case." : "Tu peux jouer sans compte et reprendre à la même case sur cet appareil."}</p>
        <Link className="atlas-cta" href={`/quest/atlas/${current?.id ?? passages[0].id}`}>
          {!current ? "Revoir la première escale" : stages.some(Boolean) ? "Reprendre l’aventure" : "Commencer l’aventure"} <span aria-hidden="true">→</span>
        </Link>
        <span className="atlas-cover-progress">{explored.length} / {passages.length} mondes explorés</span>
        {!userId && <Link className="atlas-login" href="/auth/login?next=/quest/atlas">Continuer sur plusieurs appareils avec un compte</Link>}
      </div>
      <div className="atlas-cover-art">
        <Image src={passageArt[featured.art]} alt={featured.alt} placeholder="blur" fill sizes="(max-width: 760px) 100vw, 60vw" priority />
        <span className="atlas-place">{featured.place}</span>
      </div>
    </div>
    {userId && guestStages.some((n, i) => n > stages[i]) && <AtlasGuestImport />}
    <div className="atlas-orientation">
      {explored.length > 0 && <details className="atlas-journal">
        <summary>L’histoire jusqu’ici</summary>
        {atlasChapters.map(chapter => {
          const entries = explored.filter(p => p.id >= chapter.first && p.id <= chapter.last);
          if (!entries.length) return null;
          return <details key={chapter.first} className="atlas-journal-chapter" open={entries.at(-1)?.id === explored.at(-1)?.id}>
            <summary>{chapter.title}</summary>
            <ol start={entries[0].id}>{entries.map(p => <li key={p.id} value={p.id}>
              <Link href={`/quest/atlas/${p.id}`} prefetch={false}>{p.title}</Link>
              <p>{p.ending}</p>
            </li>)}</ol>
          </details>;
        })}
      </details>}
      <Link href="/tous-les-cours/parcours" className="atlas-course-map">Retrouver ma carte des 50 cours <span aria-hidden="true">→</span></Link>
    </div>
    {atlasChapters.map((chapter, i) => {
      const stops = passages.filter(p => p.id >= chapter.first && p.id <= chapter.last);
      const targets = stops.flatMap(p => (p.targets ?? []).map(t => ({ ...t, id: p.id, done: stages[p.id - 1] >= t.stage })));
      return <section className="atlas-chapter" key={chapter.first} aria-labelledby={`atlas-chapter-${i}`}>
      <div className="atlas-chapter-head"><h2 id={`atlas-chapter-${i}`}><small>Chapitre {i + 1}</small>{chapter.title}</h2>
      <span>{stops.filter(p => stages[p.id - 1] >= scenes[p.id].length).length} / {stops.length} escales validées</span></div>
      <ol className="atlas-stops" start={chapter.first} aria-labelledby={`atlas-chapter-${i}`}>
      {stops.map(p => {
        const done = stages[p.id - 1] >= scenes[p.id].length;
        const locked = current !== undefined && p.id > current.id;
        const part = partForStage(stages[p.id - 1], scenes[p.id].length);
        return <li key={p.id}><Link className="atlas-stop" href={`/quest/atlas/${p.id}`} prefetch={false} data-current={p.id === current?.id || undefined}>
          <div className="atlas-thumb"><Image src={passageArt[p.art]} placeholder="blur" fill sizes="(max-width: 720px) 45vw, 220px" alt="" />
            <span>{String(p.id).padStart(2, "0")}</span></div>
          <strong>{p.title}</strong><small>{done ? "Validée ✓" : locked ? "À découvrir" : stages[p.id - 1] ? "En cours" : "À jouer"} · {p.minutes}</small>
          {p.id === current?.id && <span className="atlas-stop-part">Partie {part + 1} · {partTitles[part]}</span>}
        </Link></li>;
      })}
      </ol>
      {targets.length > 0 && <details className="atlas-skillbook">
        <summary>Mon carnet d’anglais <small>{targets.filter(t => t.done).length} / {targets.length} objectifs réussis</small></summary>
        <ul>{targets.map(t => <li key={t.id + "-" + t.stage} data-done={t.done}>
          <span aria-label={t.done ? "Réussi" : "À travailler"} role="img">{t.done ? "✓" : "○"}</span>
          <div><small>Escale {t.id}</small> {t.label}</div></li>)}</ul>
      </details>}
    </section>; })}
  </section>;
}
