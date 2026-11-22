import Image from "next/image";
import type { Activity } from "@/lib/adventure/activities";
import { boardPictures } from "./passage-art";

type BoardControls = {
  step: Activity; choice: string; tiles: number[]; clue: number; seed: number;
  select: (value: string) => void; pin: (items: number[]) => void; examine: (index: number) => void;
};

function inDisplayOrder<T>(items: T[], seed: number) {
  const indexed = items.map((item, index) => ({ item, index }));
  if (indexed.length < 2) return indexed;
  const start = seed % indexed.length;
  const rotated = indexed.slice(start).concat(indexed.slice(0, start));
  return Math.floor(seed / indexed.length) % 2 ? rotated.reverse() : rotated;
}

export function PassageBoard({ step, choice, tiles, clue, seed, select, pin, examine }: BoardControls) {
  const options = step.options ?? [];
  if (step.spots) {
    const { picture, points, labels } = step.spots;
    const art = boardPictures[picture];
    return <div className="atlas-exhibit">
      <div className="exhibit-image"><Image src={art.src} alt={art.alt} sizes="(max-width: 720px) 94vw, 680px" placeholder="blur" />
        {options.map((option, i) => <button key={option} type="button" className="exhibit-pin" style={{ left: points[i][0] + "%", top: points[i][1] + "%" }}
          aria-label={labels?.[i] ?? option} aria-pressed={choice === option} onClick={() => select(option)}><span aria-hidden="true">{i + 1}</span></button>)}
      </div>
      <div className="exhibit-key" aria-label="Repères dans l’image">{options.map((option, i) => <button type="button" key={option}
        aria-pressed={choice === option} onClick={() => select(option)}><b aria-hidden="true">{i + 1}</b> {labels?.[i] ?? option}</button>)}</div>
    </div>;
  }
  if (step.delivery) {
    const art = boardPictures[step.delivery.picture];
    return <div className="atlas-maildesk">
      <div className="maildesk-view"><Image src={art.src} alt={art.alt} placeholder="blur" sizes="(max-width: 720px) 94vw, 680px" />
        {tiles.length > 0 && <span key={tiles[0] + choice} className="mail-slip">{options[tiles[0]]}{choice && <><i aria-hidden="true"> → </i>{choice}</>}</span>}
      </div>
      <div className="maildesk-sorting">
        <div><strong>1 · Objet à remettre</strong><div className="mail-items">{inDisplayOrder(options, seed).map(({item, index: i}) => <button type="button" key={item}
          aria-pressed={tiles[0] === i} onClick={() => pin([i])}>{item}</button>)}</div></div>
        <div><strong>2 · Destination</strong><div className="mail-bins">{inDisplayOrder(step.delivery.destinations, Math.floor(seed / 7)).map(({item: dest}) => <button type="button" key={dest}
          disabled={!tiles.length} aria-pressed={choice === dest} onClick={() => select(dest)}>{dest}</button>)}</div></div>
      </div>
    </div>;
  }
  if (!step.clues) return null;
  const opened = step.clues[clue];
  const pinned = tiles.includes(clue);
  return <div className="atlas-dossier">
    <div className="dossier-tabs" aria-label="Documents du dossier">{inDisplayOrder(step.clues, seed).map(({item, index: i}, place) => <button type="button" key={item.label}
      aria-label={item.label} aria-pressed={i === clue} onClick={() => examine(i)}><small>Pièce {place + 1}</small>{item.label}{tiles.includes(i) && <span aria-label="épinglée"> ✓</span>}</button>)}</div>
    {opened && <div className="dossier-sheet" key={clue}><strong>{opened.label}</strong><p lang="en">{opened.text}</p>
      <button type="button" aria-pressed={pinned} disabled={!pinned && tiles.length >= 2}
        onClick={() => pin(pinned ? tiles.filter(i => i !== clue) : [...tiles, clue])}>{pinned ? "Détacher cette pièce" : "Épingler cette pièce"}</button>
    </div>}
    <p className="dossier-count" role="status">{tiles.length}/2 indices épinglés{tiles.length > 0 && " · " + tiles.map(i => step.clues![i].label).join(" et ")}</p>
    {tiles.length === 2 && <div className="dossier-verdict" role="group" aria-label="Ta conclusion"><strong>Ta conclusion</strong>
      {inDisplayOrder(options, Math.floor(seed / 7)).map(({item: option}) => <button type="button" key={option} aria-pressed={choice === option} onClick={() => select(option)}>{option}</button>)}
    </div>}
  </div>;
}
