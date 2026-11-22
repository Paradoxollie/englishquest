import Image from "next/image";
import Link from "next/link";
import { passages } from "@/lib/adventure/catalog";
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
        <p>Les routes entre cinq mondes se sont effacées. Au quai 7, Maya et Sam t’attendent pour le dernier départ. Lis les indices, écoute les transmissions et trace ton chemin jusqu’à l’observatoire.</p>
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
    <ol className="atlas-stops" aria-label="Les cinq escales">
      {passages.map(p => {
        const done = stages[p.id - 1] >= scenes[p.id].length;
        const locked = p.id > 1 && stages[p.id - 2] < scenes[p.id - 1].length;
        return <li key={p.id}><Link className="atlas-stop" href={`/quest/atlas/${p.id}`} data-current={p.id === current?.id || undefined}>
          <div className="atlas-thumb"><Image src={passageArt[p.art]} placeholder="blur" fill sizes="(max-width: 720px) 45vw, 220px" alt="" />
            <span>{String(p.id).padStart(2, "0")}</span></div>
          <strong>{p.title}</strong><small>{done ? "Validée ✓" : locked ? "À découvrir" : "À jouer"} · {p.minutes}</small>
        </Link></li>;
      })}
    </ol>
  </section>;
}
