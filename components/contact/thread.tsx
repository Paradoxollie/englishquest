import { contactDate, repliesInOrder, type ContactThread } from "@/lib/contact/conversation";

export function ContactHistory({ thread, staff = false }: { thread: ContactThread; staff?: boolean }) {
  const entries = [{ id: "original", author: "sender", body: thread.message, created_at: thread.created_at }, ...repliesInOrder(thread)];
  return (
    <ol className="grid gap-3" aria-label="Historique de l’échange">
      {entries.map(entry => (
        <li key={entry.id} className={entry.author === "team" ? "eq-inset border-l-4 border-l-[var(--pro-success)] p-4" : "eq-inset p-4"}>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
            <strong className="text-sm">{entry.author === "team" ? "Équipe English Quest" : staff ? "Message reçu" : "Ton message"}</strong>
            <time dateTime={entry.created_at} className="eq-muted text-xs">{contactDate(entry.created_at)}</time>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{entry.body}</p>
        </li>
      ))}
    </ol>
  );
}
