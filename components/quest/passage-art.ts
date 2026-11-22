import type { StaticImageData } from "next/image";
import type { Passage } from "@/lib/adventure/catalog";
import quai from "@/public/art/passage/quai.webp";
import canopy from "@/public/art/passage/canopy.webp";
import wind from "@/public/art/passage/wind.webp";
import tide from "@/public/art/passage/tide.webp";
import observatory from "@/public/art/passage/observatory.webp";

export const passageArt = { quai, canopy, wind, tide, observatory } satisfies Record<Passage["art"], StaticImageData>;
export const landscapeSizes = "(max-width: 1190px) 100vw, 1160px";
