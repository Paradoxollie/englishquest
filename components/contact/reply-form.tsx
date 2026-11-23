"use client";

import { useActionState, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReplyResult } from "@/lib/contact/conversation";

type Props = {
  messageId: string;
  receipt?: string;
  send: (form: FormData) => Promise<ReplyResult>;
  onSaved?: () => Promise<void>;
};

export function ContactReplyForm({ messageId, receipt, send, onSaved }: Props) {
  const label = useId();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const attempt = useRef<{ body: string; id: string } | null>(null);
  const [result, submit, pending] = useActionState(async (_previous: ReplyResult, form: FormData) => {
    const body = String(form.get("reply") ?? "");
    if (!attempt.current || attempt.current.body !== body) attempt.current = { body, id: crypto.randomUUID() };
    form.set("requestId", attempt.current.id);
    try {
      const response = await send(form);
      if (response.success) {
        setDraft("");
        attempt.current = null;
        if (onSaved) await onSaved();
        else router.refresh();
      }
      return response;
    } catch {
      return { error: "La connexion a été interrompue. Tu peux réessayer." };
    }
  }, {});

  return (
    <form action={submit} className="grid gap-3">
      <input type="hidden" name="messageId" value={messageId} />
      {receipt && <input type="hidden" name="receipt" value={receipt} />}
      <label htmlFor={label} className="text-sm font-bold">Ajouter une réponse</label>
      <textarea id={label} name="reply" className="eq-input w-full" rows={3} maxLength={3000} required
        value={draft} onChange={event => setDraft(event.target.value)} readOnly={pending} />
      {result.error && <p role="alert" className="text-sm font-semibold">{result.error}</p>}
      {result.success && <p role="status" className="text-sm font-semibold">{result.success}</p>}
      <button type="submit" className="eq-btn eq-btn-primary justify-self-start" disabled={pending || !draft.trim()}>
        {pending ? "Enregistrement…" : "Publier dans cet échange"}
      </button>
    </form>
  );
}
