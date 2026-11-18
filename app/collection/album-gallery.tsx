"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { formatGold } from "@/lib/shop/format-gold";
import { getAlbumProgress, isCollectionItemAvailable } from "@/lib/shop/collection";
import { wardrobeItemHref } from "@/lib/shop/reward-preview";
import { withNextParam } from "@/lib/navigation/safe-next";
import type { ShopItem, ShopItemType } from "@/types/shop";

type GalleryProps = {
  pieces: ShopItem[];
  ownedIds: string[];
  player: { level: number; gold: number } | null;
  signedIn: boolean;
};

const labels: Record<ShopItemType, string> = { avatar: "Personnage", title: "Titre", background: "Décor", ship_skin: "Vaisseau" };

function PieceImage({ item, sizes, className }: { item?: ShopItem; sizes: string; className?: string }) {
  if (!item?.image_url) return null;
  return <Image className={className} src={item.image_url} alt="" fill sizes={sizes} unoptimized={!item.image_url.startsWith("/art/collection/")} />;
}

export function AlbumGallery({ pieces, ownedIds, player, signedIn }: GalleryProps) {
  const fitting = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(pieces[0]);
  const [portrait, setPortrait] = useState(pieces.find(item => item.item_type === "avatar"));
  const [backdrop, setBackdrop] = useState(pieces.find(item => item.item_type === "background"));
  const [title, setTitle] = useState(pieces.find(item => item.item_type === "title" && !item.is_collection_reward));
  const own = new Set(ownedIds);
  const progress = getAlbumProgress(pieces, own, player?.level ?? 0, selected.collection_key ?? "");
  const canEquip = player && isCollectionItemAvailable(selected, pieces, own, player.level);
  const href = wardrobeItemHref(selected.item_key);

  function tryPiece(piece: ShopItem) {
    setSelected(piece);
    if (piece.item_type === "avatar") setPortrait(piece);
    if (piece.item_type === "background") setBackdrop(piece);
    if (piece.item_type === "title") setTitle(piece);
    const preview = fitting.current;
    if (preview && window.matchMedia("(max-width: 700px)").matches && preview.getBoundingClientRect().top < 0) {
      preview.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  }

  let condition = selected.price_gold > 0 ? `${formatGold(selected.price_gold)} · Niveau ${selected.required_level}` : `Offert au niveau ${selected.required_level}`;
  if (selected.is_collection_reward) condition = player ? `${progress.owned} / ${progress.total} pièces réunies` : `Titre offert pour les ${progress.total} pièces réunies`;
  if (canEquip) condition = "Disponible dans ton vestiaire";

  return (
    <div className="collection-gallery">
      <div className="collection-fitting" ref={fitting}>
        <figure className={`collection-scene${selected.item_type === "ship_skin" ? " is-flight" : ""}`}>
          {selected.item_type === "ship_skin" ? (
            <div className="collection-flight-sprite"><PieceImage item={selected} sizes="146px" /></div>
          ) : (
            <>
              <PieceImage item={backdrop} className="collection-scene-backdrop" sizes="(max-width: 700px) 93vw, 55vw" />
              {portrait?.image_url && <div className="collection-scene-portrait"><PieceImage item={portrait} sizes="145px" /></div>}
              {title && <span className="collection-scene-title">{title.name}</span>}
            </>
          )}
          <figcaption>{selected.item_type === "ship_skin" ? "Aperçu en vol" : "Aperçu sur ta carte"}</figcaption>
        </figure>
        <div className="collection-item-details" aria-live="polite" aria-atomic="true">
          <p className="collection-kicker">{selected.is_collection_reward ? "Titre de l’album" : labels[selected.item_type]}</p>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <strong className="collection-condition">{condition}</strong>
          <Link href={signedIn ? href : withNextParam("/auth/signup", href)} className="eq-btn eq-btn-primary">
            {signedIn ? "Ouvrir dans mon vestiaire" : "Créer mon compte pour la garder"}
          </Link>
        </div>
      </div>
      <h3 className="collection-pieces-heading">Essayer une pièce</h3>
      <div className="collection-piece-grid" role="group" aria-label="Pièces à essayer">
        {pieces.map(item => (
          <button type="button" key={item.id} className={`collection-piece piece-${item.item_type}`} aria-pressed={selected.id === item.id} onClick={() => tryPiece(item)}>
            <span aria-hidden="true" className={`collection-thumbnail${item.is_collection_reward ? " is-trophy" : ""}`}>
              {item.image_url ? <PieceImage item={item} sizes="(max-width: 500px) 40vw, 165px" /> : <span className="collection-nameplate">{item.name}</span>}
            </span>
            <span className="collection-piece-copy">
              <small>{item.is_collection_reward ? "Album complet" : labels[item.item_type]}</small>
              <b>{item.name}</b>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
