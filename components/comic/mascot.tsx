import Image from "next/image";

export const MASCOT_POSES = {
  "maya-explique": { src: "/art/bd/heros/maya-explique.webp", alt: "Maya, l'héroïne d'English Quest, explique la consigne." },
  "maya-salut": { src: "/art/bd/heros/maya-salut.webp", alt: "Maya fait coucou." },
  "sam-bravo": { src: "/art/bd/heros/sam-bravo.webp", alt: "Sam saute de joie." },
  "sam-oups": { src: "/art/bd/heros/sam-oups.webp", alt: "Sam se gratte la tête, un peu gêné." },
  "duo-victoire": { src: "/art/bd/heros/duo-victoire.webp", alt: "Maya et Sam fêtent la victoire." },
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;

/**
 * Maya ou Sam, détourés sur fond crème. L'image est fondue dans le papier
 * (mélange « produit ») : à poser sur un fond clair.
 */
export function Mascot({
  pose,
  size = 160,
  decorative = true,
  className = "",
  priority = false,
}: {
  pose: MascotPose;
  size?: number;
  decorative?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const { src, alt } = MASCOT_POSES[pose];
  return (
    <span className={`eq-mascot ${className}`} style={{ width: size, height: size }}>
      <Image src={src} alt={decorative ? "" : alt} width={size} height={size} sizes={`${size * 2}px`} priority={priority} />
    </span>
  );
}
