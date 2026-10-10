import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="eq-container eq-section">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="eq-surface p-6 md:p-8">
          <h1 className="eq-h2">Ton compte, ta progression</h1>
          <p className="mt-3 text-[var(--muted)]">
            Un pseudo et un mot de passe suffisent. L&apos;adresse e-mail est facultative : elle
            sert seulement à récupérer ton compte si tu oublies ton mot de passe.
          </p>
          <ul className="mt-6 grid gap-3 text-sm">
            <li className="eq-inset p-4">
              <p className="font-bold">La carte retient où tu en es</p>
              <p className="text-[var(--muted)]">Missions validées, cours en cours, prochaine étape.</p>
            </li>
            <li className="eq-inset p-4">
              <p className="font-bold">Les scores comptent</p>
              <p className="text-[var(--muted)]">Classements par jeu, records personnels, défi du jour.</p>
            </li>
            <li className="eq-inset p-4">
              <p className="font-bold">Expérience et or</p>
              <p className="text-[var(--muted)]">Niveaux, avatars et titres à débloquer dans la boutique.</p>
            </li>
          </ul>
          <p className="mt-6 text-xs text-[var(--muted)]">
            Le site est gratuit et ne revend aucune donnée. Si tu as moins de 15 ans, demande
            l&apos;accord d&apos;un parent avant de créer un compte.
          </p>
        </section>

        <div className="flex items-start justify-center">{children}</div>
      </div>
    </div>
  );
}
