"use client";

import { PlayerPortrait } from "./shop/collection-art";
import { useWardrobe } from "./shop/wardrobe-state";

export function AvatarDisplay() {
  const { outfit, username } = useWardrobe();
  return <PlayerPortrait outfit={outfit} username={username} />;
}

export function TitleDisplay() {
  const { outfit } = useWardrobe();
  return outfit.title ? <p className="wardrobe-equipped-title">{outfit.title.name}</p> : null;
}
