import type { GamePresentation } from "@/lib/games/presentation";

/**
 * Custom editorial shield-and-nib emblem for English Quest (header, footer, cards).
 */
export function BrandEmblem({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="32"
        height="32"
        rx="5"
        fill="#141824"
        stroke="#F4B632"
        strokeWidth="2"
      />
      <path d="M2 10H34" stroke="#C42B27" strokeWidth="2.5" />
      <path
        d="M18 11.5L25.5 22.5L18 29.5L10.5 22.5L18 11.5Z"
        fill="#FFFDF8"
        stroke="#F4B632"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M18 11.5V21" stroke="#141824" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="18" cy="22.5" r="2" fill="#C42B27" />
    </svg>
  );
}

/**
 * Crisp comic icon matching each game's mechanic (replaces flat two-letter squares).
 */
export function GameEmblemIcon({
  emblem,
  className = "h-5 w-5",
}: {
  emblem: GamePresentation["emblem"];
  className?: string;
}) {
  switch (emblem) {
    case "scroll":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6" />
          <path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      );
    case "crosshair":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" fill="currentColor" fillOpacity="0.18" />
        </svg>
      );
    case "tiles":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="3" y="4" width="8" height="6" rx="1" />
          <rect x="13" y="7" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.18" />
          <rect x="6" y="14" width="12" height="6" rx="1" />
        </svg>
      );
    case "arrows":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M4 9h14l-3.5-3.5M20 15H6l3.5 3.5" />
        </svg>
      );
    case "memory":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="4" y="6" width="10" height="14" rx="1.5" fill="currentColor" fillOpacity="0.16" />
          <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v11a1.5 1.5 0 0 1-1.5 1.5H17" />
          <path d="M9 11v4M7 13h4" />
        </svg>
      );
  }
}

/**
 * Illustrated SVG artwork plates for starter shop items lacking uploaded PNG portraits.
 */
export function ShopClassArt({
  itemKey,
  itemType,
  name,
}: {
  itemKey: string;
  itemType: string;
  name: string;
}) {
  if (itemType === "background") {
    const palettes: Record<string, { sky: string; glow: string; hill: string; label: string }> = {
      bg_ocean: { sky: "#0f2c4c", glow: "#38bdf8", hill: "#0a1f36", label: "OCEAN" },
      bg_forest: { sky: "#123524", glow: "#4ade80", hill: "#0b2217", label: "FOREST" },
      bg_volcano: { sky: "#3b1414", glow: "#fb923c", hill: "#1f0b0b", label: "VOLCANO" },
      bg_sky: { sky: "#1e3a8a", glow: "#93c5fd", hill: "#172554", label: "SKY" },
      bg_night: { sky: "#0b1120", glow: "#e2e8f0", hill: "#1e293b", label: "NIGHT" },
      bg_aurora: { sky: "#0f172a", glow: "#2dd4bf", hill: "#134e4a", label: "AURORA" },
      bg_cosmos: { sky: "#1e1038", glow: "#c084fc", hill: "#090414", label: "COSMOS" },
    };
    const p = palettes[itemKey] ?? { sky: "#161d2f", glow: "#f4b632", hill: "#0e1320", label: name };
    return (
      <svg viewBox="0 0 240 160" className="h-full w-full" aria-hidden="true">
        <rect width="240" height="160" fill={p.sky} />
        <circle cx="176" cy="46" r="24" fill={p.glow} fillOpacity="0.28" />
        <circle cx="176" cy="46" r="14" fill={p.glow} fillOpacity="0.85" />
        <path d="M0 116 L58 76 L112 106 L168 68 L240 108 L240 160 L0 160 Z" fill={p.hill} />
        <path d="M0 132 L78 102 L150 124 L240 94 L240 160 L0 160 Z" fill="#090d16" fillOpacity="0.72" />
        <rect x="14" y="14" width="66" height="20" rx="3" fill="#090d16" fillOpacity="0.65" stroke={p.glow} strokeWidth="1" />
        <text x="47" y="28" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800" fontFamily="monospace">
          {p.label.slice(0, 10)}
        </text>
      </svg>
    );
  }

  const classStyles: Record<string, { bg: string; accent: string; sigil: string }> = {
    avatar_ranger: { bg: "#143025", accent: "#4ade80", sigil: "bow" },
    avatar_paladin: { bg: "#2b2110", accent: "#f4b632", sigil: "shield" },
    avatar_necromancer: { bg: "#26133a", accent: "#c084fc", sigil: "orb" },
    avatar_assassin: { bg: "#2e1118", accent: "#f87171", sigil: "blades" },
    avatar_dragon_lord: { bg: "#3a160c", accent: "#fb923c", sigil: "crown" },
    avatar_celestial: { bg: "#122449", accent: "#60a5fa", sigil: "star" },
  };
  const s = classStyles[itemKey] ?? { bg: "#161d2f", accent: "#f4b632", sigil: "shield" };

  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" aria-hidden="true">
      <rect width="200" height="260" fill={s.bg} />
      <circle cx="100" cy="112" r="64" fill={s.accent} fillOpacity="0.14" stroke={s.accent} strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="100" cy="84" r="24" fill="#0e1320" stroke={s.accent} strokeWidth="3" />
      <path d="M52 198 C56 152, 144 152, 148 198 Z" fill="#0e1320" stroke={s.accent} strokeWidth="3" />
      {s.sigil === "crown" ? (
        <path d="M74 58 L84 40 L100 52 L116 40 L126 58 Z" fill={s.accent} />
      ) : s.sigil === "star" ? (
        <path d="M100 124 L106 138 L121 140 L110 150 L113 165 L100 158 L87 165 L90 150 L79 140 L94 138 Z" fill={s.accent} />
      ) : (
        <path d="M100 124 L118 134 V154 C118 166 100 176 100 176 C100 176 82 166 82 154 V134 Z" fill={s.accent} fillOpacity="0.88" />
      )}
      <text x="100" y="232" textAnchor="middle" fill="#fffdf8" fontSize="13" fontWeight="800" fontFamily="sans-serif">
        {name.toUpperCase()}
      </text>
    </svg>
  );
}
