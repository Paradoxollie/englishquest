"use client";

import { useState } from "react";
import Image from "next/image";
import { CharacterFigure } from "@/components/rewards/character-art";
import { GameEmblemIcon, ShopClassArt } from "@/components/ui/game-icons";
import { LevelIcon, TrophyIcon } from "@/components/ui/icons";
import { DEFAULT_CHARACTER_FACE } from "@/lib/shop/characters";
import { COLLECTION_ALBUMS } from "@/lib/shop/collection";
import type { ShopItem } from "@/types/shop";
import type { Outfit } from "./wardrobe-state";

export function ItemArt({ item, eager = false }: { item: ShopItem; eager?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (item.image_url && item.image_url !== failedUrl) {
    // Admin uploads and the packaged illustrations share the same catalogue.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" src={item.image_url} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false}
      onError={() => setFailedUrl(item.image_url)} />;
  }
  if (item.item_type === "title") {
    const album = COLLECTION_ALBUMS.find(entry => entry.key === item.collection_key);
    return (
      <span className="wardrobe-ribbon-art">
        {album && <span className="wardrobe-ribbon-scene" style={{ backgroundImage: `url("${album.cover}")` }} />}
        <span className="wardrobe-ribbon">
          {item.is_collection_reward ? <TrophyIcon /> : <LevelIcon />}
          <strong>{item.name}</strong>
        </span>
      </span>
    );
  }
  if (item.item_type === "ship_skin") return <GameEmblemIcon emblem="crosshair" className="wardrobe-default-ship" />;
  return <ShopClassArt itemKey={item.item_key} itemType={item.item_type} name={item.name} />;
}

function Scene({ background, defaultPrint = false }: { background: ShopItem | null; defaultPrint?: boolean }) {
  return <span className={`wardrobe-scene${!background && defaultPrint ? " is-print" : ""}`} aria-hidden="true">
    {background ? <ItemArt item={background} eager /> : defaultPrint ? (
      <Image src={COLLECTION_ALBUMS[0].cover} alt="" fill sizes="(max-width: 650px) 92vw, 475px" />
    ) : null}
  </span>;
}

export function PlayerPortrait({ outfit }: { outfit: Outfit }) {
  return (
    <span className="wardrobe-portrait" aria-hidden="true">
      <Scene background={outfit.background} />
      <span className="wardrobe-portrait-face">
        {outfit.avatar ? <ItemArt item={outfit.avatar} eager /> : <Image src={DEFAULT_CHARACTER_FACE} width={96} height={96} alt="" />}
      </span>
    </span>
  );
}

export function PlayerCard({ outfit, username }: { outfit: Outfit; username: string }) {
  return (
    <div className="wardrobe-pass">
      <Scene background={outfit.background} defaultPrint />
      <CharacterFigure face={outfit.avatar ? outfit.avatar.image_url : DEFAULT_CHARACTER_FACE} eager
        fallback={outfit.avatar ? <ItemArt item={outfit.avatar} eager /> : undefined} />
      <div className="wardrobe-pass-signature">
        <strong>{username}</strong>
        {outfit.title && <span>{outfit.title.name}</span>}
      </div>
    </div>
  );
}
