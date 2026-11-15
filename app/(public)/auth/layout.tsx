import type { ReactNode } from "react";
import { Bubble } from "@/components/comic/bubble";
import { Mascot } from "@/components/comic/mascot";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="eq-container eq-section">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="eq-auth-intro eq-slam">
          <span className="eq-caption">Ton compte English Quest</span>
          <div className="eq-mascot-row">
            <Mascot pose="maya-salut" size={150} priority />
            <Bubble tail="left">
              Bienvenue ! Un pseudo et un mot de passe suffisent, l&apos;e-mail est facultatif.
            </Bubble>
          </div>
          <p className="eq-readbox text-sm leading-relaxed">
            Ton compte garde ta progression sur la carte, tes étoiles, tes records et ton or. Pas de publicité,
            aucune revente de données. Ne mets pas ton vrai nom dans ton pseudo. Avant 15 ans, demande l&apos;accord
            d&apos;un parent.
          </p>
        </section>

        <div className="flex items-start justify-center">{children}</div>
      </div>
    </div>
  );
}
