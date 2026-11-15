import type { CSSProperties, ReactNode } from "react";

type BurstColor = "yellow" | "red" | "blue" | "white";

function starPoints(spikes: number, inner: number) {
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? 50 : 50 * inner;
    // Légère irrégularité déterministe : une étoile de BD n'est jamais parfaite.
    const jitter = i % 2 === 0 ? (i % 4 === 0 ? 0 : -3) : (i % 6 === 1 ? 2 : 0);
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const x = 50 + (radius + jitter) * Math.cos(angle);
    const y = 50 + (radius + jitter) * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

/**
 * Étoile d'onomatopée façon comics (« BIEN JOUÉ ! », « GRATUIT ! »).
 * Le texte reste du vrai texte HTML, lisible et traduisible.
 */
export function Burst({
  children,
  color = "yellow",
  size = 120,
  spikes = 14,
  rotate = -8,
  spin = false,
  className = "",
}: {
  children: ReactNode;
  color?: BurstColor;
  size?: number;
  spikes?: number;
  rotate?: number;
  spin?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`eq-burst eq-burst-${color} ${spin ? "is-spinning" : ""} ${className}`}
      style={{ width: size, height: size, "--burst-rotate": `${rotate}deg` } as CSSProperties}
    >
      <svg viewBox="-4 -4 108 108" aria-hidden="true" className="eq-burst-shape">
        <polygon points={starPoints(spikes, 0.72)} />
      </svg>
      <span className="eq-burst-text">{children}</span>
    </span>
  );
}
