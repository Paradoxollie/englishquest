import Link from "next/link";
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
    <div className="eq-container eq-section space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="eq-kicker">Support</p>
          <h1 className="eq-h1 mt-1">Mes messages</h1>
          <p className="mt-2 eq-lead">Consultez vos messages et les réponses de l&apos;équipe.</p>
        </div>
        <Link href="/contact" className="eq-btn eq-btn-primary">
          Me contacter
        </Link>
      </div>

      {/* Liste des messages */}
      {!messages || messages.length === 0 ? (
        <div className="eq-card p-8 text-center">
          <p className="eq-muted text-lg">Vous n&apos;avez pas encore envoyé de message.</p>
          <div className="mt-5">
            <Link href="/contact" className="eq-btn eq-btn-primary">
              Me contacter
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message: {
            id: string;
            subject: string;
            created_at: string;
            message: string;
            reply?: string | null;
            replied_at?: string | null;
          }) => (
            <div
              key={message.id}
              className={`eq-card p-6 ${
                message.reply ? "border-emerald-500/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="eq-h3 mb-1">{message.subject}</h3>
                  <p className="text-sm eq-muted">
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
                {message.reply ? (
                  <span className="eq-chip eq-chip-mint">Répondu</span>
                ) : null}
              </div>

              <div className="mb-4">
                <p className="eq-kicker mb-2">Votre message</p>
                <div className="eq-inset p-4">
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>

              {message.reply ? (
                <div>
                  <p className="eq-kicker text-[var(--mint)] mb-2">Réponse de l&apos;équipe</p>
                  <div className="eq-inset p-4">
                    <p className="whitespace-pre-wrap">{message.reply}</p>
                    {message.replied_at ? (
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Répondu le{" "}
                        {new Date(message.replied_at).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="eq-inset border-amber-400/35 p-4">
                  <p className="text-amber-200 font-semibold">En attente de réponse…</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

