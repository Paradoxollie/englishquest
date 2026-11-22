import { publicPageMetadata } from "@/lib/site/metadata";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ContactForm } from "./contact-form";
import { passages } from "@/lib/adventure/catalog";

export const metadata = publicPageMetadata({
  path: "/contact",
  title: "Contact",
  description: "Une question, un bug, un mot de passe oublié ? Écris à Pierre, le professeur qui fait English Quest.",
});

export default async function ContactPage({ searchParams }: {
  searchParams: Promise<{ cours?: string | string[]; exercice?: string | string[]; escale?: string | string[] }>;
}) {
  const { cours, exercice, escale } = await searchParams;
  const quizSubject = typeof cours === "string" && /^(?:[1-9]|[1-4][0-9]|50)$/.test(cours)
    && typeof exercice === "string" && /^x?[0-9]{1,3}$/.test(exercice)
    ? `Question du cours ${cours} (exercice ${exercice})` : undefined;
  const episode = passages.find(p => String(p.id) === escale);
  const initialSubject = quizSubject ?? (episode ? `Avis sur l’aventure BD · Escale ${episode.id} · ${episode.title}` : undefined);
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
            <ContactForm user={user} profile={profile} initialSubject={initialSubject} />
          </section>
        </div>
      </div>
    </div>
  );
}
