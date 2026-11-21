"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readLive, sendLive } from "@/lib/classes/live-client";
import { liveClock, type LiveProgress, type LiveSession, type LiveSnapshot } from "@/lib/classes/live-shared";
import { mergeProgress, progressKey, readStoredRound, writeStoredRound, type StoredRound } from "./live-player-progress";

type ConnectionIssue = { text: string; status?: number };
type ClockAnchor = { server: number; elapsed: number; wall: number };
const GRACE_MS = 8_000;

function serverTime(anchor: ClockAnchor) {
  const elapsed = performance.now() - anchor.elapsed;
  const wall = Date.now() - anchor.wall;
  // On platforms that suspend the monotonic clock during device sleep, the round must still end.
  return anchor.server + (wall > elapsed + 4_000 ? wall : elapsed);
}

function roundEnd(session: LiveSession, index: number) {
  const end = (session.startsAt ?? 0) + session.rounds.slice(0, index + 1).reduce((ms, round) => ms + round.durationSeconds * 1000, 0);
  return Math.min(end, session.stoppedAt ?? Infinity);
}

export function usePlayerConnection(classId: string, playerId: string) {
  const [snapshot, setSnapshot] = useState<LiveSnapshot | null>(null);
  const [now, setNow] = useState(0);
  const [issue, setIssue] = useState<ConnectionIssue | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const controls = useRef<{
    record: (sessionId: string, index: number, value: LiveProgress) => void;
    refresh: () => void;
  } | null>(null);

  useEffect(() => {
    let active = true;
    let requestPending = false;
    let readNext = false;
    let urgent = false;
    let denied = false;
    let current: LiveSnapshot | null = null;
    let timer: ReturnType<typeof setTimeout>;
    let requestController: AbortController | null = null;
    let anchor: ClockAnchor = { server: Date.now(), elapsed: performance.now(), wall: Date.now() };
    let lastSecond = -1;
    let lastPhase = "";
    const slots = new Map<string, StoredRound>();

    function slot(session: LiveSession, index: number) {
      const key = progressKey(playerId, session.id, index);
      const stored = slots.get(key) ?? readStoredRound(key);
      slots.set(key, stored);
      return stored;
    }
    function store(sessionId: string, index: number, stored: StoredRound) {
      const key = progressKey(playerId, sessionId, index);
      slots.set(key, stored);
      writeStoredRound(key, stored);
    }
    function schedule(delay: number) {
      clearTimeout(timer);
      if (active && !denied && !document.hidden) timer = setTimeout(() => void sync(), delay);
    }
    function wake() {
      if (requestPending) urgent = true;
      else schedule(0);
    }

    function record(sessionId: string, index: number, value: LiveProgress) {
      const session = current?.session;
      if (!session || session.id !== sessionId) return;
      const clock = liveClock(session, serverTime(anchor));
      if (clock.phase !== "round" || clock.index !== index) return;
      const previous = slot(session, index);
      const progress = mergeProgress(previous.progress, value, session.rounds[index]);
      if (JSON.stringify(previous.progress) !== JSON.stringify(progress)) {
        store(session.id, index, { progress, pending: true });
      }
    }

    function applySnapshot(next: LiveSnapshot, started: number) {
      if (next.classId !== classId || next.teacher) {
        throw Object.assign(new Error("Cette page est réservée aux élèves de la classe."), { status: 403 });
      }
      const arrived = performance.now();
      anchor = { server: next.serverNow + Math.min(1_000, (arrived - started) / 2), elapsed: arrived, wall: Date.now() };
      if (current?.session?.id !== next.session?.id) setUnconfirmed(false);
      const session = next.session;
      const self = next.self;
      // A keepalive request can succeed during navigation without the old page seeing its receipt.
      if (session && self?.roundIndex != null && session.rounds[self.roundIndex]) {
        const stored = slot(session, self.roundIndex);
        const { progress } = stored;
        const received = new Set(self.answers?.map((answer) => answer.id));
        if (stored.pending && self.score >= progress.score && self.answered >= progress.answered &&
            self.correct >= progress.correct && (progress.answers ?? []).every((answer) => received.has(answer.id))) {
          store(session.id, self.roundIndex, { progress, pending: false });
        }
      }
      current = next;
      setSnapshot(next);
      setNow(serverTime(anchor));
      setIssue(null);
    }

    async function sync() {
      if (!active || denied || requestPending) return;
      if (!navigator.onLine) {
        setIssue({ text: "Connexion interrompue. La séance se resynchronisera au retour du réseau." });
        schedule(8_000);
        return;
      }
      requestPending = true;
      const session = current?.session;
      const at = serverTime(anchor);
      const clock = liveClock(session ?? null, at);
      const started = performance.now();
      const controller = new AbortController();
      requestController = controller;
      const requestTimeout = setTimeout(() => controller.abort(), 9_000);
      let sent: { sessionId: string; index: number; entry: StoredRound } | null = null;
      let polling = 6_000;
      let usedRead = false;
      let hasMoreToSend = false;
      try {
        let next: LiveSnapshot;
        if (session && !readNext && session.startsAt !== null) {
          for (let index = 0; index < session.rounds.length; index++) {
            const entry = slot(session, index);
            if (!entry.pending) continue;
            if (at > roundEnd(session, index) + GRACE_MS) {
              store(session.id, index, { ...entry, pending: false });
              setUnconfirmed(true);
              continue;
            }
            if (!sent) sent = { sessionId: session.id, index, entry };
            else hasMoreToSend = true;
          }
        }
        if (session && !readNext && (sent || clock.phase !== "finished")) {
          next = await sendLive(classId, {
            action: "pulse", sessionId: session.id,
            ...(sent ? { roundIndex: sent.index, progress: sent.entry.progress } :
              clock.phase === "round" ? { roundIndex: clock.index } : {}),
          }, { signal: controller.signal });
        } else {
          readNext = false;
          usedRead = true;
          next = await readLive(classId, undefined, controller.signal);
        }
        if (!active) return;
        if (sent && session && slot(session, sent.index) === sent.entry) {
          store(session.id, sent.index, { ...sent.entry, pending: false });
        }
        const newSession = Boolean(next.session && current?.session?.id !== next.session.id);
        applySnapshot(next, started);
        const nextClock = liveClock(next.session, serverTime(anchor));
        if (newSession && nextClock.phase !== "finished") urgent = true;
        if (!newSession && hasMoreToSend) urgent = true;
        if (nextClock.phase === "lobby" || nextClock.phase === "countdown") polling = 4_500;
        if (nextClock.phase === "finished") {
          const endedAt = next.session?.stoppedAt ?? next.session?.endsAt ?? at;
          polling = at - endedAt < 12_000 ? 3_000 : 15_000;
          if (next.serverNow < endedAt + GRACE_MS) polling = Math.min(polling, endedAt + GRACE_MS + 150 - next.serverNow);
        }
      } catch (error) {
        if (!active) return;
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403 || (usedRead && status === 404)) {
          denied = true;
          current = null;
          setSnapshot(null);
          setIssue({ status, text: status === 401 ? "Reconnecte-toi pour retrouver ta séance." : "Cette classe est indisponible pour ton compte." });
        } else if (!usedRead && status && [400, 404, 409, 410, 422].includes(status)) {
          if (sent && session && slot(session, sent.index) === sent.entry) {
            store(sent.sessionId, sent.index, { ...sent.entry, pending: false });
            setUnconfirmed(true);
          }
          readNext = true;
          urgent = true;
        } else {
          setIssue({ text: "La connexion est lente. Nouvelle tentative en cours." });
          polling = status === 429 ? 10_000 : 4_000;
        }
      } finally {
        clearTimeout(requestTimeout);
        requestPending = false;
        requestController = null;
        if (active && !denied) {
          schedule(urgent ? 100 : polling);
          urgent = false;
        }
      }
    }

    function tick() {
      if (!current || denied) return;
      const at = serverTime(anchor);
      const clock = liveClock(current.session, at);
      const boundary = `${current.session?.id ?? ""}/${clock.phase}/${clock.index}`;
      const second = clock.endsAt === null ? 0 : Math.ceil((clock.endsAt - at) / 1000);
      if (second !== lastSecond || lastPhase !== boundary) {
        lastSecond = second;
        setNow(at);
      }
      if (lastPhase && lastPhase !== boundary) wake();
      lastPhase = boundary;
    }
    function onVisibility() {
      if (document.hidden) {
        clearTimeout(timer);
        flushOnExit();
        return;
      }
      tick();
      wake();
    }
    function flushOnExit() {
      const session = current?.session;
      if (!session || denied || !navigator.onLine) return;
      const at = serverTime(anchor);
      for (let index = 0; index < session.rounds.length; index++) {
        const entry = slot(session, index);
        if (entry.pending && at <= roundEnd(session, index) + GRACE_MS) {
          void sendLive(classId, { action: "pulse", sessionId: session.id, roundIndex: index, progress: entry.progress }, { keepalive: true }).catch(() => {});
        }
      }
    }
    function onOffline() {
      setIssue({ text: "Connexion interrompue. La séance se resynchronisera au retour du réseau." });
    }
    controls.current = { record, refresh: wake };
    const timerClock = setInterval(tick, 250);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", wake);
    window.addEventListener("offline", onOffline);
    window.addEventListener("pagehide", flushOnExit);
    // Defer the first request so a React Strict Mode setup/cleanup pair never starts two requests.
    schedule(0);
    return () => {
      flushOnExit();
      active = false;
      controls.current = null;
      requestController?.abort();
      clearTimeout(timer);
      clearInterval(timerClock);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", wake);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("pagehide", flushOnExit);
    };
  }, [classId, playerId]);

  const record = useCallback((sessionId: string, index: number, progress: LiveProgress) => {
    controls.current?.record(sessionId, index, progress);
  }, []);
  const refresh = useCallback(() => controls.current?.refresh(), []);
  return { snapshot, now, issue, unconfirmed, record, refresh };
}
