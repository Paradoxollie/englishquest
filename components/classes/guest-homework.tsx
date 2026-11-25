"use client";

import { useRef, useState } from "react";
import { saveGuestHomework } from "@/app/(public)/rejoindre/actions";
import type { LiveProgress } from "@/lib/classes/live-shared";
import { LiveActivity } from "./live-activity";

export function GuestHomework({ assignment, course, initial }: { assignment: string; course: number; initial: LiveProgress }) {
  const latest = useRef(initial);
  const [status, setStatus] = useState("");
  async function save(progress: LiveProgress) {
    latest.current = progress;
    setStatus("Enregistrement en cours…");
    const saved = await saveGuestHomework(assignment, course, progress.answers ?? []).catch(() => false);
    if (latest.current === progress) setStatus(saved ? "Réponses enregistrées pour ton professeur." : "Échec de l’enregistrement.");
  }
  return <>
    <LiveActivity round={{ kind: "course", courseId: course, durationSeconds: 0 }} runKey={assignment}
      initialProgress={initial} onProgress={progress => void save(progress)} />
    <p role="status" className="text-sm">{status}</p>
    {status === "Échec de l’enregistrement." && <button className="eq-btn eq-btn-ghost" onClick={() => void save(latest.current)}>Réessayer</button>}
  </>;
}
