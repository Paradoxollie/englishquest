import type { BadgeCategory, BadgeTier } from "@/lib/profile/badges";

/* Médaille d'un badge : rang (bronze, argent, or) en couleur, catégorie en pictogramme. */

const GLYPHS: Record<BadgeCategory, string> = {
  // drapeau
  mission: "M6 21V4m0 0h10l-2 4 2 4H6",
  // carte pliée
  chapitre: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  // couronne
  examen: "M4 18h16M5 15 3.5 7l5 3.5L12 5l3.5 5.5 5-3.5L19 15H5Z",
  // manette
  partie: "M7 9v4M5 11h4m6-1h.01M18 12h.01M6.5 6h11A3.5 3.5 0 0 1 21 9.5v4.2a2.8 2.8 0 0 1-5 1.8L15 14H9l-1 1.5a2.8 2.8 0 0 1-5-1.8V9.5A3.5 3.5 0 0 1 6.5 6Z",
  // éclair
  jeu: "M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z",
  // flamme
  serie: "M12 22a7 7 0 0 0 7-7c0-4-3-6.5-4.5-9.5C13 8 12 9 10.5 9 10.5 6 9 4 8 3 7 7 5 9.5 5 15a7 7 0 0 0 7 7Z",
  // flèche montante
  niveau: "M12 20V5m0 0-6 6m6-6 6 6",
  // coche
  quiz: "m5 12.5 4.5 4.5L19 7.5",
  // boussole
  test: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z",
};

export function BadgeMedal({
  tier,
  category,
  earned = true,
  size = 44,
}: {
  tier: BadgeTier;
  category: BadgeCategory;
  earned?: boolean;
  size?: number;
}) {
  return (
    <span
      className={`eq-medal${earned ? "" : " is-locked"}`}
      data-tier={tier}
      style={{ ["--medal-size" as string]: `${size}px` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={GLYPHS[category]} />
      </svg>
    </span>
  );
}
