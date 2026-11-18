"use client";

import Image from "next/image";
import { useState } from "react";
import { DEFAULT_CHARACTER_FACE } from "@/lib/shop/characters";

/** Petit portrait décoratif. Le nom du joueur ou du personnage figure à côté. */
export function CharacterFace({ src, size, className }: { src?: string | null; size: number; className?: string }) {
  const [missing, setMissing] = useState<string | null>(null);
  const source = src && src !== missing ? src : DEFAULT_CHARACTER_FACE;
  return (
    <Image src={source} width={size} height={size} alt="" className={className}
      unoptimized={!source.startsWith("/art/")} onError={() => {
        if (source !== DEFAULT_CHARACTER_FACE) setMissing(source);
      }} />
  );
}
