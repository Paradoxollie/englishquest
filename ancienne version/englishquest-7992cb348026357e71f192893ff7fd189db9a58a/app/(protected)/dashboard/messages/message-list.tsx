"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { markMessageAsReadAction, deleteMessageAction, replyToMessageAction } from "./actions";
import { useRouter } from "next/navigation";

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

  // Filtrer les messages selon le filtre sélectionné
  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  // Sélectionner automatiquement le premier message non lu si aucun n'est sélectionné
  useEffect(() => {
    if (!selectedMessage && filteredMessages.length > 0) {
      const firstUnread = filteredMessages.find((m) => !m.read);
      if (firstUnread) {
        setSelectedMessage(firstUnread.id);
      } else {
        setSelectedMessage(filteredMessages[0].id);
      }
    }
  }, [filter, filteredMessages, selectedMessage]);

  if (messages.length === 0) {
    return (
      <div className="comic-panel-dark p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-xl font-bold text-slate-300 mb-2">Aucun message</p>
        <p className="text-sm text-slate-400 font-semibold">
          Les messages de contact apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Liste des messages */}
      <div className="lg:col-span-1">
        <div className="comic-panel-dark p-4">
          {/* En-tête avec compteurs et filtres */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Messages</h3>
              {unreadCount > 0 && (
                <span className="comic-panel bg-red-500 text-white px-3 py-1 text-xs font-bold border-2 border-black">
                  {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            
            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 comic-button text-xs px-3 py-2 font-bold transition ${
                  filter === "all"
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Tous ({messages.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`flex-1 comic-button text-xs px-3 py-2 font-bold transition ${
                  filter === "unread"
                    ? "bg-amber-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Non lus ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`flex-1 comic-button text-xs px-3 py-2 font-bold transition ${
                  filter === "read"
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Lus ({readCount})
              </button>
            </div>
          </div>

          {/* Liste des messages */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filteredMessages.length === 0 ? (
              <div className="comic-panel bg-slate-800/50 border-2 border-black p-6 text-center">
                <p className="text-sm text-slate-400 font-semibold">
                  Aucun message {filter === "unread" ? "non lu" : filter === "read" ? "lu" : ""}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message.id)}
                  className={`comic-panel w-full border-2 border-black p-4 text-left transition-all duration-200 font-bold hover:scale-[1.02] ${
                    selectedMessage === message.id
                      ? "bg-cyan-500 text-white shadow-lg ring-2 ring-cyan-300"
                      : message.read
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-amber-500 text-white hover:bg-amber-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm truncate">{message.subject}</span>
                        {!message.read && (
                          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full border-2 border-black bg-red-500 animate-pulse" />
                        )}
                        {message.reply && (
                          <span className="flex-shrink-0 text-xs bg-green-500 text-white px-2 py-0.5 rounded border border-black font-bold">
                            ✓ Répondu
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-90 truncate font-semibold mb-1">
                        👤 {message.name}
                      </p>
                      <p className="text-xs opacity-75 font-semibold">
                        📅 {new Date(message.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Détails du message */}
      <div className="lg:col-span-2">
        {selectedMessage ? (
          (() => {
            const message = messages.find((m) => m.id === selectedMessage);
            if (!message) return null;
            return (
              <div className="comic-panel-dark p-6 space-y-4">
                {/* En-tête du message */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-slate-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white">{message.subject}</h3>
                      {!message.read && (
                        <span className="comic-panel bg-red-500 text-white px-3 py-1 text-xs font-bold border-2 border-black animate-pulse">
                          NON LU
                        </span>
                      )}
                      {message.reply && (
                        <span className="comic-panel bg-green-500 text-white px-3 py-1 text-xs font-bold border-2 border-black">
                          ✓ RÉPONDU
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-slate-300 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">👤 De:</span>
                        <span>{message.name}</span>
                        {message.email && (
                          <span className="text-slate-400">({message.email})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">📅 Date:</span>
                        <span>
                          {new Date(message.created_at).toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!message.read && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="comic-button bg-green-500 text-white px-4 py-2 text-sm font-bold hover:bg-green-600 transition"
                      >
                        ✓ Marquer lu
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="comic-button bg-red-500 text-white px-4 py-2 text-sm font-bold hover:bg-red-600 transition"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>

                {/* Contenu du message */}
                <div className="comic-panel bg-slate-800/70 border-2 border-black p-5">
                  <p className="text-slate-200 whitespace-pre-wrap font-semibold leading-relaxed">
                    {message.message}
                  </p>
                </div>

                {/* Afficher la réponse si elle existe */}
                {message.reply && (
                  <div className="comic-panel bg-gradient-to-br from-green-950/40 to-green-900/20 border-2 border-green-500/60 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">💬</span>
                      <p className="text-sm font-bold text-green-300">Votre réponse :</p>
                    </div>
                    <div className="bg-slate-900/50 border-2 border-green-500/30 rounded-lg p-4 mb-3">
                      <p className="text-green-100 whitespace-pre-wrap font-semibold leading-relaxed">
                        {message.reply}
                      </p>
                    </div>
                    {message.replied_at && (
                      <p className="text-xs text-green-400 font-semibold">
                        ✓ Répondu le{" "}
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

                {/* Formulaire de réponse */}
                {!message.reply && (
                  <ReplyForm messageId={message.id} />
                )}
              </div>
            );
          })()
        ) : (
          <div className="comic-panel-dark p-12 text-center">
            <div className="text-6xl mb-4">📬</div>
            <p className="text-xl font-bold text-slate-300 mb-2">Sélectionnez un message</p>
            <p className="text-sm text-slate-400 font-semibold">
              Cliquez sur un message dans la liste pour voir son contenu
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

  // Rafraîchir après succès
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.refresh();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="comic-panel bg-gradient-to-br from-cyan-950/30 to-blue-900/20 border-2 border-cyan-500/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✉️</span>
        <label htmlFor="reply" className="text-lg font-bold text-cyan-300">
          Répondre au message
        </label>
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="messageId" value={messageId} />
        <div>
          <textarea
            id="reply"
            name="reply"
            required
            rows={8}
            className="comic-panel w-full border-2 border-black bg-slate-900 px-4 py-3 font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none resize-none transition"
            placeholder="Tapez votre réponse ici... L'utilisateur pourra la voir dans sa section messages."
          />
        </div>
        {state.error && (
          <div className="comic-panel border-2 border-black bg-red-500 text-white px-4 py-3 text-sm font-bold animate-pulse">
            ⚠️ {state.error}
          </div>
        )}
        {state.success && (
          <div className="comic-panel border-2 border-black bg-green-500 text-white px-4 py-3 text-sm font-bold">
            ✓ {state.success}
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
    <button
      type="submit"
      disabled={pending}
      className="comic-button bg-cyan-500 text-white px-8 py-3 font-bold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
    >
      {pending ? "⏳ Envoi en cours..." : "📤 Envoyer la réponse"}
    </button>
  );
}

