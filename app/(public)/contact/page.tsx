import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contactez-nous - English Quest",
  description:
    "Une question ? Une suggestion ? Contactez l'équipe d'English Quest. Nous sommes là pour vous aider dans votre apprentissage de l'anglais.",
};

export default async function ContactPage() {
  // Vérifier si l'utilisateur est authentifié (optionnel)
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Récupérer le profil si l'utilisateur est connecté
  let profile = null;
  if (user) {
    const adminClient = createSupabaseAdminClient();
    profile = await adminClient
      .from("profiles")
      .select("username, email")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => data);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="comic-panel-dark p-8 mb-8" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}>
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-4">
              <div className="comic-panel bg-cyan-600 border-2 border-black p-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h1 className="text-3xl font-bold text-white text-outline md:text-4xl">Contactez-nous</h1>
            </div>
            <p className="text-lg text-slate-200 font-semibold text-outline">
              Une question ? Une suggestion ? N'hésitez pas à nous envoyer un message !
            </p>
            {profile && (
              <p className="mt-2 text-sm text-slate-300 font-semibold">
                Connecté en tant que : <span className="text-cyan-300 font-bold">{profile.username}</span>
              </p>
            )}
          </div>
        </div>
        <div className="comic-panel-dark p-8">
          <ContactForm user={user} profile={profile} />
        </div>
      </div>
    </div>
  );
}

