"use client";

import { useState, useEffect } from "react";
import { useActionState, useFormStatus } from "react";
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

  if (messages.length === 0) {
    return (
      <div className="comic-panel-dark p-8 text-center text-slate-400 font-semibold">
        Aucun message pour le moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Liste des messages */}
      <div className="lg:col-span-1">
        <div className="comic-panel-dark p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Messages ({unreadCount > 0 && (
                <span className="text-red-300 font-bold">{unreadCount} non lus</span>
              )})
            </h3>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message.id)}
                className={`comic-panel w-full border-2 border-black p-3 text-left transition font-bold ${
                  selectedMessage === message.id
                    ? "bg-cyan-500 text-white"
                    : message.read
                    ? "bg-slate-800 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold truncate">{message.subject}</span>
                      {!message.read && (
                        <span className="flex-shrink-0 w-3 h-3 rounded-full border-2 border-black bg-red-500" />
                      )}
                    </div>
                    <p className="text-xs opacity-90 truncate font-semibold">{message.name}</p>
                    <p className="text-xs opacity-75">
                      {new Date(message.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
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
              <div className="comic-panel-dark p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{message.subject}</h3>
                    <div className="space-y-1 text-sm text-slate-300 font-semibold">
                      <p>
                        <span className="font-bold">De:</span> {message.name} ({message.email})
                      </p>
                      <p>
                        <span className="font-bold">Date:</span>{" "}
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
                  <div className="flex gap-2">
                    {!message.read && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="comic-button bg-green-500 text-white px-4 py-2 text-sm font-bold hover:bg-green-600"
                      >
                        Marquer comme lu
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="comic-button bg-red-500 text-white px-4 py-2 text-sm font-bold hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="comic-panel bg-slate-800/50 border-2 border-black p-4 mb-4">
                  <p className="text-slate-200 whitespace-pre-wrap font-semibold">{message.message}</p>
                </div>

                {/* Afficher la réponse si elle existe */}
                {message.reply && (
                  <div className="mb-4 comic-panel bg-green-950/30 border-2 border-green-500/50 p-4">
                    <p className="text-sm font-semibold text-green-300 mb-2">Votre réponse :</p>
                    <p className="text-green-200 whitespace-pre-wrap font-semibold">{message.reply}</p>
                    {message.replied_at && (
                      <p className="text-xs text-green-400 mt-2 font-semibold">
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

                {/* Formulaire de réponse */}
                {!message.reply && (
                  <ReplyForm messageId={message.id} />
                )}
              </div>
            );
          })()
        ) : (
          <div className="comic-panel-dark p-8 text-center text-slate-400 font-semibold">
            Sélectionnez un message pour voir les détails
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
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="messageId" value={messageId} />
      <div>
        <label htmlFor="reply" className="block text-sm font-bold text-slate-200 mb-2">
          Répondre au message
        </label>
        <textarea
          id="reply"
          name="reply"
          required
          rows={6}
          className="comic-panel w-full border-2 border-black bg-slate-800 px-4 py-3 font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
          placeholder="Tapez votre réponse ici..."
        />
      </div>
      {state.error && (
        <div className="comic-panel border-2 border-black bg-red-500 text-white px-4 py-3 text-sm font-bold">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="comic-panel border-2 border-black bg-green-500 text-white px-4 py-3 text-sm font-bold">
          {state.success}
        </div>
      )}
      <SubmitReplyButton />
    </form>
  );
}

function SubmitReplyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="comic-button bg-cyan-500 text-white px-6 py-3 font-bold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Envoi en cours..." : "Envoyer la réponse"}
    </button>
  );
}

