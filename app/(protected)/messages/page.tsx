import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function MyMessagesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Récupérer les messages de l'utilisateur
  const adminClient = createSupabaseAdminClient();
  const { data: messages, error } = await adminClient
    .from("contact_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Mes messages</h1>
        <p className="mt-2 text-lg text-slate-400">Consultez vos messages et les réponses de l'équipe</p>
      </div>

      {/* Liste des messages */}
      {!messages || messages.length === 0 ? (
        <div className="comic-panel-dark p-8 text-center">
          <p className="text-slate-400 font-semibold text-lg">Vous n'avez pas encore envoyé de message.</p>
          <a
            href="/contact"
            className="comic-button inline-block mt-4 bg-cyan-500 text-white px-6 py-3 font-bold hover:bg-cyan-600"
          >
            Envoyer un message
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message: any) => (
            <div
              key={message.id}
              className={`comic-panel-dark p-6 border-2 ${
                message.reply ? "border-green-500/30" : "border-slate-700/50"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{message.subject}</h3>
                  <p className="text-sm text-slate-400 font-semibold">
                    Envoyé le{" "}
                    {new Date(message.created_at).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.reply && (
                  <span className="comic-panel bg-green-500 text-white px-3 py-1 text-sm font-bold border-2 border-black">
                    Répondu
                  </span>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-300 mb-2">Votre message :</p>
                <div className="comic-panel bg-slate-800/50 border-2 border-black p-4">
                  <p className="text-slate-200 whitespace-pre-wrap font-semibold">{message.message}</p>
                </div>
              </div>

              {message.reply ? (
                <div>
                  <p className="text-sm font-semibold text-green-300 mb-2">Réponse de l'équipe :</p>
                  <div className="comic-panel bg-green-950/30 border-2 border-green-500/50 p-4">
                    <p className="text-green-200 whitespace-pre-wrap font-semibold">{message.reply}</p>
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
                  </div>
                </div>
              ) : (
                <div className="comic-panel bg-amber-950/30 border-2 border-amber-500/50 p-4">
                  <p className="text-amber-200 font-semibold">En attente de réponse...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

