"use client";

import { Fragment, useEffect, useId, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ceremonyStep } from "@/lib/classes/live-ceremony";
import type { LiveMedalist, LiveSession } from "@/lib/classes/live-shared";
import "./live-podium.css";

type PodiumProps = {
  session: LiveSession;
  people: LiveMedalist[];
  serverNow: number;
  now: number;
  projectionTarget?: HTMLElement | null;
  onResultsVisibleChange?: (visible: boolean) => void;
};

const podiumPlaces = [1, 2, 3] as const;
const awards = {
  1: { place: "1ʳᵉ place", spoken: "Première place", medal: "Médaille d’or" },
  2: { place: "2ᵉ place", spoken: "Deuxième place", medal: "Médaille d’argent" },
  3: { place: "3ᵉ place", spoken: "Troisième place", medal: "Médaille de bronze" },
} as const;

function pointsLabel(points: number, abbreviated = false) {
  return `${points} ${abbreviated ? "pt" : "point"}${points > 1 ? "s" : ""}`;
}

function breakableName(name: string) {
  const words = name.split(/(?<=[\p{Ll}\d])(?=\p{Lu})/u);
  return words.length === 1 ? name : words.map((word, index) => (
    <Fragment key={index}>{index > 0 && <wbr />}{word}</Fragment>
  ));
}

function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function hasReducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

type Playback = { mode: "auto" | "skip" } | { mode: "replay"; beganAt: number };

export function LivePodium(props: PodiumProps) {
  return <Ceremony key={props.session.id} {...props} />;
}

function Ceremony({ session, people, serverNow, now, projectionTarget, onResultsVisibleChange }: PodiumProps) {
  const id = useId();
  const reduced = useSyncExternalStore(subscribeToMotion, hasReducedMotion, () => true);
  const [playback, setPlayback] = useState<Playback>({ mode: "auto" });
  const [sample, setSample] = useState({ source: serverNow, at: serverNow, monotonic: 0 });
  const nowMs = Math.max(now, serverNow, sample.source === serverNow ? sample.at : 0);
  const groups = podiumPlaces.map((place) => ({
    place, winners: people.filter((person) => person.rank === place && person.points > 0),
  })).filter((group) => group.winners.length > 0);
  const ranks = groups.map((group) => group.place);
  const scheduled = ceremonyStep(session, nowMs, ranks);
  // Seul un relevé reçu après la clôture confirme les places, même si le téléphone est à l'heure.
  const settled = serverNow >= scheduled.startsAt;
  let presentationTime = settled ? nowMs : serverNow;
  if (settled && playback.mode === "skip") presentationTime = scheduled.endsAt;
  if (settled && playback.mode === "replay") {
    presentationTime = scheduled.startsAt + Math.max(0, sample.monotonic - playback.beganAt);
  }
  const state = ceremonyStep(session, presentationTime, ranks);
  const completed = state.phase === "complete";
  const noAwards = completed && state.revealed.length === 0;
  const active = settled && !completed;
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const received = Math.max(now, serverNow);
    const update = () => {
      const monotonic = performance.now();
      setSample({ source: serverNow, at: received + monotonic - start, monotonic });
    };
    const timer = setInterval(update, 125);
    document.addEventListener("visibilitychange", update);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, [active, now, serverNow]);
  useEffect(() => {
    onResultsVisibleChange?.(completed);
  }, [completed, onResultsVisibleChange]);

  const focus = groups.find((group) => group.place === state.spotlight);
  const award = focus ? awards[focus.place] : null;
  const names = focus?.winners.map((person) => person.name) ?? [];
  const sharedNames = names.join(" et ");
  const laureateTitle = names.length === 1 || (names.length === 2 && sharedNames.length <= 32) ? sharedNames : `${names.length} élèves ex æquo !`;
  const canceled = session.startsAt === null || (session.stoppedAt !== null && session.stoppedAt < session.startsAt);
  const title = state.phase === "settling" ? "Préparation du podium"
    : noAwards ? "Séance terminée"
    : state.phase === "intro" ? "Place au podium !"
    : focus ? laureateTitle : "Podium de la classe";
  const ribbon = award?.medal ?? (completed && !noAwards ? "Classement final" : "Remise des médailles");
  let caption = "";
  if (state.phase === "settling") caption = "Les dernières réponses de la classe arrivent.";
  else if (noAwards) caption = canceled ? "La salle a été fermée avant le départ." : "Aucun point marqué pendant cette séance.";
  else if (focus && names.length > 1) caption = `À égalité avec ${pointsLabel(focus.winners[0].points)}.`;

  function control() {
    if (completed) {
      onResultsVisibleChange?.(false);
      setPlayback({ mode: "replay", beganAt: performance.now() });
    } else {
      setPlayback({ mode: "skip" });
      onResultsVisibleChange?.(true);
    }
  }

  const stage = (
    <section
      className="eq-live-podium" aria-labelledby={id}
      data-phase={noAwards ? "empty" : state.phase}
      data-spotlight={state.spotlight ?? 0} data-projected={Boolean(projectionTarget)} data-motion={reduced ? "reduced" : "full"}
    >
      <div className="eq-live-podium-sky" aria-hidden="true">
        <div className="eq-live-podium-lights" /><div className="eq-live-podium-stars" />
        <div className="eq-live-podium-confetti">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>
      </div>
      <header className="eq-live-podium-head">
        <p className="eq-live-podium-ribbon">{ribbon}</p>
        <h2 id={id} className="eq-live-podium-title">{focus ? breakableName(title) : title}</h2>
        {caption && <p className="eq-live-podium-caption">{caption}</p>}
      </header>
      {settled && !noAwards && groups.length > 0 && (
        <ol className="eq-live-podium-steps" data-count={groups.length} aria-label="Médailles de la classe">
          {groups.map(({ place, winners }) => {
            const revealed = state.revealed.includes(place);
            const tied = revealed && winners.length > 1;
            return (
              <li key={place} className="eq-live-podium-step" value={place} data-rank={place}
                data-revealed={revealed} data-spotlight={state.spotlight === place}>
                <div className="eq-live-podium-beam" aria-hidden="true" />
                <div className="eq-live-podium-medal" aria-hidden="true"><span>{revealed ? place : "?"}</span></div>
                <div className="eq-live-podium-players" data-tied={tied}
                  tabIndex={revealed && winners.length > 3 ? 0 : undefined}
                  role={tied ? "group" : undefined} aria-label={tied ? `${winners.length} élèves ex æquo` : undefined}>
                  {revealed ? winners.map((person) => <b key={person.name} className="eq-live-podium-name">{breakableName(person.name)}</b>)
                    : <span className="eq-live-podium-mystery" aria-label="À découvrir">···</span>}
                </div>
                <div className="eq-live-podium-plinth">
                  <strong className="eq-live-podium-place">{awards[place].place}{tied && <small className="eq-live-podium-tie"> ex æquo</small>}</strong>
                  {revealed && <span className="eq-live-podium-points">{pointsLabel(winners[0].points, true)}</span>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {focus ? `${awards[focus.place].spoken}. ${names.join(", ")}. ${pointsLabel(focus.winners[0].points)}.`
          : state.phase === "settling" ? "Les résultats sont en cours de réception."
          : noAwards ? caption : completed ? "Le classement complet est disponible." : "La remise des médailles commence."}
      </p>
      {settled && !noAwards && (
        <div className="eq-live-podium-actions">
          <button type="button" className="eq-live-podium-control" onClick={control}>
            {completed ? "Revoir la remise" : "Passer la cérémonie"}
          </button>
        </div>
      )}
    </section>
  );
  return projectionTarget ? createPortal(stage, projectionTarget) : stage;
}
