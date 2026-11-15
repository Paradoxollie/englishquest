import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="eq-container eq-section">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="eq-auth-intro eq-slam">
          <span className="eq-caption">Ton compte English Quest</span>
          <h2 className="eq-h2">Garde ta progression sur tous tes appareils</h2>
          <p className="eq-lead">
            Un pseudo et un mot de passe suffisent, l&apos;adresse e-mail est facultative. Ton compte enregistre ta
            carte, tes étoiles, tes records et ton or.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Pas de publicité, aucune revente de données. Ne mets pas ton vrai nom dans ton pseudo. Avant 15 ans,
            demande l&apos;accord d&apos;un parent.
          </p>
        </section>

        <div className="flex items-start justify-center">{children}</div>
      </div>
    </div>
  );
}
