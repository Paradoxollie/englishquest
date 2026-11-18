"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { characterSilhouetteUrl } from "@/lib/shop/characters";
import { COLLECTION_ALBUMS } from "@/lib/shop/collection";
import styles from "./character-art.module.css";

type FigureProps = {
  face: string | null;
  inCard?: boolean;
  eager?: boolean;
  fallback?: ReactNode;
};

export function CharacterFigure({ face, inCard = false, eager = false, fallback }: FigureProps) {
  const full = characterSilhouetteUrl(face);
  const [failed, setFailed] = useState<string | null>(null);
  const silhouette = full && failed !== full ? full : null;
  const src = silhouette ?? face;

  return (
    <span className={`${styles.figure} ${inCard ? styles.cardFigure : styles.sceneFigure} ${silhouette ? styles.silhouette : styles.portrait}`}
      aria-hidden="true" data-character-art={silhouette ? "silhouette" : "portrait"}>
      {silhouette || !fallback ? src && (
        <Image src={src} alt="" fill sizes={inCard ? "(max-width: 650px) 47vw, 270px" : "(max-width: 650px) 52vw, 350px"}
          loading={eager ? "eager" : "lazy"} unoptimized={!src.startsWith("/art/")}
          onError={silhouette ? () => setFailed(silhouette) : undefined} draggable={false} />
      ) : fallback}
    </span>
  );
}

export function CharacterCardArt({ face, albumKey, fallback }: {
  face: string | null;
  albumKey?: string | null;
  fallback?: ReactNode;
}) {
  const album = COLLECTION_ALBUMS.find(entry => entry.key === albumKey) ?? COLLECTION_ALBUMS[0];
  return (
    <span className={styles.plate} aria-hidden="true">
      <Image className={styles.setting} src={album.cover} alt="" fill sizes="(max-width: 650px) 47vw, 270px" />
      <CharacterFigure face={face} inCard fallback={fallback} />
    </span>
  );
}
