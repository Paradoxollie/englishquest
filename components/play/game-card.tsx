import Image from "next/image";
import Link from "next/link";
import type { GameConfig } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";

type GameCardProps = {
  game: GameConfig;
  /** Carte compacte (sans image), pour les listes denses. */
  compact?: boolean;
  /** Texte de mission affiché sous le titre, par exemple un objectif de score. */
  missionLabel?: string | null;
  /** Met la carte en avant (bordure or). */
  highlighted?: boolean;
  /** Visuel 3:2 déjà vérifié côté serveur ; null = fond en dégradé. */
  artSrc?: string | null;
};

export function GameCard({ game, compact = false, missionLabel = null, highlighted = false, artSrc = null }: GameCardProps) {
  const presentation = getGamePresentation(game);
  const href = `/play/${game.slug}`;

  if (compact) {
    return (
      <Link
        href={href}
        className={`eq-card eq-card-link gap-3 ${highlighted ? "border-[var(--gold)]" : ""}`}
        aria-label={`${game.name} : ${presentation.hook}`}
      >
        <div className="flex items-center gap-3">
          <span className="eq-emblem" style={{ background: presentation.primary }} aria-hidden="true">
            {presentation.mark}
          </span>
          <div className="min-w-0">
            <h3 className="eq-h3 truncate">{game.name}</h3>
            <p className="text-xs font-bold" style={{ color: presentation.primary }}>
              {presentation.skill}
              <span className="eq-muted font-normal"> · {presentation.duration}</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">{presentation.hook}</p>
        {missionLabel ? <p className="eq-chip eq-chip-gold-soft w-fit">{missionLabel}</p> : null}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`eq-surface eq-card-link group overflow-hidden ${highlighted ? "border-[var(--gold)]" : ""}`}
      aria-label={`${game.name} : ${presentation.hook}`}
    >
      <div
        className="eq-game-card-art relative aspect-[3/2] w-full overflow-hidden"
        style={{ ["--game-accent" as string]: presentation.primary }}
      >
        {artSrc ? (
          <Image
            src={artSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="eq-game-card-mark" aria-hidden="true">
            {presentation.mark}
          </span>
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(14,21,38,0) 40%, rgba(14,21,38,0.92) 100%)" }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="eq-emblem" style={{ background: presentation.primary }} aria-hidden="true">
              {presentation.mark}
            </span>
            <div>
              <h3 className="eq-h3 text-[1.2rem]">{game.name}</h3>
              <p className="text-xs font-bold" style={{ color: presentation.primary }}>
                {presentation.skill}
              </p>
            </div>
          </div>
          <span className="eq-chip eq-chip-muted bg-[rgba(14,21,38,0.6)]">{presentation.duration}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-sm text-[var(--muted)]">{presentation.hook}</p>
        {missionLabel ? <p className="eq-chip eq-chip-gold-soft w-fit">{missionLabel}</p> : null}
        <span className="eq-btn eq-btn-ghost eq-btn-sm mt-auto w-fit">Jouer</span>
      </div>
    </Link>
  );
}
