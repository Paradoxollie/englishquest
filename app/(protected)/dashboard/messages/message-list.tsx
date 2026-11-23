"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contactDate, type ContactThread } from "@/lib/contact/conversation";
import { ContactHistory } from "@/components/contact/thread";
import { ContactReplyForm } from "@/components/contact/reply-form";
import { ReceiptLink } from "@/components/contact/receipt-link";
import { markMessageAsReadAction, deleteMessageAction, getGuestReceipt, replyToMessageAction } from "./actions";

export type AdminContact = ContactThread & {
  name: string; email: string | null; user_id: string | null; read: boolean; guest_receipt_issued: boolean;
};

function GuestAccess({ message }: { message: AdminContact }) {
  const [path, setPath] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function openLink() {
    setPending(true);
    try {
      const result = await getGuestReceipt(message.id);
      setPath(result.path ?? "");
      setError(result.error ?? "");
    } catch { setError("Le lien est momentanément indisponible."); }
    finally { setPending(false); }
  }
  return <div className="eq-inset grid gap-2 p-4">
    <strong className="text-sm">{message.guest_receipt_issued ? "Suivi sans compte" : "Lien privé à transmettre"}</strong>
    <p className="eq-muted text-sm">{message.guest_receipt_issued
      ? "Un lien privé a été remis pour cet échange. La personne peut y retrouver tes réponses."
      : "Cette personne a écrit avant la mise en place du suivi. Pour qu’elle puisse lire les réponses, transmets-lui ce lien en privé."}</p>
    {path ? <ReceiptLink path={path} /> : <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm justify-self-start"
      disabled={pending} onClick={openLink}>Afficher le lien privé</button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}

export function MessageList({ messages, initialId }: { messages: AdminContact[]; initialId?: string }) {
  const router = useRouter();
  const [selected, select] = useState(initialId);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const unread = messages.filter(m => !m.read).length;
  const filtered = messages.filter(m => filter === "all" || (filter === "read" ? m.read : !m.read));
  const current = filtered.find(m => m.id === selected) ?? filtered.find(m => !m.read) ?? filtered[0];

  async function manage(messageId: string, remove: boolean) {
    if (remove && !window.confirm("Supprimer cet échange et toutes ses réponses ?")) return;
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("messageId", messageId);
    try {
      const result = remove ? await deleteMessageAction({}, form) : await markMessageAsReadAction({}, form);
      if (result.error) setError(result.error);
      else router.refresh();
    } catch { setError("L’opération a échoué. Réessaie dans un instant."); }
    finally { setBusy(false); }
  }

  return <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
    <section className="eq-card min-w-0 self-start p-4">
      <h2 className="eq-h3 mb-3">Boîte de réception</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {([["all", "Tous", messages.length], ["unread", "Non lus", unread], ["read", "Lus", messages.length - unread]] as const).map(([id, title, count]) =>
          <button key={id} type="button" aria-pressed={filter === id} className={`eq-btn eq-btn-sm ${filter === id ? "eq-btn-primary" : "eq-btn-ghost"}`}
            onClick={() => setFilter(id)}>{title} ({count})</button>)}
      </div>
      <div className="grid max-h-80 gap-2 overflow-y-auto lg:max-h-[600px]">
        {filtered.map(m => <button key={m.id} type="button" aria-pressed={current?.id === m.id}
          onClick={() => { select(m.id); setError(""); }}
          className={`grid min-w-0 gap-1 rounded-[var(--pro-radius)] border p-3 text-left ${current?.id === m.id ? "border-[var(--pro-primary)] bg-[var(--pro-primary-soft)]" : "border-[var(--pro-border)]"}`}>
          <strong className="truncate text-sm">{m.subject}</strong>
          <span className="eq-muted text-xs">{m.name} · {m.read ? "Lu" : "Non lu"}{m.replied ? " · Répondu" : ""}</span>
          <time className="eq-muted text-xs" dateTime={m.created_at}>{contactDate(m.created_at)}</time>
        </button>)}
        {!filtered.length && <p className="eq-muted p-2">Aucun message dans cette vue.</p>}
      </div>
    </section>
    {current && <section key={current.id} className="eq-card grid min-w-0 content-start gap-5 p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="eq-h2 break-words">{current.subject}</h2>
          <p className="eq-muted mt-2 break-words text-sm">De {current.name}{current.email && ` (${current.email})`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!current.read && <button type="button" disabled={busy} className="eq-btn eq-btn-mint eq-btn-sm" onClick={() => manage(current.id, false)}>Marquer lu</button>}
          <button type="button" disabled={busy} className="eq-btn eq-btn-danger eq-btn-sm" onClick={() => manage(current.id, true)}>Supprimer</button>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {current.user_id ? <p className="eq-muted text-sm">Les réponses apparaissent dans « Mes messages » sur le compte de cette personne.</p>
        : <GuestAccess message={current} />}
      <ContactHistory thread={current} staff />
      {current.replied && <p className="eq-muted text-sm">{current.reply_acknowledged_at
        ? "Lecture confirmée le " + contactDate(current.reply_acknowledged_at) + "."
        : "La lecture de la dernière réponse reste à confirmer."}</p>}
      <ContactReplyForm messageId={current.id} send={replyToMessageAction} />
    </section>}
  </div>;
}
