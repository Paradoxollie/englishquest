"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CharacterCardArt, CharacterFigure } from "@/components/rewards/character-art";
import { compareCharacterProgression, DEFAULT_CHARACTER_FACE } from "@/lib/shop/characters";
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
  initialCharacterId?: string;
};

const labels: Record<ShopItemType, string> = { avatar: "Personnage", title: "Titre", background: "Décor", ship_skin: "Vaisseau" };

function PieceImage({ item, sizes, className }: { item?: ShopItem; sizes: string; className?: string }) {
  if (!item?.image_url) return null;
  return <Image className={className} src={item.image_url} alt="" fill sizes={sizes} unoptimized={!item.image_url.startsWith("/art/collection/")} />;
}

export function AlbumGallery({ pieces, ownedIds, player, signedIn, initialCharacterId }: GalleryProps) {
  const fitting = useRef<HTMLDivElement>(null);
  const nameHeading = useRef<HTMLHeadingElement>(null);
  const characters = pieces.filter(item => item.item_type === "avatar").sort(compareCharacterProgression);
  const accessories = pieces.filter(item => item.item_type !== "avatar");
  const initial = characters.find(item => item.id === initialCharacterId);
  const [selected, setSelected] = useState(initial ?? characters[0] ?? pieces[0]);
  const [portrait, setPortrait] = useState(initial ?? characters[0]);
  const [backdrop, setBackdrop] = useState(pieces.find(item => item.item_type === "background"));
  const [title, setTitle] = useState(pieces.find(item => item.item_type === "title" && !item.is_collection_reward));
  const own = new Set(ownedIds);
  const progress = getAlbumProgress(pieces, own, player?.level ?? 0, selected.collection_key ?? "");
  const canEquip = player && isCollectionItemAvailable(selected, pieces, own, player.level);
  const href = wardrobeItemHref(selected.item_key);

  useEffect(() => {
    if (initialCharacterId && window.location.hash === "#essayage") {
      fitting.current?.scrollIntoView({ block: "start", behavior: "instant" });
      nameHeading.current?.focus({ preventScroll: true });
    }
  }, [initialCharacterId]);

  function tryPiece(piece: ShopItem) {
    setSelected(piece);
    if (piece.item_type === "avatar") {
      setPortrait(piece);
      const url = new URL(window.location.href);
      url.searchParams.set("album", piece.collection_key ?? "");
      url.searchParams.set("personnage", piece.item_key);
      url.hash = "essayage";
      window.history.replaceState(null, "", url);
    }
    if (piece.item_type === "background") setBackdrop(piece);
    if (piece.item_type === "title") setTitle(piece);
    const preview = fitting.current;
    if (preview && window.matchMedia("(max-width: 700px)").matches && preview.getBoundingClientRect().top < 0) {
      preview.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      nameHeading.current?.focus({ preventScroll: true });
    }
  }

  let condition = selected.price_gold > 0 ? `${formatGold(selected.price_gold)} · Niveau ${selected.required_level}` : `Offert au niveau ${selected.required_level}`;
  if (selected.is_collection_reward) condition = player ? `${progress.owned} / ${progress.total} pièces réunies` : `Titre offert pour les ${progress.total} pièces réunies`;
  if (canEquip) condition = "Disponible dans ton vestiaire";

  return (
    <div className="collection-gallery">
      <div id="essayage" className="collection-fitting" ref={fitting}>
        <figure className={`collection-scene${selected.item_type === "ship_skin" ? " is-flight" : ""}`}>
          {selected.item_type === "ship_skin" ? (
            <div className="collection-flight-sprite"><PieceImage item={selected} sizes="146px" /></div>
          ) : (
            <>
              <PieceImage item={backdrop} className="collection-scene-backdrop" sizes="(max-width: 700px) 93vw, 55vw" />
              <CharacterFigure face={portrait?.image_url ?? DEFAULT_CHARACTER_FACE} eager />
              {title && <span className="collection-scene-title">{title.name}</span>}
            </>
          )}
          <figcaption>{selected.item_type === "ship_skin" ? "Aperçu en vol" : "Aperçu sur ta carte"}</figcaption>
        </figure>
        <div className="collection-item-details" aria-live="polite" aria-atomic="true">
          <p className="collection-kicker">{selected.is_collection_reward ? "Titre de l’album" : labels[selected.item_type]}</p>
          <h3 ref={nameHeading} tabIndex={-1}>{selected.name}</h3>
          <p>{selected.description}</p>
          <strong className="collection-condition">{condition}</strong>
          <Link href={signedIn ? href : withNextParam("/auth/signup", href)} className="eq-btn eq-btn-primary">
            {signedIn ? "Ouvrir dans mon vestiaire" : selected.item_type === "avatar" ? "Créer mon compte pour le recruter" : "Créer mon compte pour la garder"}
          </Link>
        </div>
      </div>
      {characters.length > 0 && (
        <>
          <h3 className="collection-pieces-heading">Les personnages de cet album</h3>
          <div className="collection-character-grid" role="group" aria-label="Personnages à essayer">
            {characters.map(item => (
              <button type="button" key={item.id} className="collection-piece collection-character" aria-pressed={selected.id === item.id}
                onClick={() => tryPiece(item)}>
                <span className="collection-character-art"><CharacterCardArt face={item.image_url} albumKey={item.collection_key} /></span>
                <span className="collection-piece-copy">
                  <b>{item.name}</b>
                  <small>{item.price_gold ? formatGold(item.price_gold) : "Offert"} · Niveau {item.required_level}</small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {accessories.length > 0 && <h3 className="collection-pieces-heading">Essayer une pièce</h3>}
      <div className="collection-piece-grid" role="group" aria-label="Pièces à essayer">
        {accessories.map(item => (
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
