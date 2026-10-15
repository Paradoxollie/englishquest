import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "English Quest est fait par Pierre Marienne, professeur d'anglais en collège et lycée. Pourquoi ce site, et comment il est construit.",
};

export default function AboutPage() {
  return (
    <div className="eq-container eq-section">
      <div className="mx-auto max-w-3xl">
        <h1 className="eq-h1">À propos</h1>
        <p className="eq-lead mt-4 max-w-none">
          Je m&apos;appelle Pierre Marienne. Je suis professeur d&apos;anglais depuis dix ans,
          en collège, en lycée et à l&apos;université. English Quest est le site que
          j&apos;aurais voulu donner à mes élèves depuis longtemps.
        </p>

        <div className="mt-10 grid gap-8">
          <section>
            <h2 className="eq-h2">Pourquoi un jeu</h2>
            <p className="mt-3 text-[var(--muted)]">
              Un élève qui joue revient. Un élève qui revient progresse. Les mécaniques de jeu
              ne remplacent pas le cours, elles donnent une raison d&apos;y retourner : une
              mission à finir, un score à battre, une carte qui avance.
            </p>
          </section>

          <section>
            <h2 className="eq-h2">Ce qu&apos;il y a dedans</h2>
            <p className="mt-3 text-[var(--muted)]">
              Cinquante cours de grammaire, du niveau A1 au niveau C1, chacun avec un quiz de dix
              questions. Sept jeux qui travaillent le vocabulaire, la conjugaison, la traduction,
              la mémoire et l&apos;orthographe. Une carte de missions qui enchaîne cours, quiz et
              jeu. Le parcours suit le niveau, pas l&apos;âge : un collégien avancé et un adulte
              qui reprend y trouvent chacun leur place.
            </p>
          </section>

          <section>
            <h2 className="eq-h2">Ce que ça coûte</h2>
            <p className="mt-3 text-[var(--muted)]">
              Rien. Le site est gratuit, sans publicité dans les cours et les jeux. Les pages
              d&apos;information peuvent afficher une annonce en bas de page pour couvrir les
              frais d&apos;hébergement. Aucune donnée n&apos;est vendue.
            </p>
          </section>

          <section>
            <h2 className="eq-h2">Pour les professeurs</h2>
            <p className="mt-3 text-[var(--muted)]">
              Un espace classe est ouvert : une classe avec un code à projeter, le suivi des
              missions de chaque élève, des devoirs avec date limite. Gratuit. Tout est expliqué
              sur la page dédiée.
            </p>
            <Link href="/profs" className="eq-btn eq-btn-ghost mt-4">
              Pour les profs
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
