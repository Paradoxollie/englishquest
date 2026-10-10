import type { Metadata } from "next";
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
    <div className="eq-container eq-section">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <section>
          <h1 className="eq-h1">Contact</h1>
          <p className="eq-lead mt-4">
            Une question, un bug, un mot de passe oublié, une idée de jeu : écris-moi, je lis
            tout.
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-[var(--muted)]">
            <li>Mot de passe oublié : indique ton pseudo, je réinitialise ton accès.</li>
            <li>Un bug : dis sur quelle page, et avec quel appareil si tu le sais.</li>
            <li>Professeur ? Dis-moi quelles classes tu as, l&apos;espace profs se construit.</li>
          </ul>
          {profile ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              Connecté en tant que <span className="font-bold text-[var(--fg)]">{profile.username}</span>.
              La réponse arrivera dans tes messages.
            </p>
          ) : null}
        </section>
        <section className="eq-card p-6 md:p-8">
          <ContactForm user={user} profile={profile} />
        </section>
      </div>
    </div>
  );
}
