"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { markMessageAsReadAction, deleteMessageAction, replyToMessageAction } from "./actions";

type Message = {
  id: string;
  name: string;
  email: string | null;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  reply: string | null;
  replied_by: string | null;
  replied_at: string | null;
  created_at: string;
};

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages: initialMessages }: MessageListProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const handleMarkAsRead = async (messageId: string) => {
    const formData = new FormData();
    formData.append("messageId", messageId);
    await markMessageAsReadAction({}, formData);
    setMessages((msgs) =>
      msgs.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
    );
    router.refresh();
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return;
    }
    const formData = new FormData();
    formData.append("messageId", messageId);
    await deleteMessageAction({}, formData);
    setMessages((msgs) => msgs.filter((msg) => msg.id !== messageId));
    if (selectedMessage === messageId) {
      setSelectedMessage(null);
    }
    router.refresh();
  };

  const unreadCount = messages.filter((m) => !m.read).length;
  const readCount = messages.filter((m) => m.read).length;

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  useEffect(() => {
    if (!selectedMessage && filteredMessages.length > 0) {
      const firstUnread = filteredMessages.find((m) => !m.read);
      setSelectedMessage(firstUnread ? firstUnread.id : filteredMessages[0].id);
    }
  }, [filter, filteredMessages, selectedMessage]);

  if (messages.length === 0) {
    return (
      <div className="eq-card p-10 text-center">
        <p className="eq-h3">Aucun message</p>
        <p className="eq-muted mt-2 text-sm">
          Les messages de contact apparaîtront ici dès qu&apos;un utilisateur enverra un message.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="eq-card p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="eq-h3">Boîte de réception</h2>
              {unreadCount > 0 && (
                <span className="eq-chip eq-chip-coral">
                  {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`eq-btn eq-btn-sm flex-1 ${
                  filter === "all" ? "eq-btn-primary" : "eq-btn-ghost"
                }`}
              >
                Tous ({messages.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`eq-btn eq-btn-sm flex-1 ${
                  filter === "unread" ? "eq-btn-primary" : "eq-btn-ghost"
                }`}
              >
                Non lus ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("read")}
                className={`eq-btn eq-btn-sm flex-1 ${
                  filter === "read" ? "eq-btn-primary" : "eq-btn-ghost"
                }`}
              >
                Lus ({readCount})
              </button>
            </div>
          </div>

          <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
            {filteredMessages.length === 0 ? (
              <div className="eq-inset p-6 text-center">
                <p className="eq-muted text-sm font-medium">
                  Aucun message {filter === "unread" ? "non lu" : filter === "read" ? "lu" : ""}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const isSelected = selectedMessage === message.id;
                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => setSelectedMessage(message.id)}
                    className={`w-full rounded-[var(--pro-radius)] border p-3.5 text-left transition ${
                      isSelected
                        ? "border-[var(--pro-primary)] bg-[var(--pro-primary-soft)] shadow-[inset_3px_0_0_var(--pro-primary)]"
                        : !message.read
                          ? "border-[var(--pro-gold-edge)] bg-[var(--pro-gold-soft)]"
                          : "border-[var(--pro-border)] bg-[var(--pro-surface-2)] hover:border-[var(--pro-primary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="truncate text-sm font-bold">{message.subject}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {!message.read && (
                          <span
                            className="h-2.5 w-2.5 rounded-full bg-[var(--pro-error)]"
                            title="Non lu"
                          />
                        )}
                        {message.reply && (
                          <span className="eq-chip eq-chip-mint">Répondu</span>
                        )}
                      </div>
                    </div>
                    <p className="eq-muted truncate text-xs font-semibold mb-0.5">{message.name}</p>
                    <p className="eq-muted text-xs">
                      {new Date(message.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedMessage ? (
          (() => {
            const message = messages.find((m) => m.id === selectedMessage);
            if (!message) return null;
            return (
              <div className="eq-card p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--pro-border)] pb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                      <h2 className="eq-h2">{message.subject}</h2>
                      {!message.read && <span className="eq-chip eq-chip-coral">Non lu</span>}
                      {message.reply && <span className="eq-chip eq-chip-mint">Répondu</span>}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="eq-muted font-semibold">De : </span>
                        <b>{message.name}</b>
                        {message.email && <span className="eq-muted"> ({message.email})</span>}
                      </p>
                      <p className="eq-muted text-xs font-semibold">
                        Reçu le{" "}
                        {new Date(message.created_at).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!message.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(message.id)}
                        className="eq-btn eq-btn-mint eq-btn-sm"
                      >
                        Marquer lu
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(message.id)}
                      className="eq-btn eq-btn-danger eq-btn-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="eq-inset p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                </div>

                {message.reply && (
                  <div className="rounded-[var(--pro-radius)] border border-[var(--pro-success)] bg-[var(--pro-success-soft)] p-5 space-y-3">
                    <p className="text-sm font-bold text-[var(--pro-success)]">Votre réponse</p>
                    <div className="eq-card p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.reply}</p>
                    </div>
                    {message.replied_at && (
                      <p className="eq-muted text-xs font-semibold">
                        Répondu le{" "}
                        {new Date(message.replied_at).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}

                {!message.reply && <ReplyForm messageId={message.id} />}
              </div>
            );
          })()
        ) : (
          <div className="eq-card p-10 text-center">
            <p className="eq-h3">Sélectionnez un message</p>
            <p className="eq-muted mt-2 text-sm">
              Cliquez sur un message dans la liste pour afficher son contenu et répondre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyForm({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(replyToMessageAction, {});

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.refresh();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="eq-inset p-5">
      <label htmlFor="reply" className="block text-sm font-bold text-[var(--pro-primary)] mb-3">
        Répondre au message
      </label>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="messageId" value={messageId} />
        <textarea
          id="reply"
          name="reply"
          required
          rows={6}
          className="eq-input w-full px-4 py-3 text-sm resize-y"
          placeholder="Tapez votre réponse ici... L'utilisateur la verra dans son espace messages."
        />
        {state.error && (
          <div className="rounded-[var(--pro-radius)] border border-[var(--pro-error)] bg-[var(--pro-error-soft)] px-4 py-3 text-sm font-semibold text-[var(--pro-error)]">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-[var(--pro-radius)] border border-[var(--pro-success)] bg-[var(--pro-success-soft)] px-4 py-3 text-sm font-semibold text-[var(--pro-success)]">
            {state.success}
          </div>
        )}
        <SubmitReplyButton />
      </form>
    </div>
  );
}

function SubmitReplyButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="eq-btn eq-btn-primary w-full sm:w-auto">
      {pending ? "Envoi en cours…" : "Envoyer la réponse"}
    </button>
  );
}
