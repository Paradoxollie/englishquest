"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { stopAllGameAudio } from "@/lib/games/audio";
import { isGameSessionSlug } from "@/lib/games/game-session-rules";
import { ClassActivityContext } from "./live-activity-context";
import { LIVE_ACTIVITY_CHANNEL, observeClassAnswers, type LiveActivityProgress } from "./live-activity-events";

export function LiveActivityBridge({ path, children }: { path: string; children: ReactNode }) {
  const [activity, setActivity] = useState<React.ContextType<typeof ClassActivityContext>>(null);
  const activeKey = useRef<string | null>(null);
  useEffect(() => {
    if (window.parent === window) return;
    const parent = window.parent;
    const origin = window.location.origin;
    const courseId = path.startsWith("cours/") ? Number(path.slice(6)) : undefined;
    let progress: LiveActivityProgress = { answered: 0, correct: 0, score: 0 };
    const post = (type: string, detail: Record<string, unknown> = {}) =>
      parent.postMessage({ channel: LIVE_ACTIVITY_CHANNEL, type, path, runKey: activeKey.current, ...detail }, origin);
    let disposed = false;
    let retry: number | undefined;
    function ready() {
      if (disposed) return;
      post("ready");
      retry = window.setInterval(() => post("ready"), 800);
    }
    function activate(event: MessageEvent) {
      if (event.source !== parent || event.origin !== origin) return;
      const message = event.data;
      if (message?.channel !== LIVE_ACTIVITY_CHANNEL || message.path !== path || typeof message.runKey !== "string") return;
      if (message.type === "hold") {
        clearInterval(retry);
        if (activeKey.current) {
          activeKey.current = null;
          stopAllGameAudio();
          setActivity(null);
        }
        return;
      }
      if (message.type !== "activate") return;
      if (activeKey.current !== message.runKey) {
        activeKey.current = message.runKey;
        progress = { ...message.progress };
        setActivity({ runKey: message.runKey, initialAnswers: progress.answers ?? [] });
      }
      clearInterval(retry);
      post("started");
    }
    const stopObserving = observeClassAnswers((right, answer) => {
      if (!activeKey.current) return;
      let answers = progress.answers;
      if (courseId !== undefined) {
        if (!answer || answers?.some((previous) => previous.id === answer.id)) return;
        answers = [...(answers ?? []), answer];
      }
      const correct = progress.correct + Number(right);
      progress = { score: correct * 100, answered: progress.answered + 1, correct,
        ...(courseId !== undefined && { courseId, answers }) };
      post("progress", { progress });
    });
    window.addEventListener("message", activate);
    window.addEventListener("pagehide", stopAllGameAudio);
    const slug = path.startsWith("jeu/") ? path.slice(4) : "";
    if (isGameSessionSlug(slug)) {
      import("./live-activity-game").then(module => module.prepareLiveGame(slug)).then(ready)
        .catch(() => { if (!disposed) post("unavailable"); });
    } else ready();
    return () => {
      disposed = true;
      clearInterval(retry);
      activeKey.current = null;
      stopObserving();
      stopAllGameAudio();
      window.removeEventListener("message", activate);
      window.removeEventListener("pagehide", stopAllGameAudio);
    };
  }, [path]);

  if (!activity) return <p role="status" className="eq-live-preparing">Préparation de l’activité…</p>;
  return <ClassActivityContext.Provider value={activity}>{children}</ClassActivityContext.Provider>;
}
