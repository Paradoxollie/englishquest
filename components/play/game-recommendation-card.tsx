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
  priority?: boolean;
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
  priority = false,
}: GameRecommendationCardProps) {
  const presentation = getGamePresentation(game);
  const isShowcase = variant === "showcase";

  return (
    <Link
      href={href}
      className={`group comic-card-dark flex h-full min-w-0 flex-col overflow-hidden bg-slate-950 ${className}`}
    >
      <div className={`relative border-b-4 border-black ${isShowcase ? "min-h-[310px]" : "min-h-[250px]"}`}>
        <GameCardArtwork game={game} priority={priority} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
        <div className="absolute inset-0 comic-dot-pattern-light opacity-25" />
        <div
          className="absolute inset-y-0 left-0 w-2"
          style={{
            background: `linear-gradient(180deg, ${presentation.secondary} 0%, ${presentation.primary} 100%)`,
          }}
        />

        <div className="relative z-10 flex min-h-[250px] flex-col justify-between p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {badgeLabel && (
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200 text-outline">
                  {badgeLabel}
                </p>
              )}
              <span
                className="mt-2 inline-flex max-w-full rounded-full border-2 border-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white text-outline"
                style={{
                  background: `linear-gradient(90deg, ${presentation.primary}cc 0%, rgba(2, 6, 23, 0.88) 100%)`,
                }}
              >
                {presentation.mode}
              </span>
            </div>

            <span
              className={`shrink-0 rounded-full border-2 border-black px-3 py-1 text-[11px] font-bold text-white text-outline ${difficultyColors[game.difficulty]}`}
            >
              {difficultyLabels[game.difficulty]}
            </span>
          </div>

          <div className="flex items-end gap-4">
            <GameEmblem game={game} priority={priority} className={isShowcase ? "h-24 w-24 md:h-28 md:w-28" : "h-20 w-20"} />
            <div className="min-w-0 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-100/80 text-outline">
                {presentation.action}
              </p>
              <h3
                className={`mt-2 font-bold leading-tight text-white text-outline ${
                  isShowcase ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                }`}
              >
                {game.name}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <p className="text-sm font-semibold leading-relaxed text-slate-100 text-outline md:text-base">
          {presentation.hook}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{game.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {game.tags.slice(0, isShowcase ? 3 : 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 text-outline">
            {footerLabel ?? "Pret pour une manche express"}
          </span>
          <span
            className={`comic-button inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white text-outline ${game.iconBg}`}
          >
            {ctaLabel}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
