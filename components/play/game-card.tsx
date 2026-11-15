import Image from "next/image";
import Link from "next/link";
import { GameEmblemIcon } from "@/components/ui/game-icons";
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
        <div className="flex items-center gap-3">
          <span
            className="eq-emblem"
            style={{ background: presentation.primary, color: "#141824" }}
            aria-hidden="true"
          >
            <GameEmblemIcon emblem={presentation.emblem} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="eq-h3 truncate">{game.name}</h3>
            <p className="text-xs font-bold text-[var(--muted)]">
              {presentation.skill} · {presentation.duration}
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">{presentation.hook}</p>
        {missionLabel ? <p className="eq-chip eq-chip-gold w-fit">{missionLabel}</p> : null}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`eq-surface eq-card-link group flex flex-col overflow-hidden ${
        highlighted ? "border-[var(--crimson)]" : ""
      }`}
      aria-label={`${game.name} : ${presentation.hook}`}
    >
      <div className="eq-game-poster" style={{ borderTop: `4px solid ${presentation.primary}` }}>
        {artSrc ? (
          <Image
            src={artSrc}
            alt={presentation.imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "linear-gradient(135deg, #141824 0%, #242b3d 100%)", color: presentation.primary }}
          >
            <GameEmblemIcon emblem={presentation.emblem} className="h-12 w-12" />
          </div>
        )}
        <span className="eq-game-poster-pill">{presentation.skill}</span>
        <span className="eq-game-poster-duration">{presentation.duration}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <span
            className="eq-emblem"
            style={{ background: presentation.primary, color: "#141824" }}
            aria-hidden="true"
          >
            <GameEmblemIcon emblem={presentation.emblem} className="h-5 w-5" />
          </span>
          <h3 className="eq-h3">{game.name}</h3>
        </div>
        <p className="text-sm text-[var(--muted)]">{presentation.hook}</p>
        {missionLabel ? <p className="eq-chip eq-chip-gold w-fit">{missionLabel}</p> : null}
        <span className="eq-btn eq-btn-ghost eq-btn-sm mt-auto w-fit">Jouer maintenant</span>
      </div>
    </Link>
  );
}
