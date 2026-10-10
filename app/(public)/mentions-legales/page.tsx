import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement et contact du site English Quest.",
};

export default function LegalNoticePage() {
  return (
    <div className="eq-container eq-section">
      <article className="eq-legal mx-auto max-w-3xl">
        <p className="eq-kicker">Informations légales</p>
        <h1 className="eq-h1">Mentions légales</h1>
        <p className="eq-lead mt-4 max-w-none">
          Ce que la loi demande d&apos;afficher, en clair. Pour tout ce qui concerne tes données,
          voir la <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>

        <section>
          <h2 className="eq-h2">Éditeur du site</h2>
          <p>
            English Quest est un site personnel, édité à titre non professionnel par Pierre Marienne,
            professeur d&apos;anglais. Il est gratuit et ne vend rien.
          </p>
          <p>
            Directeur de la publication : Pierre Marienne. Contact : par le{" "}
            <Link href="/contact">formulaire de contact</Link>. Conformément à l&apos;article 6 III 2 de la
            loi du 21 juin 2004 pour la confiance dans l&apos;économie numérique, l&apos;éditeur non
            professionnel a communiqué ses coordonnées complètes à l&apos;hébergeur.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
            (<a href="https://vercel.com" rel="noopener noreferrer">vercel.com</a>).
          </p>
          <p>
            Les comptes, scores et progressions sont stockés chez Supabase Inc. (
            <a href="https://supabase.com" rel="noopener noreferrer">supabase.com</a>), sur des serveurs situés
            dans l&apos;Union européenne.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Publicité</h2>
          <p>
            Les pages d&apos;information (accueil, à propos, contact) peuvent afficher une annonce fournie par
            Google AdSense (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande). Les cours,
            les jeux et l&apos;espace connecté n&apos;en affichent aucune.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Propriété intellectuelle</h2>
          <p>
            Les cours, les quiz, les textes et le code du site sont la propriété de leur auteur. Les cours
            peuvent être projetés et utilisés librement en classe ; leur reproduction sur un autre site ou
            dans une publication demande l&apos;accord préalable de l&apos;éditeur. Les marques citées
            appartiennent à leurs propriétaires.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Responsabilité</h2>
          <p>
            Le contenu est préparé avec soin par un enseignant, mais une coquille reste possible : signale-la
            par le formulaire de contact, elle sera corrigée. Le site peut être interrompu pour maintenance
            sans préavis.
          </p>
        </section>

        <p className="eq-muted text-sm">Dernière mise à jour : octobre 2026.</p>
      </article>
    </div>
  );
}
