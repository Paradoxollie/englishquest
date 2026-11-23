"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ContactHistory } from "@/components/contact/thread";
import { ContactReplyForm } from "@/components/contact/reply-form";
import { contactDate, type ContactThread } from "@/lib/contact/conversation";
import { confirmGuestRead, fetchGuestConversation, replyFromGuest } from "./actions";
import { ConfirmReading } from "@/components/contact/confirm-reading";

export function GuestConversation() {
  const [thread, setThread] = useState<ContactThread | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const revision = useRef(0);
  const activeToken = useRef("");
  const refresh = useCallback(async () => {
    const request = ++revision.current;
    const current = window.location.hash.slice(1);
    if (activeToken.current !== current) {
      activeToken.current = current;
      setThread(null);
    }
    setToken(current);
    setBusy(true);
    setError("");
    try {
      const next = current ? await fetchGuestConversation(current) : null;
      if (request !== revision.current) return;
      setThread(next);
      if (!next) setError("Ce lien est incomplet ou cet échange a été supprimé. Ouvre le lien privé qui t’a été remis.");
    } catch {
      if (request === revision.current) setError("Le suivi est momentanément indisponible. Réessaie dans un instant.");
    } finally {
      if (request === revision.current) setBusy(false);
    }
  }, []);
  useEffect(() => {
    function onVisible() { if (document.visibilityState === "visible") void refresh(); }
    void refresh();
    window.addEventListener("hashchange", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ++revision.current;
      window.removeEventListener("hashchange", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return <section className="eq-card mx-auto grid max-w-2xl gap-4 p-5" aria-busy={busy}>
    {error && <p role="alert">{error}</p>}
    {busy && !thread && <p role="status">Ouverture de ton échange…</p>}
    {thread && <>
      <h2 className="eq-h2 break-words">{thread.subject}</h2>
      <ContactHistory thread={thread} />
      {thread.reply_acknowledged_at && <p className="eq-muted text-sm">Tu as confirmé ta lecture le {contactDate(thread.reply_acknowledged_at)}.</p>}
      {thread.replied && thread.reply_notice && <ConfirmReading reference={token} notice={thread.reply_notice} confirm={confirmGuestRead} onSaved={refresh} />}
      {!thread.reply && !thread.contact_followups.some(entry => entry.author === "team") &&
        <p className="eq-muted text-sm">Ta demande est arrivée. La réponse de l’équipe apparaîtra ici.</p>}
      <ContactReplyForm key={thread.id} messageId={thread.id} receipt={token} send={replyFromGuest} onSaved={refresh} />
    </>}
    <div className="flex flex-wrap gap-2">
      {token && <button type="button" className="eq-btn eq-btn-ghost" disabled={busy} onClick={refresh}>Actualiser les réponses</button>}
      {!thread && !busy && <Link href="/contact" className="eq-btn eq-btn-ghost">Aller à la page Contact</Link>}
    </div>
  </section>;
}
