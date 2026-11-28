"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { joinClass } from "@/lib/classes/classes-server";
import { readLive } from "@/lib/classes/live-client";
import { liveClock } from "@/lib/classes/live-shared";
import { ActionFeedback, useClassAction } from "./use-class-action";

type JoinClassFormProps = {
  initialCode?: string;
  /** Liens affichés après l'inscription (page /rejoindre). */
  showNextSteps?: boolean;
  studentLive?: boolean;
};

export function JoinClassForm({ initialCode = "", showNextSteps = false, studentLive = true }: JoinClassFormProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const liveLookup = useRef<AbortController | null>(null);
  const { pending, result, run } = useClassAction("La connexion a échoué. Réessaie.");
  useEffect(() => () => liveLookup.current?.abort(), []);

  return (
    <form
      className="eq-class-form eq-class-join-form"
      onSubmit={(event) => {
        event.preventDefault();
        run(
          () => joinClass(code),
          (response) => {
            setCode("");
            const classId = response.data?.classId;
            setJoinedId(classId ?? null);
            if (!classId || !studentLive) return;
            const destination = `/direct/${classId}`;
            // The same code is also used for homework outside a live session.
            const controller = new AbortController();
            liveLookup.current = controller;
            void readLive(classId, undefined, controller.signal).then((state) => {
              if (!controller.signal.aborted && state.session && liveClock(state.session, state.serverNow).phase !== "finished") router.push(destination);
            }).catch(() => {});
          }
        );
      }}
    >
      <label className="eq-class-field">
        <span>Code de la classe</span>
        <div className="eq-class-join-row">
          <input
            type="text"
            name="code"
            value={code}
            onChange={(event) => {
              liveLookup.current?.abort();
              setCode(event.target.value.toUpperCase());
              setJoinedId(null);
            }}
            maxLength={9}
            disabled={pending}
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            placeholder="6 caractères"
            className="eq-class-input eq-class-code-input"
          />
          <button type="submit" className="eq-btn eq-btn-primary" disabled={pending || code.trim().length === 0}>
            {pending ? "Un instant…" : "Rejoindre"}
          </button>
        </div>
      </label>
      <p className="eq-muted text-sm">Une fois la classe rejointe, ton professeur pourra consulter tes activités enregistrées, tes scores et tes essais de quiz à partir de ton entrée.</p>
      <ActionFeedback result={result} />
      {joinedId ? (
        <div className="eq-home-actions">
          {showNextSteps ? <Link href="/home" className="eq-btn eq-btn-gold">Voir mes devoirs</Link> : null}
          {studentLive ? <Link href={`/direct/${joinedId}`} prefetch={false} className="eq-btn eq-btn-ghost">Attendre une séance en direct</Link> : null}
        </div>
      ) : null}
    </form>
  );
}
