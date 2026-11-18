"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, GoldIcon } from "@/components/ui/icons";
import { COLLECTION_ALBUMS, getAlbumProgress, isCollectionItemAvailable } from "@/lib/shop/collection";
import { formatGold } from "@/lib/shop/format-gold";
import type { ShopItem, ShopItemType } from "@/types/shop";
import { ItemArt, PlayerCard } from "./collection-art";
import { ItemDetails } from "./item-details";
import { useWardrobe } from "./wardrobe-state";

const categories = [
  { type: "avatar", name: "Personnages", slot: "Personnage" },
  { type: "background", name: "Décors", slot: "Décor" },
  { type: "title", name: "Titres", slot: "Titre" },
  { type: "ship_skin", name: "Vaisseaux", slot: "Vaisseau" },
] as const;

export function ShopSection({ initialKey }: { initialKey?: string }) {
  const state = useWardrobe();
  const router = useRouter();
  const initialItem = state.items.find(item => item.item_key === initialKey);
  const [selectedId, setSelectedId] = useState<string | null>(initialItem?.id ?? null);
  const [type, setType] = useState<ShopItemType | "all">(initialItem?.item_type ?? "avatar");
  const [albumKey, setAlbumKey] = useState("");
  const [mine, setMine] = useState(false);
  const catalogue = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const selected = state.items.find(item => item.id === selectedId);
  const available = (item: ShopItem) => state.outfit[item.item_type]?.id === item.id ||
    isCollectionItemAvailable(item, state.items, state.ownedIds, state.level);
  const items = state.items.filter(item =>
    (!mine || available(item)) && (!albumKey || item.collection_key === albumKey) &&
    (type === "all" || item.item_type === type)
  );
  const album = COLLECTION_ALBUMS.find(entry => entry.key === albumKey);
  const progress = album && getAlbumProgress(state.items, state.ownedIds, state.level, album.key);
  const catalogueName = type === "all" ? "Tous les objets" : categories.find(c => c.type === type)?.name;
  const starterCharacters = !state.outfit.avatar && !state.outfit.background && !state.outfit.title
    ? state.items.filter(item =>
        (item.item_key === "eq_depart_maya" || item.item_key === "eq_depart_sam") && available(item)
      )
    : [];

  function openDetails(id: string, trigger: HTMLButtonElement) {
    opener.current = trigger;
    setSelectedId(id);
  }

  function closeDetails() {
    setSelectedId(null);
    const trigger = opener.current;
    opener.current = null;
    requestAnimationFrame(() => (trigger?.isConnected ? trigger : catalogue.current)?.focus({ preventScroll: true }));
  }

  function showCategory(nextType: ShopItemType | "all", album = "") {
    setType(nextType);
    setAlbumKey(album);
    setMine(false);
    setSelectedId(null);
    opener.current = null;
    requestAnimationFrame(() => catalogue.current?.focus());
  }

  return (
    <section id="boutique" className="wardrobe" aria-labelledby="profile-look">
      <div className="wardrobe-heading">
        <div>
          <h2 id="profile-look" className="eq-h2">Ma collection</h2>
          <Link href="/collection" className="wardrobe-text-link">Découvrir les albums</Link>
        </div>
        <div className="wardrobe-wallet">
          <span><GoldIcon /> <b>{formatGold(state.gold)}</b></span>
          <span>Niveau {state.level}</span>
        </div>
      </div>

      <div className="wardrobe-equipped">
        {starterCharacters.length > 0 ? (
          <div className="wardrobe-starters">
            <h3>Choisis ton personnage</h3>
            <div>
              {starterCharacters.map(item => (
                <button type="button" key={item.id} aria-haspopup="dialog" aria-label={`Essayer ${item.name}`}
                  onClick={event => openDetails(item.id, event.currentTarget)}>
                  <ItemArt item={item} eager />
                  <strong>{item.name}</strong>
                </button>
              ))}
            </div>
          </div>
        ) : <PlayerCard outfit={state.outfit} username={state.username} />}
        <div className="wardrobe-loadout">
          <h3>Mon équipement</h3>
          <div className="wardrobe-slots">
            {categories.map(({ type, slot }) => {
              const item = state.outfit[type];
              return (
                <button key={type} type="button" className="wardrobe-slot"
                  aria-label={item ? `${slot} équipé, ${item.name}. Voir l’objet` : `Choisir un ${slot.toLowerCase()}`}
                  aria-haspopup={item ? "dialog" : undefined}
                  onClick={event => item ? openDetails(item.id, event.currentTarget) : showCategory(type)}>
                  <span>{slot}</span><strong>{item?.name ?? "Choisir"}</strong>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wardrobe-catalog" ref={catalogue} tabIndex={-1} aria-label="Catalogue du vestiaire">
        <div className="wardrobe-filters">
          <div className="wardrobe-scope" role="group" aria-label="Objets à afficher">
            <button type="button" aria-pressed={!mine} onClick={() => setMine(false)}>Boutique</button>
            <button type="button" aria-pressed={mine} onClick={() => setMine(true)}>Mes objets</button>
          </div>
          <label className="wardrobe-album-filter">
            <span>Album</span>
            <select value={albumKey} onChange={event => setAlbumKey(event.target.value)}>
              <option value="">Tous les albums</option>
              {COLLECTION_ALBUMS.map(entry => <option key={entry.key} value={entry.key}>{entry.name}</option>)}
            </select>
          </label>
        </div>
        <div className="wardrobe-categories" role="group" aria-label="Catégorie">
          <button type="button" aria-pressed={type === "all"} onClick={() => setType("all")}>Tout</button>
          {categories.map(entry => (
            <button type="button" key={entry.type} aria-pressed={type === entry.type} onClick={() => setType(entry.type)}>{entry.name}</button>
          ))}
        </div>
        {album && progress && (
          <div className="wardrobe-album-progress">
            <strong>{album.name}</strong>
            <span>{progress.owned} / {progress.total} pièces obtenues</span>
            <progress aria-label={`Progression dans ${album.name}`} value={progress.owned} max={progress.total || 1} />
          </div>
        )}
        {state.unavailable ? (
          <div className="wardrobe-empty" role="alert">
            <p>Le vestiaire n’a pas pu charger toutes tes pièces.</p>
            <button type="button" onClick={() => router.refresh()} className="wardrobe-text-link">Réessayer</button>
          </div>
        ) : items.length === 0 ? (
          <div className="wardrobe-empty" role="status">
            <p>{mine ? "Tu n’as pas encore de pièce dans cette sélection." : "Aucune pièce dans cette sélection."}</p>
            <button type="button" onClick={() => showCategory("all")} className="wardrobe-text-link">Voir tous les objets</button>
          </div>
        ) : (
          <ul className="wardrobe-grid" aria-label={`${catalogueName}, ${items.length} objets`}>
            {items.map(item => {
              const equipped = state.outfit[item.item_type]?.id === item.id;
              const obtained = available(item);
              const priceVisible = !obtained && !item.is_collection_reward && item.price_gold > 0;
              const status = equipped ? "Équipé" : obtained ? "Obtenu" : item.is_collection_reward ? "Album complet requis" : priceVisible ? formatGold(item.price_gold) : "Offert";
              return (
                <li key={item.id}>
                  <button type="button" className="wardrobe-tile" onClick={event => openDetails(item.id, event.currentTarget)} aria-haspopup="dialog"
                    aria-label={`${item.name}, ${status}${obtained ? "" : `, niveau ${item.required_level}`}. Voir l’aperçu`}>
                    <span className={`wardrobe-tile-art is-${item.item_type}`} aria-hidden="true"><ItemArt item={item} /></span>
                    <span className="wardrobe-tile-info">
                      <strong>{item.name}</strong>
                      <span className="wardrobe-tile-meta">
                        <span className={obtained ? "is-obtained" : "is-price"}>
                          {obtained && <CheckIcon />}
                          {priceVisible ? <><GoldIcon />{item.price_gold.toLocaleString("fr-FR")}</> : status}
                        </span>
                        {!obtained && !item.is_collection_reward && <span>Niv. {item.required_level}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {selected && <ItemDetails key={selected.id} item={selected} onClose={closeDetails}
        openAlbum={key => showCategory("all", key)} openItem={setSelectedId} />}
    </section>
  );
}
