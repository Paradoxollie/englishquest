import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { GameCardArtwork, GameEmblem } from "@/components/play/game-emblem";
import { difficultyColors, type GameConfig } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";

type GameRecommendationCardProps = {
  game: GameConfig;
  href?: string;
  badgeLabel?: string;
  ctaLabel?: string;
  footerLabel?: string;
  variant?: "compact" | "showcase";
  className?: string;
};

const difficultyLabels = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
} as const;

export function GameRecommendationCard({
  game,
  href = `/play/${game.slug}`,
  badgeLabel,
  ctaLabel = "Lancer ce jeu",
  footerLabel,
  variant = "compact",
  className = "",
}: GameRecommendationCardProps) {
  const presentation = getGamePresentation(game);
  const isShowcase = variant === "showcase";

  return (
    <Link
      href={href}
      className={`group comic-card-dark flex h-full min-w-0 flex-col p-3 md:p-4 ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(3, 8, 18, 0.96) 0%, rgba(2, 6, 23, 0.99) 100%)",
      }}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div
          className={`comic-panel relative overflow-hidden border-2 border-black p-4 md:p-5 ${
            isShowcase ? "min-h-[230px]" : "min-h-[205px]"
          }`}
          style={{
            background:
              "linear-gradient(135deg, rgba(10, 16, 31, 0.96) 0%, rgba(6, 10, 20, 0.98) 58%, rgba(3, 6, 15, 0.99) 100%)",
          }}
        >
          <div
            className="absolute inset-y-0 left-0 w-2"
            style={{
              background: `linear-gradient(180deg, ${presentation.secondary} 0%, ${presentation.primary} 100%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              background:
                "repeating-linear-gradient(128deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 18px)",
            }}
          />
          <div
            className="absolute inset-0 opacity-18"
            style={{
              background:
                "repeating-conic-gradient(from -8deg at 78% 22%, rgba(255, 255, 255, 0.12) 0deg 8deg, transparent 8deg 18deg)",
            }}
          />
          <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />
          <div className="absolute inset-y-4 right-2 w-[36%] opacity-95 sm:w-[44%]">
            <GameCardArtwork game={game} className="h-full w-full" />
          </div>
          <div
            className="absolute right-4 top-4 h-8 w-16 rounded-full border border-black/50"
            style={{
              background: `linear-gradient(90deg, ${presentation.secondary}44 0%, ${presentation.primary}22 100%)`,
            }}
          />

          <div className="relative z-10 flex h-full max-w-[72%] flex-col sm:max-w-[68%]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {badgeLabel && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-200 text-outline">
                    {badgeLabel}
                  </p>
                )}
                <span
                  className="mt-2 inline-flex rounded-full border border-black/55 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white"
                  style={{
                    background: `linear-gradient(90deg, ${presentation.secondary}2a 0%, rgba(2, 6, 23, 0.84) 100%)`,
                  }}
                >
                  {presentation.mode}
                </span>
              </div>

              <span
                className={`shrink-0 rounded-full border border-black/50 px-3 py-1 text-[11px] font-bold text-white ${difficultyColors[game.difficulty]}`}
              >
                {difficultyLabels[game.difficulty]}
              </span>
            </div>

            <div className="mt-5 flex items-start gap-4">
              <GameEmblem game={game} className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-100/85 text-outline">
                  {game.tags.slice(0, 2).join(" / ")}
                </p>
                <p
                  className={`mt-3 font-bold leading-tight text-white text-outline ${
                    isShowcase ? "text-2xl md:text-[2rem]" : "text-xl md:text-2xl"
                  }`}
                >
                  {game.name}
                </p>
                <p
                  className={`mt-2 max-w-xl font-semibold leading-relaxed text-slate-100 text-outline ${
                    isShowcase ? "text-sm md:text-base" : "text-sm"
                  }`}
                >
                  {presentation.hook}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 comic-panel border-2 border-black bg-slate-950/82 p-4">
          <p
            className="text-sm font-semibold leading-relaxed text-slate-100 text-outline"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {game.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
            <span className="rounded-full border border-white/12 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-100">
              {presentation.action}
            </span>
            {game.tags.slice(0, isShowcase ? 3 : 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/12 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 text-outline">
            {footerLabel ?? "Pret pour une manche express"}
          </span>
          <span
            className={`comic-button inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white text-outline transition-transform duration-200 ${game.iconBg}`}
          >
            {ctaLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
