import { useId } from "react";
import type { GameConfig } from "@/lib/games/config";
import { type GamePresentation, getGamePresentation } from "@/lib/games/presentation";

type GameGraphicProps = {
  game: Pick<GameConfig, "slug" | "name">;
  className?: string;
};

function renderSymbol(presentation: GamePresentation) {
  const stroke = presentation.secondary;
  const fill = presentation.primary;

  switch (presentation.emblem) {
    case "scroll":
      return (
        <g>
          <path
            d="M30 24h26c8 0 13 5 13 13v18c0 8-5 13-13 13H39c-8 0-13-5-13-13V34c0-6 4-10 10-10h2"
            fill="rgba(2, 6, 23, 0.62)"
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M60 24c7 0 12 5 12 13v20c0 7-5 11-12 11"
            fill="none"
            stroke={fill}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M38 35h18M38 43h22M38 51h16" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M31 27c0 4-3 7-7 7s-7-3-7-7 3-7 7-7 7 3 7 7Z" fill={fill} opacity="0.9" />
          <path d="M24 22v10M19 27h10" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case "crosshair":
      return (
        <g>
          <circle cx="50" cy="42" r="18" fill="rgba(2, 6, 23, 0.58)" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="42" r="8" fill="none" stroke={fill} strokeWidth="3" />
          <path d="M50 18v10M50 56v10M26 42h10M64 42h10" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M70 25l4 6 7 1-5 5 1 7-7-3-6 3 1-7-5-5 7-1Z" fill={fill} />
          <path d="M32 60l8-8M60 60l8-8" stroke={fill} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "bolt":
      return (
        <g>
          <path
            d="M50 18 70 29v18c0 13-8 22-20 28-12-6-20-15-20-28V29Z"
            fill="rgba(2, 6, 23, 0.6)"
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M54 26 38 48h10l-4 18 18-24H51Z"
            fill={fill}
            stroke="#f8fafc"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M24 32h14M20 42h16M24 52h12" stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        </g>
      );
    case "tiles":
      return (
        <g>
          <rect x="24" y="26" width="18" height="18" rx="4" fill={fill} />
          <rect x="45" y="36" width="18" height="18" rx="4" fill="rgba(2, 6, 23, 0.65)" stroke={stroke} strokeWidth="3" />
          <rect x="62" y="22" width="14" height="14" rx="4" fill={stroke} />
          <path d="M33 49v8M54 59v8M69 39v18" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <path d="M26 70h48" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <path d="M36 64l-6 6M55 64l-6 6M67 60l-8 10" stroke={fill} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "arrows":
      return (
        <g>
          <path
            d="M23 33h24l-8-9m8 9-8 9"
            fill="none"
            stroke={fill}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M77 51H53l8-9m-8 9 8 9"
            fill="none"
            stroke={stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28 58h16c6 0 10 4 10 10v3H28c-6 0-10-4-10-10v-3c0-6 4-10 10-10Z"
            fill="rgba(2, 6, 23, 0.6)"
            stroke={fill}
            strokeWidth="3"
          />
          <path d="M34 63h14M34 69h10" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "memory":
      return (
        <g>
          <rect x="24" y="28" width="24" height="30" rx="5" fill="rgba(2, 6, 23, 0.62)" stroke={stroke} strokeWidth="3" />
          <rect x="40" y="22" width="24" height="30" rx="5" fill={fill} opacity="0.9" />
          <rect x="52" y="34" width="24" height="30" rx="5" fill="rgba(2, 6, 23, 0.62)" stroke={stroke} strokeWidth="3" />
          <path
            d="M30 66c8-9 32-9 40 0-8 9-32 9-40 0Z"
            fill="rgba(2, 6, 23, 0.7)"
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="66" r="6" fill={fill} />
          <circle cx="50" cy="66" r="2.5" fill="#f8fafc" />
        </g>
      );
  }
}

function renderArtworkBackdrop(presentation: GamePresentation) {
  const line = presentation.secondary;
  const fill = presentation.primary;

  switch (presentation.emblem) {
    case "scroll":
      return (
        <g opacity="0.3">
          <path d="M18 44c46-22 108-24 158-5" fill="none" stroke={line} strokeWidth="4" strokeLinecap="round" />
          <path d="M28 72c54-18 118-18 176-2" fill="none" stroke={line} strokeWidth="3" strokeLinecap="round" />
          <path d="M22 104h98M28 120h90M34 136h82" stroke={fill} strokeWidth="4" strokeLinecap="round" />
          <circle cx="252" cy="48" r="8" fill={fill} />
          <path d="M246 48h12M252 42v12" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case "crosshair":
      return (
        <g opacity="0.34">
          <circle cx="218" cy="86" r="50" fill="none" stroke={line} strokeWidth="4" />
          <circle cx="218" cy="86" r="26" fill="none" stroke={fill} strokeWidth="4" />
          <path d="M218 20v26M218 126v26M152 86h28M256 86h28" stroke={line} strokeWidth="4" strokeLinecap="round" />
          <path d="M52 150l14-22 16 8 18-28 24 10" fill="none" stroke={fill} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "bolt":
      return (
        <g opacity="0.34">
          <path d="M42 126h78l-22 48 60-68h-40l18-42Z" fill={fill} opacity="0.25" />
          <path d="M54 36h66M36 58h76M50 82h56" stroke={line} strokeWidth="4" strokeLinecap="round" />
          <path d="M176 34 242 52v52c0 26-18 48-48 62-30-14-48-36-48-62V52Z" fill="none" stroke={line} strokeWidth="4" />
        </g>
      );
    case "tiles":
      return (
        <g opacity="0.33">
          <rect x="168" y="34" width="40" height="40" rx="8" fill={fill} />
          <rect x="214" y="68" width="40" height="40" rx="8" fill="none" stroke={line} strokeWidth="4" />
          <rect x="124" y="90" width="34" height="34" rx="8" fill="none" stroke={fill} strokeWidth="4" />
          <path d="M44 148h214" stroke={line} strokeWidth="4" strokeLinecap="round" />
          <path d="M72 126v22M102 112v36M132 126v22M242 118v30" stroke={fill} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "arrows":
      return (
        <g opacity="0.33">
          <path d="M40 66h82l-20-20m20 20-20 20" fill="none" stroke={fill} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M282 122h-82l20-20m-20 20 20 20" fill="none" stroke={line} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M138 160h60c18 0 30-12 30-30v-6H138c-18 0-30 12-30 30v6c0 18 12 30 30 30" fill="none" stroke={line} strokeWidth="4" />
        </g>
      );
    case "memory":
      return (
        <g opacity="0.33">
          <rect x="122" y="36" width="56" height="72" rx="12" fill="none" stroke={fill} strokeWidth="4" />
          <rect x="154" y="22" width="56" height="72" rx="12" fill={fill} opacity="0.2" />
          <rect x="188" y="54" width="56" height="72" rx="12" fill="none" stroke={line} strokeWidth="4" />
          <path d="M70 166c26-22 154-22 180 0-26 22-154 22-180 0Z" fill="none" stroke={line} strokeWidth="4" />
          <circle cx="160" cy="166" r="18" fill={fill} opacity="0.24" />
        </g>
      );
  }
}

export function GameEmblem({ game, className = "" }: GameGraphicProps) {
  const presentation = getGamePresentation(game);
  const id = useId().replace(/:/g, "");
  const frameId = `${id}-frame`;
  const glowId = `${id}-glow`;

  return (
    <div className={`relative aspect-square ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={frameId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={presentation.secondary} />
            <stop offset="100%" stopColor={presentation.primary} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="28%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <polygon
          points="50,3 79,13 96,39 90,72 68,94 33,94 10,72 4,39 21,13"
          fill="#020617"
          stroke="rgba(0,0,0,0.9)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon
          points="50,8 76,17 90,40 84,69 65,88 36,88 16,69 10,40 24,17"
          fill={`url(#${frameId})`}
          opacity="0.95"
          stroke="#020617"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="50,14 72,22 83,41 78,66 62,82 39,82 22,66 17,41 28,22"
          fill="#07111f"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="50,14 72,22 83,41 78,66 62,82 39,82 22,66 17,41 28,22"
          fill={`url(#${glowId})`}
          opacity="0.8"
        />

        <g opacity="0.18">
          <path d="M26 26 74 74M74 26 26 74" stroke={presentation.secondary} strokeWidth="2" />
        </g>
        {renderSymbol(presentation)}

        <rect x="28" y="70.5" width="44" height="11" rx="5.5" fill="#020617" stroke="rgba(255,255,255,0.16)" />
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="10"
          fontWeight="800"
          letterSpacing="2.4"
          fontFamily="Arial, sans-serif"
        >
          {presentation.mark}
        </text>
      </svg>
    </div>
  );
}

export function GameCardArtwork({ game, className = "" }: GameGraphicProps) {
  const presentation = getGamePresentation(game);
  const id = useId().replace(/:/g, "");
  const washId = `${id}-wash`;
  const dotsId = `${id}-dots`;

  return (
    <svg viewBox="0 0 320 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={washId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={presentation.secondary} stopOpacity="0.26" />
          <stop offset="100%" stopColor={presentation.primary} stopOpacity="0.1" />
        </linearGradient>
        <pattern id={dotsId} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" fill={presentation.secondary} fillOpacity="0.2" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="320" height="220" fill="transparent" />
      <path d="M178 0h142v220H108c30-20 48-56 48-96 0-48 10-86 22-124Z" fill={`url(#${washId})`} />
      <path d="M206 0h114v220H156c42-18 70-60 70-110 0-36-8-74-20-110Z" fill={`url(#${dotsId})`} opacity="0.5" />
      <path d="M180 28h108M168 52h126M158 76h138" stroke={presentation.secondary} strokeOpacity="0.24" strokeWidth="4" strokeLinecap="round" />
      <path d="M188 194h92" stroke={presentation.primary} strokeOpacity="0.28" strokeWidth="4" strokeLinecap="round" />

      {renderArtworkBackdrop(presentation)}

      <g transform="translate(156 22) scale(1.34)" opacity="0.94">
        {renderSymbol(presentation)}
      </g>
    </svg>
  );
}
