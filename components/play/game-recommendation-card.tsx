import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { difficultyColors, type GameConfig } from "@/lib/games/config";

type GameRecommendationCardProps = {
  game: GameConfig;
  href?: string;
  badgeLabel?: string;
  ctaLabel?: string;
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
}: GameRecommendationCardProps) {
  return (
    <Link
      href={href}
      className="group comic-card-dark flex h-full flex-col p-4 md:p-5"
      style={{ background: game.gradient }}
    >
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`rounded-2xl border-2 border-black/80 ${game.iconBg} p-3 shadow-[0_6px_16px_rgba(0,0,0,0.28)]`}>
              <span className="text-2xl leading-none">{game.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white text-outline md:text-lg">
                {game.name}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200/90">
                {game.tags.slice(0, 2).join(" / ")}
              </p>
            </div>
          </div>

          {badgeLabel && (
            <span className="shrink-0 rounded-full border border-black/50 bg-emerald-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              {badgeLabel}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border border-black/50 px-3 py-1 text-[11px] font-bold text-white ${difficultyColors[game.difficulty]}`}
          >
            {difficultyLabels[game.difficulty]}
          </span>
          {game.tags.slice(2, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/12 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex justify-end border-t border-white/10 pt-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition-transform duration-200 group-hover:translate-x-1">
            {ctaLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
