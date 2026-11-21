"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveRound } from "@/lib/classes/live-shared";
import { getGameBySlug } from "@/lib/games/config";
import { getCourseById } from "@/lib/courses/data";
import { LIVE_ACTIVITY_CHANNEL, type LiveActivityProgress } from "./live-activity-events";

export function activityFramePath(round: LiveRound) {
  return round.kind === "game" ? `/activite-classe/jeu/${round.slug}` : `/activite-classe/cours/${round.courseId}`;
}

export function LiveActivity(props: {
  round: LiveRound;
  runKey: string;
  active?: boolean;
  initialProgress?: LiveActivityProgress | null;
  onProgress: (progress: LiveActivityProgress) => void;
}) {
  return <ActivityFrame key={props.runKey} {...props} />;
}

function ActivityFrame({ round, runKey, active = true, initialProgress, onProgress }: Parameters<typeof LiveActivity>[0]) {
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef<LiveActivityProgress>(initialProgress ?? { answered: 0, correct: 0, score: 0 });
  const onProgressRef = useRef(onProgress);
  const ready = useRef(false);
  const canPlay = useRef(active);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
  const path = round.kind === "game" ? `jeu/${round.slug}` : `cours/${round.courseId}`;
  const title = round.kind === "game" ? getGameBySlug(round.slug)?.name : getCourseById(round.courseId)?.title;
  const signal = useCallback(() => {
    if (!ready.current) return;
    frame.current?.contentWindow?.postMessage({
      channel: LIVE_ACTIVITY_CHANNEL, type: canPlay.current ? "activate" : "hold",
      path, runKey, progress: latest.current,
    }, window.location.origin);
  }, [path, runKey]);
  useEffect(() => {
    if (!canPlay.current && initialProgress && initialProgress.answered >= latest.current.answered) latest.current = initialProgress;
  }, [initialProgress]);
  useEffect(() => {
    canPlay.current = active;
    signal();
  }, [active, signal]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSlow(true), 9000);
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const message = event.data;
      if (message?.channel !== LIVE_ACTIVITY_CHANNEL || message.path !== path) return;
      if (message.type === "unavailable") { setSlow(true); return; }
      if (message.type === "ready") {
        ready.current = true;
        clearTimeout(timeout);
        setSlow(false);
        signal();
        return;
      }
      if (message.runKey !== runKey || !canPlay.current) return;
      if (message.type === "started" || message.type === "progress") {
        clearTimeout(timeout);
        setSlow(false);
      }
      if (message.type === "progress") {
        const next: LiveActivityProgress = message.progress;
        if (!next || !Number.isSafeInteger(next.answered) || !Number.isSafeInteger(next.correct)
          || next.correct < latest.current.correct || next.answered < latest.current.answered
          || next.correct > next.answered || next.score !== next.correct * 100) return;
        latest.current = next;
        onProgressRef.current(next);
      }
    }
    window.addEventListener("message", receive);
    return () => {
      ready.current = false;
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
    };
  }, [path, runKey, attempt, signal]);

  return <div className="eq-live-activity">
    {slow && <div className="eq-inset eq-live-load" role="status">
      <span>Le chargement prend du temps.</span>
      <button type="button" className="eq-btn eq-btn-ghost" onClick={() => { setSlow(false); setAttempt((n) => n + 1); }}>
        Recharger l’activité
      </button>
    </div>}
    <iframe key={attempt} ref={frame} src={activityFramePath(round)} title={title ?? "Activité de la classe"}
      allow="autoplay" referrerPolicy="no-referrer" className="eq-live-activity-frame"
      style={{ display: "block", width: "100%", height: "var(--eq-live-frame-height, clamp(340px, 76dvh, 860px))", border: 0 }} />
  </div>;
}
