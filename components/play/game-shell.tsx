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
            <div className="eq-game-mission" role="status">
              <span className="eq-chip eq-chip-gold">Mission {mission.courseId}</span>
              <span className="eq-game-mission-text">
                {mission.alreadyReached ? (
                  <>
                    Défi validé pour <b>{mission.courseTitle}</b> : continue pour améliorer ton record.
                  </>
                ) : mission.quizPassed ? (
                  <>
                    Mission <b>{mission.courseTitle}</b> : {mission.challengeLabel} À la clé : +{mission.rewardXp} XP,
                    +{mission.rewardGold} or.
                  </>
                ) : (
                  <>
                    Mission <b>{mission.courseTitle}</b> : réussis d&apos;abord le quiz du cours à 80 %. Ensuite :{" "}
                    {mission.challengeLabel} À la clé : +{mission.rewardXp} XP, +{mission.rewardGold} or.
                  </>
                )}
              </span>
              <Link href={`/cours/${mission.courseId}`} className="eq-btn eq-btn-ghost eq-btn-sm">
                Ouvrir le cours
              </Link>
            </div>
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
