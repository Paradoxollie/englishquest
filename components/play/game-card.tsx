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
  /** Priorité d'affichage sur les premières cartes visibles. */
  priority?: boolean;
};

export function GameCard({
  game,
  compact = false,
  missionLabel = null,
  highlighted = false,
  artSrc = null,
  priority = false,
}: GameCardProps) {
  const presentation = getGamePresentation(game);
  const href = `/play/${game.slug}`;

  if (compact) {
    return (
      <Link
        href={href}
        className={`eq-card eq-card-link gap-3 p-4 ${highlighted ? "border-[var(--crimson)]" : ""}`}
        aria-label={`${game.name} : ${presentation.hook}`}
      >
        <div className="min-w-0">
          <h3 className="eq-h3">{game.name}</h3>
          <p className="text-xs font-bold text-[var(--muted)]">
            {presentation.skill} · {presentation.duration}
          </p>
        </div>
        <p className="text-sm text-[var(--muted)]">{presentation.hook}</p>
        {missionLabel ? <p className="eq-chip eq-chip-gold w-fit">{missionLabel}</p> : null}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`eq-game-card eq-card-link ${highlighted ? "is-highlighted" : ""}`}
      aria-label={`${game.name} : ${presentation.hook}`}
    >
      <span className="eq-game-skill" aria-hidden="true">
        {presentation.skill}
      </span>
      <div className="eq-game-poster">
        {artSrc ? (
          <Image
            src={artSrc}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="eq-game-poster-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="eq-game-card-body">
        <h3 className="eq-h3">{game.name}</h3>
        <p className="text-sm text-[var(--muted)]">{presentation.hook}</p>
        {missionLabel ? <p className="eq-chip eq-chip-gold w-fit">{missionLabel}</p> : null}
      </div>
    </Link>
  );
}
