"use client";

import Link from "next/link";
import { useState } from "react";
import { CharacterCardArt } from "@/components/rewards/character-art";
import { compareCharacterProgression } from "@/lib/shop/characters";
import { formatGold } from "@/lib/shop/format-gold";
import type { ShopItem } from "@/types/shop";

export function CharacterRoster({ characters, featuredIds }: { characters: ShopItem[]; featuredIds: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const byId = new Map(characters.map(item => [item.id, item]));
  const featured = featuredIds.map(id => byId.get(id)).filter((item): item is ShopItem => Boolean(item));
  const visible = expanded ? [...characters].sort(compareCharacterProgression) : featured;

  return (
    <section id="personnages" className="collection-roster" aria-labelledby="roster-title">
      <div className="collection-section-heading">
        <div>
          <h2 id="roster-title">Les personnages à recruter</h2>
          <p>{expanded ? "Du premier au dernier niveau, choisis un personnage pour l’essayer." : "Choisis un personnage pour le retrouver dans le décor de son album."}</p>
        </div>
        {characters.length > featured.length && <button type="button" className="eq-btn eq-btn-ghost" aria-expanded={expanded}
          aria-controls="roster-characters" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Revenir à la sélection" : `Voir les ${characters.length} personnages`}
        </button>}
      </div>
      {visible.length > 0 ? (
        <ul className="collection-roster-grid" id="roster-characters">
          {visible.map(item => (
            <li key={item.id}>
              <Link className="collection-roster-card" href={`/collection?album=${encodeURIComponent(item.collection_key ?? "")}&personnage=${encodeURIComponent(item.item_key)}#essayage`}>
                <span className="collection-roster-art"><CharacterCardArt face={item.image_url} albumKey={item.collection_key} /></span>
                <span className="collection-roster-copy">
                  <strong>{item.name}</strong>
                  <span><b>Niveau {item.required_level}</b> · {item.price_gold ? formatGold(item.price_gold) : "Offert"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="collection-unavailable">Les personnages sont momentanément indisponibles.</p>}
    </section>
  );
}
