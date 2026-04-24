import Image from "next/image";
import type { GameConfig } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";

type GameGraphicProps = {
  game: Pick<GameConfig, "slug" | "name">;
  className?: string;
  priority?: boolean;
};

export function GameEmblem({ game, className = "", priority = false }: GameGraphicProps) {
  const presentation = getGamePresentation(game);

  return (
    <div className={`relative aspect-square shrink-0 ${className}`}>
      <Image
        src={presentation.logoSrc}
        alt={`Logo ${game.name}`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 88px, 112px"
        className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]"
      />
    </div>
  );
}

export function GameCardArtwork({ game, className = "", priority = false }: GameGraphicProps) {
  const presentation = getGamePresentation(game);
  const hasPositionClass = /\b(absolute|relative|fixed|sticky)\b/.test(className);
  const positionClassName = hasPositionClass ? className : `relative ${className}`;

  return (
    <div className={`overflow-hidden ${positionClassName}`}>
      <Image
        src={presentation.artworkSrc}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
