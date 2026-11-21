"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useState } from "react";
import { liveClock, type LivePerson, type LiveProgress, type LiveRound, type LiveSession, type LiveSnapshot } from "@/lib/classes/live-shared";
import { activityFramePath, LiveActivity } from "./live-activity";
import { usePlayerConnection } from "./live-player-connection";
import { EMPTY_PROGRESS, mergeProgress, progressKey, readStoredRound } from "./live-player-progress";
import { describeRound, durationLabel } from "./live-round-catalog";
import { LivePodium } from "./live-podium";

function displayClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function rankLabel(rank: number) {
  return rank === 1 ? "1er" : `${rank}e`;
}

function WaitingRoom({ snapshot, countdown }: { snapshot: LiveSnapshot; countdown: number | null }) {
  const rounds = snapshot.session?.rounds ?? [];
  const first = rounds[0] ? describeRound(rounds[0]) : null;
  const title = countdown === null ? "Salle d’attente" : "Prépare-toi";
  return (
    <div className="eq-live-wait">
      <section className="eq-player-welcome">
        <div className="eq-player-welcome-text">
          <span className="eq-player-eyebrow">{snapshot.className}</span>
          <h1>{title}</h1>
          {countdown === null ? (
            <p role="status">
              {snapshot.session
                ? "Tu es en place. La première manche s’ouvrira ici quand ton professeur donnera le départ."
                : "Garde cette page ouverte. La séance apparaîtra ici dès que ton professeur la préparera."}
            </p>
          ) : (
            <>
              <p>{first?.title}</p>
              <div className="eq-player-countdown" role="timer" aria-label={`Départ dans ${countdown} secondes`} aria-live="off">
                {countdown}<small>s</small>
              </div>
            </>
          )}
        </div>
        <Image
          className="eq-player-welcome-art" src={first?.image ?? "/art/bd/couverture-heros.jpg"} alt=""
          width={640} height={350} priority sizes="(max-width: 600px) 94vw, 420px"
        />
      </section>
      {rounds.length > 0 ? (
        <section className="eq-player-programme" aria-labelledby="player-programme-title">
          <h2 id="player-programme-title">Au programme</h2>
          <ol>
            {rounds.map((round, index) => (
              <li key={index}>
                <span className="eq-player-order" aria-hidden="true">{index + 1}</span>
                <span>{describeRound(round).title}</span>
                <time dateTime={`PT${round.durationSeconds}S`}>{durationLabel(round.durationSeconds)}</time>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <Link className="eq-text-link eq-player-back" href="/home">Retour à mes devoirs</Link>
    </div>
  );
}

function RoundReport({ self, session }: { self: LivePerson; session: LiveSession }) {
  if (!self.results?.length) return null;
  return (
    <details className="eq-player-details">
      <summary>Mes résultats par manche</summary>
      <ul>
        {self.results.filter((result) => session.rounds[result.index]).map((result) => (
          <li key={result.index}>
            <span>{describeRound(session.rounds[result.index]).title}</span>
            <small>{result.correct} bonne{result.correct > 1 ? "s" : ""} réponse{result.correct > 1 ? "s" : ""} sur {result.answered}</small>
            <strong>{result.points} pts</strong>
          </li>
        ))}
      </ul>
    </details>
  );
}

function PlayerPodium({ snapshot, now }: { snapshot: LiveSnapshot; now: number }) {
  const [showResults, setShowResults] = useState(false);
  const self = snapshot.self;
  if (!snapshot.session) return null;
  return (
    <section className="eq-player-finish">
      <span className="eq-player-eyebrow">{snapshot.className}</span>
      <h1 className="sr-only">Podium de la séance</h1>
      <LivePodium session={snapshot.session} people={snapshot.people} serverNow={snapshot.serverNow} now={now} onResultsVisibleChange={setShowResults} />
      {showResults && self ? (
        <div className="eq-player-personal">
          <h2>Mon résultat</h2>
          <p><strong>{self.points} point{self.points > 1 ? "s" : ""}</strong>{self.rank ? ` · ${rankLabel(self.rank)} du classement` : ""}</p>
          <p>{self.roundsPlayed} manche{self.roundsPlayed > 1 ? "s" : ""} jouée{self.roundsPlayed > 1 ? "s" : ""} sur {snapshot.session.rounds.length}</p>
          <RoundReport self={self} session={snapshot.session} />
        </div>
      ) : null}
      {showResults ? <p className="eq-muted">La prochaine séance de cette classe s’ouvrira ici automatiquement.</p> : null}
      <Link href="/home" className="eq-btn eq-btn-gold">Retour à mon accueil</Link>
    </section>
  );
}

type RecordProgress = (sessionId: string, index: number, progress: LiveProgress) => void;

const PlayerRound = memo(function PlayerRound({ round, index, sessionId, playerId, self, record, active }: {
  round: LiveRound; index: number; sessionId: string; playerId: string; self: LivePerson | null; record: RecordProgress; active: boolean;
}) {
  const runKey = `${sessionId}:${index}`;
  // Seed once per round. A heartbeat updates standings but must never restart the game.
  const [initialProgress] = useState(() => {
    const fromServer = self?.roundIndex === index ? self : EMPTY_PROGRESS;
    return mergeProgress(fromServer, readStoredRound(progressKey(playerId, sessionId, index)).progress, round);
  });
  const onProgress = useCallback((value: LiveProgress) => record(sessionId, index, value), [record, sessionId, index]);
  return <LiveActivity round={round} runKey={runKey} initialProgress={initialProgress} onProgress={onProgress} active={active} />;
});

export function LivePlayer({ classId, playerId }: { classId: string; playerId: string }) {
  const { snapshot, now, issue, unconfirmed, record, refresh } = usePlayerConnection(classId, playerId);
  if (!snapshot) {
    return (
      <section className="eq-live-player eq-player-unavailable">
        <h1>Séance en direct</h1>
        <p role={issue ? "alert" : "status"}>{issue?.text ?? "Ouverture de la séance…"}</p>
        {issue?.status === 401 ? (
          <Link className="eq-btn eq-btn-gold" href={`/auth/login?next=${encodeURIComponent(`/direct/${classId}`)}`}>Me reconnecter</Link>
        ) : issue?.status ? (
          <Link className="eq-btn eq-btn-gold" href="/rejoindre">Entrer mon code de classe</Link>
        ) : issue ? <button type="button" className="eq-btn eq-btn-ghost" onClick={refresh}>Réessayer</button> : null}
      </section>
    );
  }
  const { session } = snapshot;
  const clock = liveClock(session, now);
  const stageIndex = clock.phase === "lobby" || clock.phase === "countdown" ? 0 : clock.index;
  const round = session?.rounds[stageIndex];
  const seconds = Math.max(0, Math.ceil(((clock.endsAt ?? now) - now) / 1000));
  const playing = Boolean(clock.phase === "round" && round && session);
  const boundaryKey = `${session?.id ?? ""}:${stageIndex}`;
  const prefetchRound = clock.phase === "round" ? session?.rounds[clock.index + 1] : null;
  return (
    <div className={`eq-live-player${playing ? " is-playing" : ""}`}>
      <p className="sr-only" role="status" aria-atomic="true">
        {playing && round && session ? `Manche ${clock.index + 1} sur ${session.rounds.length}. ${describeRound(round).title}. ${durationLabel(round.durationSeconds)}.` : ""}
      </p>
      {prefetchRound ? <link rel="prefetch" as="document" href={activityFramePath(prefetchRound)} /> : null}
      {issue ? <p className="eq-player-warning" role="status">{issue.text}</p> : null}
      {unconfirmed ? <p className="eq-player-warning" role="status">Certains points hors ligne n’ont pas pu être confirmés.</p> : null}
      {clock.phase === "finished" ? (
        <PlayerPodium key={session?.id} snapshot={snapshot} now={now} />
      ) : clock.phase === "round" && round && session ? (
        <header className="eq-player-round-head">
            <div>
              <p className="eq-player-eyebrow">{snapshot.className} · Manche {clock.index + 1} / {session.rounds.length}</p>
              <h1>{describeRound(round).title}</h1>
            </div>
            <div className="eq-player-clock" role="timer" aria-label={`Temps restant ${durationLabel(seconds)}`} aria-live="off">
              {displayClock(seconds)}
            </div>
            <progress max={round.durationSeconds} value={seconds} aria-label="Temps restant dans la manche" />
        </header>
      ) : (
        <WaitingRoom snapshot={snapshot} countdown={clock.phase === "countdown" ? seconds : null} />
      )}
      {round && session ? (
        <div className="eq-player-stage" hidden={!playing}>
          <PlayerRound key={boundaryKey} round={round} index={stageIndex} sessionId={session.id} playerId={playerId} self={snapshot.self} record={record} active={playing} />
        </div>
      ) : null}
      {playing ? <Link href="/home" className="eq-text-link eq-player-back">Quitter le direct</Link> : null}
    </div>
  );
}
