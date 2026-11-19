import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { GameConfig } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";
import { ResponsiveDetails } from "@/components/ui/responsive-details";
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
 * Cadre commun des jeux : en-tête avec titre et vignette, rappel de la
 * mission en cours, zone de jeu, colonne latérale. Composant serveur ;
 * le jeu lui-même est un composant client passé en enfant.
 */
export function GameShell({ game, mission, isLoggedIn, aside, children }: GameShellProps) {
  const presentation = getGamePresentation(game);
  const art = resolveArt(presentation.artworkSrc);

  return (
    <div className="eq-game" style={{ ["--game-accent" as string]: presentation.primary }}>
      <header className="eq-game-head">
        <div className="eq-container eq-game-head-body">
          <Link href="/play" className="eq-game-back">
            Tous les jeux
          </Link>
          <div className="eq-game-title-row">
            <div>
              <h1 className="eq-game-title">{game.name}</h1>
              <p className="eq-game-sub">
                <b>{presentation.skill}</b>
                <span className="eq-muted"> · {presentation.duration} · {presentation.hook}</span>
              </p>
            </div>
            {art ? (
              <div className="eq-game-head-vignette" aria-hidden="true">
                <Image src={art} alt="" fill sizes="220px" priority className="object-cover" />
              </div>
            ) : null}
          </div>
          {mission ? (
            <ResponsiveDetails summary={`Suivi de la mission ${mission.courseId}`} className="eq-mission-details">
              <div className="eq-game-mission">
                <span className="eq-chip eq-chip-gold">Mission {mission.courseId}</span>
                <span className="eq-game-mission-text">
                  <b>{mission.courseTitle}</b>.{" "}
                  {mission.quizPassed ? "Quiz réussi." : `Lis le cours et réussis son quiz à 80 % pour gagner ${mission.rewardXp} XP et ${mission.rewardGold} pièces d’or.`}
                  {mission.alreadyReached ? " Ton objectif de jeu est atteint." : null}
                </span>
                <Link href={`/cours/${mission.courseId}`} className="eq-btn eq-btn-ghost eq-btn-sm">
                  Ouvrir le cours
                </Link>
              </div>
            </ResponsiveDetails>
          ) : !isLoggedIn ? (
            <p className="eq-game-guest">
              Tu joues sans compte : le score ne sera pas enregistré.{" "}
              <Link href="/auth/signup" className="eq-text-link">
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
