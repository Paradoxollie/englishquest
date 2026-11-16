import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/comic/page-head";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "English Quest est fait par Pierre Marienne, professeur d'anglais en collège et lycée. Pourquoi ce site, et comment il est construit.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHead caption="À propos" title="À propos">
        Je m&apos;appelle Pierre Marienne. Je suis professeur d&apos;anglais depuis dix ans, en collège, en lycée et à
        l&apos;université. English Quest est le site que j&apos;aurais voulu donner à mes élèves depuis longtemps.
      </PageHead>

      <div className="eq-container eq-section">
        <article className="eq-legal mx-auto max-w-3xl">
          <section className="mt-0 pt-0 border-t-0">
            <h2 className="eq-h2">Pourquoi un jeu</h2>
            <p>
              Un élève qui joue revient. Un élève qui revient progresse. Les mécaniques de jeu ne remplacent pas le
              cours, elles donnent une raison d&apos;y retourner : une mission à finir, un score à battre, une carte
              qui avance.
            </p>
          </section>

          <section>
            <h2 className="eq-h2">Ce qu&apos;il y a dedans</h2>
            <p>
              Cinquante cours de grammaire, du niveau A1 au niveau B1+, chacun avec un quiz de dix questions. Sept jeux
              qui travaillent le vocabulaire, la conjugaison, la traduction, la mémoire et l&apos;orthographe. Une carte
              de missions qui enchaîne cours, quiz et jeu. Le parcours suit le niveau, pas l&apos;âge : un collégien
              avancé et un adulte qui reprend y trouvent chacun leur place.
            </p>
          </section>

          <section>
            <h2 className="eq-h2">Ce que ça coûte</h2>
            <p>Rien. Le site est 100 % gratuit et sans publicité. Aucune donnée n&apos;est vendue.</p>
          </section>

          <section>
            <h2 className="eq-h2">Une question ou un retour ?</h2>
            <p>
              Le site évolue en continu avec mes élèves. Si vous repérez une coquille ou avez une suggestion,
              écrivez-moi via le formulaire de contact.
            </p>
            <div className="mt-4">
              <Link href="/contact" className="eq-btn eq-btn-ghost">
                Écrire via contact
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
