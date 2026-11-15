import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="eq-container eq-section">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="eq-surface grid gap-3 p-6">
          <h2 className="eq-h2">Ton compte English Quest</h2>
          <p className="text-[var(--muted)] leading-relaxed">
            Un pseudo et un mot de passe suffisent, l&apos;adresse e-mail est facultative. Ton compte garde ta
            progression sur la carte, tes étoiles, tes records et ton or.
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
