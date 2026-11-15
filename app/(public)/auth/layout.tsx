import Image from "next/image";
import type { ReactNode } from "react";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const showcaseArt = resolveArt(ART.authShowcase) ?? resolveArt(ART.onboarding);

  return (
    <div className="eq-container eq-section">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="grid gap-5">
          {showcaseArt ? (
            <div className="eq-comic-panel">
              <div className="eq-comic-panel-media">
                <Image
                  src={showcaseArt}
                  alt="Illustration londonienne English Quest au crépuscule"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
              </div>
              <div className="eq-comic-panel-bar">
                <span><strong>Accès élève</strong> · Inscription en 15 secondes</span>
                <span>Gratuit</span>
              </div>
            </div>
          ) : null}

          <div className="eq-surface p-6">
            <p className="eq-kicker">Compte personnel</p>
            <h2 className="eq-h2 mt-1">Conservez votre progression sur tous vos appareils</h2>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
              Un pseudo et un mot de passe suffisent pour ouvrir votre carnet d&apos;aventure. L&apos;adresse e-mail reste
              facultative.
            </p>
            <ul className="mt-4 grid gap-2.5 text-sm">
              <li className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--ink-3)] px-3.5 py-2.5">
                <span className="font-bold">Carte des 50 missions</span>
                <span className="block text-xs text-[var(--muted)]">Étoiles par cours, examens de chapitre et palier CECRL.</span>
              </li>
              <li className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--ink-3)] px-3.5 py-2.5">
                <span className="font-bold">Records &amp; Ligue hebdomadaire</span>
                <span className="block text-xs text-[var(--muted)]">XP cumulée, séries quotidiennes et trophées débloqués.</span>
              </li>
              <li className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--ink-3)] px-3.5 py-2.5">
                <span className="font-bold">Atelier de profil</span>
                <span className="block text-xs text-[var(--muted)]">Pièces d&apos;or gagnées en jeu pour équiper avatars et titres.</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Aucune publicité ni revente de données. Avant 15 ans, demandez l&apos;accord d&apos;un parent.
            </p>
          </div>
        </section>

        <div className="flex items-start justify-center">{children}</div>
      </div>
    </div>
  );
}
