import Link from "next/link";
import { redirect } from "next/navigation";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function MyMessagesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(await loginForCurrentPage("/messages"));
  }

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
    <div>
      <PageHead caption="Support" title="Mes messages">
        Consultez vos messages et les réponses de l&apos;équipe English Quest.
      </PageHead>

      <div className="eq-container eq-section space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="eq-muted text-sm">
            {messages && messages.length > 0
              ? `${messages.length} message${messages.length > 1 ? "s" : ""} envoyé${messages.length > 1 ? "s" : ""}`
              : "Besoin d'aide ? Écrivez directement à votre professeur ou à l'équipe."}
          </p>
          <Link href="/contact" className="eq-btn eq-btn-primary">
            Nouveau message
          </Link>
        </div>

        {!messages || messages.length === 0 ? (
          <div className="eq-card p-8 text-center">
            <p className="eq-muted text-base">Vous n&apos;avez pas encore envoyé de message.</p>
            <div className="mt-5">
              <Link href="/contact" className="eq-btn eq-btn-primary">
                Écrire un message
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(
              (message: {
                id: string;
                subject: string;
                created_at: string;
                message: string;
                reply?: string | null;
                replied_at?: string | null;
              }) => (
                <div
                  key={message.id}
                  className={`eq-card p-6 space-y-4 ${
                    message.reply ? "border-l-4 border-l-[var(--pro-success)]" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--pro-border)] pb-3">
                    <div>
                      <h2 className="eq-h3">{message.subject}</h2>
                      <p className="eq-muted mt-1 text-sm">
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
                    ) : (
                      <span className="eq-chip eq-chip-gold-soft">En attente</span>
                    )}
                  </div>

                  <div>
                    <span className="eq-caption mb-2">Votre message</span>
                    <div className="eq-inset p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                    </div>
                  </div>

                  {message.reply ? (
                    <div>
                      <span className="eq-caption mb-2 text-[var(--pro-success)]">Réponse de l&apos;équipe</span>
                      <div className="rounded-[var(--pro-radius)] border border-[var(--pro-success)] bg-[var(--pro-success-soft)] p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.reply}</p>
                        {message.replied_at ? (
                          <p className="eq-muted mt-2 text-xs font-medium">
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
                    <div className="rounded-[var(--pro-radius)] border border-[var(--pro-gold-edge)] bg-[var(--pro-gold-soft)] p-4">
                      <p className="text-sm font-semibold text-[var(--pro-gold-text)]">
                        En attente de réponse…
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
