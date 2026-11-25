"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readLive, sendLive } from "@/lib/classes/live-client";
import { CEREMONY_SETTLE_MS } from "@/lib/classes/live-ceremony";
import { liveClock, type LiveSnapshot, type TeacherLiveSnapshot } from "@/lib/classes/live-shared";
import { LiveProjectionStandings, LiveRoundProgram, LiveTeacherResults, LiveTeacherStage } from "./live-teacher-board";
import { sessionDate } from "./live-round-catalog";
import { LiveTeacherPlanner } from "./live-teacher-planner";

type TeacherProps = { classId: string; className: string; archived: boolean; joinAddress: string; firstName: boolean };
type TeacherCommand = Parameters<typeof sendLive>[1];

function useTeacherSession(classId: string, selected: string | null) {
  const [view, setView] = useState<{ data: TeacherLiveSnapshot; selected: string | null } | null>(null);
  const [now, setNow] = useState(0);
  const [readError, setReadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const generation = useRef(0);
  const currentRead = useRef<AbortController | null>(null);
  const requestRefresh = useRef<(() => void) | null>(null);
  const sending = useRef(false);
  const timeAnchor = useRef({ server: 0, client: 0 });
  const takeSnapshot = useCallback((data: LiveSnapshot, selection: string | null, requestedAt: number) => {
    if (!data.teacher) {
      setView(null);
      setReadError("Cet espace est réservé au professeur de la classe.");
      return;
    }
    const receivedAt = performance.now();
    const estimatedNow = data.serverNow + Math.min(1000, (receivedAt - requestedAt) / 2);
    timeAnchor.current = { server: estimatedNow, client: receivedAt };
    setNow(estimatedNow);
    setView({ data, selected: selection });
    setReadError("");
  }, []);

  useEffect(() => {
    const stamp = ++generation.current;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let reading = false;
    function planNext(snapshot?: LiveSnapshot) {
      if (!active || stamp !== generation.current || document.hidden) return;
      let delay = 6500;
      if (snapshot) {
        if (!snapshot.teacher) return;
        const clock = liveClock(snapshot.session, snapshot.serverNow);
        const end = snapshot.session?.stoppedAt ?? snapshot.session?.endsAt;
        const settling = end != null && snapshot.serverNow < end + 12000;
        if (clock.phase === "finished" && selected && !settling) return;
        delay = clock.phase === "idle" || (clock.phase === "finished" && !settling) ? 30000 : 4500;
        if (clock.phase === "finished" && end != null && snapshot.serverNow < end + CEREMONY_SETTLE_MS) {
          delay = Math.min(delay, end + CEREMONY_SETTLE_MS + 150 - snapshot.serverNow);
        }
      }
      timer = setTimeout(refresh, delay);
    }
    async function refresh() {
      clearTimeout(timer);
      if (!active || document.hidden || reading || sending.current || stamp !== generation.current) return;
      reading = true;
      const controller = new AbortController();
      currentRead.current = controller;
      let timedOut = false;
      const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 12000);
      const requestedAt = performance.now();
      let snapshot: LiveSnapshot | undefined;
      let denied = false;
      try {
        snapshot = await readLive(classId, selected ?? undefined, controller.signal);
        if (stamp === generation.current && !controller.signal.aborted) takeSnapshot(snapshot, selected, requestedAt);
      } catch (e) {
        if (stamp === generation.current && (!controller.signal.aborted || timedOut)) {
          const status = e instanceof Error && "status" in e ? e.status : null;
          denied = status === 401 || status === 403 || status === 404;
          if (denied) setView(null);
          setReadError(timedOut ? "La connexion est lente. Nouvelle tentative en cours." : e instanceof Error ? e.message : "Connexion interrompue.");
        }
      } finally {
        clearTimeout(timeout);
        reading = false;
        if (currentRead.current === controller) currentRead.current = null;
        if ((!controller.signal.aborted || timedOut) && !denied) planNext(snapshot);
      }
    }
    requestRefresh.current = refresh;
    void refresh();
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);
    return () => {
      active = false;
      requestRefresh.current = null;
      clearTimeout(timer);
      currentRead.current?.abort();
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [classId, selected, reload, takeSnapshot]);

  const data = view?.selected === selected ? view.data : null;
  const clock = liveClock(data?.session ?? null, now);
  useEffect(() => {
    if (!data?.session) return;
    const observed = liveClock(data.session, data.serverNow);
    if (observed.phase !== clock.phase || observed.index !== clock.index) requestRefresh.current?.();
  }, [data, clock.phase, clock.index]);
  useEffect(() => {
    if (clock.phase !== "countdown" && clock.phase !== "round") return;
    const tick = setInterval(() => {
      const anchor = timeAnchor.current;
      setNow(anchor.server + performance.now() - anchor.client);
    }, 250);
    return () => clearInterval(tick);
  }, [clock.phase]);

  async function change(command: TeacherCommand) {
    if (sending.current) return false;
    sending.current = true;
    setBusy(true);
    setActionError("");
    ++generation.current;
    currentRead.current?.abort();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const requestedAt = performance.now();
    try {
      const data = await sendLive(classId, command, { signal: controller.signal });
      takeSnapshot(data, null, requestedAt);
      return true;
    } catch (e) {
      if (controller.signal.aborted) {
        setReadError("La réponse tarde. Vérification de la séance en cours.");
      } else {
        const status = e instanceof Error && "status" in e ? e.status : null;
        if (status === 401 || status === 403 || status === 404) setView(null);
        setActionError(e instanceof Error ? e.message : "L’action n’a pas abouti. Vous pouvez réessayer.");
      }
      return false;
    } finally {
      clearTimeout(timeout);
      sending.current = false;
      setBusy(false);
      setReload((previous) => previous + 1);
    }
  }
  return { data, clock, now, error: actionError || readError, busy, change, retry: () => {
    setActionError("");
    setReload((previous) => previous + 1);
  } };
}

export function LiveTeacher({ classId, className, archived, joinAddress, firstName }: TeacherProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [projecting, setProjecting] = useState(false);
  const [podiumTarget, setPodiumTarget] = useState<HTMLDivElement | null>(null);
  const [resultsVisibleFor, setResultsVisibleFor] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const { data, clock, now, error, busy, change, retry } = useTeacherSession(classId, selected);
  const session = data?.session ?? null;
  const sessionId = session?.id ?? null;
  const showResults = useCallback((visible: boolean) => setResultsVisibleFor(visible ? sessionId : null), [sessionId]);
  const finished = clock.phase === "finished";
  const planning = data && !archived && !selected && (!session || (finished && preparing));

  async function act(command: TeacherCommand) {
    if (await change(command)) {
      setPreparing(false);
      setSelected(null);
      setConfirmEnd(false);
    }
  }

  function project() {
    if (!dialog.current) return;
    dialog.current.showModal();
    setProjecting(true);
    if (dialog.current.requestFullscreen) void dialog.current.requestFullscreen().catch(() => {});
  }

  function leaveProjection() {
    if (document.fullscreenElement === dialog.current) void document.exitFullscreen().catch(() => {});
    dialog.current?.close();
    setProjecting(false);
  }

  function chooseSession(value: string | null) {
    setSelected(value);
    setPreparing(false);
    setConfirmEnd(false);
  }

  return (
    <>
      {error && (
        <p className="eq-class-feedback is-error live-teacher-network" role="alert">
          {error} <button type="button" disabled={busy} onClick={retry}>Actualiser</button>
        </p>
      )}
      {selected && <button type="button" className="live-teacher-text-action" onClick={() => chooseSession(null)}>Revenir à la séance actuelle</button>}
      {!data && !error && <p role="status" className="live-teacher-empty">Chargement de la séance…</p>}
      {archived && data && !session && <p className="live-teacher-empty">Cette classe est archivée. Ses séances précédentes restent consultables ci-dessous.</p>}
      {planning && (
        <>
          {session && <button className="live-teacher-text-action" type="button" onClick={() => setPreparing(false)}>Revoir le dernier podium</button>}
          <LiveTeacherPlanner busy={busy} onPrepare={(rounds) => void act({ action: "prepare", rounds })} />
        </>
      )}
      {data && session && !planning && (
        <>
          <article className="live-teacher-stage">
            <div className="live-teacher-stage-head">
              <p>{finished ? "Séance terminée" : clock.phase === "lobby" ? "Salle d’attente" : "En direct"} · {className}</p>
              <button className="live-teacher-project" type="button" onClick={project}>Projeter</button>
            </div>
            <LiveTeacherStage snapshot={data} session={session} clock={clock} now={now} firstName={firstName}
              joinAddress={joinAddress} projectionTarget={projecting ? podiumTarget : null} onResultsVisibleChange={showResults} />
            <div className="live-teacher-stage-controls">
              {!selected && !archived && clock.phase === "lobby" && (
                <button className="eq-btn eq-btn-gold" type="button" disabled={busy} onClick={() => void act({ action: "start", sessionId: session.id })}>Donner le départ</button>
              )}
              {!selected && !archived && finished && resultsVisibleFor === session.id && !projecting && (
                <button className="eq-btn eq-btn-gold" type="button" disabled={busy} onClick={() => setPreparing(true)}>Préparer une nouvelle séance</button>
              )}
              {!selected && !archived && !finished && !confirmEnd && (
                <button className="live-teacher-project" type="button" disabled={busy} onClick={() => setConfirmEnd(true)}>{clock.phase === "lobby" ? "Fermer la salle" : "Terminer avant la fin"}</button>
              )}
              {!selected && !finished && confirmEnd && (
                <div className="live-teacher-confirm" role="group" aria-label="Confirmer la fin de séance">
                  <span>{clock.phase === "lobby" ? "Fermer cette salle d’attente ?" : "Interrompre les manches restantes et afficher le podium ?"}</span>
                  <button type="button" className="eq-btn eq-btn-gold eq-btn-sm" disabled={busy} onClick={() => void act({ action: "stop", sessionId: session.id })}>Oui, terminer</button>
                  <button type="button" className="live-teacher-project" disabled={busy} onClick={() => setConfirmEnd(false)}>Annuler</button>
                </div>
              )}
            </div>
          </article>
          <LiveRoundProgram session={session} clock={clock} />
          {clock.phase !== "lobby" && (!finished || (resultsVisibleFor === session.id && !projecting)) && (
            <LiveTeacherResults snapshot={data} session={session} clock={clock} now={now} />
          )}
          <dialog ref={dialog} className="live-teacher-projector" aria-label={`Projection de la séance de ${className}`} onClose={leaveProjection}>
            {projecting && <>
              <div className="live-teacher-stage-head">
                <p>{className} · English Quest</p>
                <button type="button" className="live-teacher-project" onClick={leaveProjection}>Quitter la projection</button>
              </div>
              {finished ? <div ref={setPodiumTarget} /> : (
                <LiveTeacherStage snapshot={data} session={session} clock={clock} now={now} joinAddress={joinAddress} firstName={firstName} />
              )}
              {clock.phase === "round" && <LiveProjectionStandings people={data.people} />}
              {clock.phase === "lobby" && !selected && !archived && <button type="button" className="eq-btn eq-btn-gold" disabled={busy} onClick={() => void act({ action: "start", sessionId: session.id })}>Donner le départ</button>}
              {error && <p role="alert" className="live-teacher-projection-error">{error}</p>}
            </>}
          </dialog>
        </>
      )}
      {data && data.history.length > 0 && (
        <section className="live-teacher-panel live-teacher-history">
          <h2 className="eq-h3">Historique des séances en direct</h2>
          <p className="eq-muted">Le bilan par manche est consultable pendant dix jours après la fin de chaque séance.</p>
          <ul>{data.history.map((item) => (
            <li key={item.id}>
              <div><b>{sessionDate(item.startsAt ?? item.createdAt)}</b><small>{item.roundCount} manche{item.roundCount > 1 ? "s" : ""}</small></div>
              {item.id === session?.id && !planning ? <span>À l’écran</span> : (
                <button type="button" disabled={busy} className="live-teacher-text-action" onClick={() => chooseSession(item.id)}>Voir les résultats</button>
              )}
            </li>
          ))}</ul>
        </section>
      )}
    </>
  );
}
