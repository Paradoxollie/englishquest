import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { GameConfig } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";
import { resolveArt } from "@/lib/art-server";
import type { GameMissionInfo } from "@/lib/courses/mission-for-game";

type GameShellProps = {
  game: GameConfig;
  mission: GameMissionInfo | null;
  isLoggedIn: boolean;
  /** Colonne latérale : classement, meilleur score, règles. */
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * Cadre commun des jeux : en-tête avec emblème et image, rappel de la
 * mission en cours, zone de jeu, colonne latérale. Composant serveur ;
 * le jeu lui-même est un composant client passé en enfant.
 */
export function GameShell({ game, mission, isLoggedIn, aside, children }: GameShellProps) {
  const presentation = getGamePresentation(game);
  const art = resolveArt(presentation.artworkSrc);

  return (
    <div className="eq-game" style={{ ["--game-accent" as string]: presentation.primary }}>
      <header className={`eq-game-head ${art ? "has-art" : ""}`}>
        {art ? (
          <div className="eq-game-head-art" aria-hidden="true">
            <Image src={art} alt="" fill sizes="100vw" priority className="object-cover" />
          </div>
        ) : null}
        <div className="eq-container eq-game-head-body">
          <Link href="/play" className="eq-game-back">
            Tous les jeux
          </Link>
          <div className="eq-game-title-row">
            <span className="eq-emblem eq-emblem-lg" style={{ background: presentation.primary }} aria-hidden="true">
              {presentation.mark}
            </span>
            <div>
              <h1 className="eq-game-title">{game.name}</h1>
              <p className="eq-game-sub">
                <span style={{ color: presentation.primary }}>{presentation.skill}</span>
                <span className="eq-muted"> · {presentation.duration} · </span>
                <span className="eq-muted">{presentation.hook}</span>
              </p>
            </div>
          </div>
          {mission ? (
            <div className="eq-game-mission" role="status">
              <span className="eq-chip eq-chip-gold">Mission {mission.courseId}</span>
              <span className="eq-game-mission-text">
                Une question sur trois porte sur <b>{mission.courseTitle}</b>. C&apos;est le quiz du cours, à 80 %,
                qui valide la mission et rapporte + {mission.rewardXp} XP, + {mission.rewardGold} or.
              </span>
              <Link href={`/cours/${mission.courseId}`} className="eq-btn eq-btn-ghost eq-btn-sm">
                Ouvrir le cours
              </Link>
            </div>
          ) : !isLoggedIn ? (
            <p className="eq-game-guest">
              Tu joues sans compte : le score ne sera pas enregistré.{" "}
              <Link href="/auth/signup" className="font-bold text-[var(--cyan)]">
                Créer un compte
              </Link>
            </p>
          ) : null}
        </div>
      </header>

      <div className={`eq-container eq-game-grid ${aside ? "" : "eq-game-grid-solo"}`}>
        <div className="eq-game-main">{children}</div>
        {aside ? <aside className="eq-game-aside">{aside}</aside> : null}
      </div>
    </div>
  );
}
