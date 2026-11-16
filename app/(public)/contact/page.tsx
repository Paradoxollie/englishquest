import type { Metadata } from "next";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question, un bug, un mot de passe oublié ? Écris à Pierre, le professeur qui fait English Quest.",
};

export default async function ContactPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; email: string | null } | null = null;
  if (user) {
    const adminClient = createSupabaseAdminClient();
    const { data } = await adminClient
      .from("profiles")
      .select("username, email")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <div>
      <PageHead caption="Contact" title="Écrire à Pierre">
        Une question, un bug, un mot de passe oublié ou une idée de jeu : écris-moi, je lis tout.
      </PageHead>

      <div className="eq-container eq-section">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <section className="eq-card p-6 space-y-4">
            <span className="eq-caption">Informations utiles</span>
            <h2 className="eq-h3">Comment formuler ta demande</h2>
            <ul className="eq-muted grid gap-2.5 text-sm leading-relaxed">
              <li>Mot de passe oublié : indique ton pseudo, je réinitialise ton accès.</li>
              <li>Un bug : précise sur quelle page et avec quel appareil si possible.</li>
              <li>Professeur : indiquez votre pseudo et votre établissement pour activer le rôle professeur.</li>
            </ul>
            {profile ? (
              <p className="eq-inset p-3 text-sm eq-muted">
                Connecté en tant que <b className="text-[var(--pro-text)]">{profile.username}</b>. La réponse arrivera
                dans tes messages.
              </p>
            ) : null}
          </section>
          <section className="eq-card p-6 md:p-8">
            <ContactForm user={user} profile={profile} />
          </section>
        </div>
      </div>
    </div>
  );
}
