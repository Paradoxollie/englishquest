import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Quelles données English Quest conserve, pourquoi, combien de temps, et comment les consulter ou les supprimer.",
};

export default function PrivacyPage() {
  return (
    <div className="eq-container eq-section">
      <article className="eq-legal mx-auto max-w-3xl">
        <p className="eq-kicker">Tes données</p>
        <h1 className="eq-h1">Politique de confidentialité</h1>
        <p className="eq-lead mt-4 max-w-none">
          La version courte : le site garde le strict nécessaire pour faire fonctionner ton compte, ne vend
          rien à personne, et tu peux tout effacer toi-même depuis ton profil.
        </p>

        <section>
          <h2 className="eq-h2">Sans compte</h2>
          <p>
            Tu peux lire tous les cours et jouer à tous les jeux sans t&apos;inscrire. Dans ce cas, aucun
            score n&apos;est enregistré et aucune donnée personnelle n&apos;est conservée. Le site compte
            simplement les visites par page, sans identifier qui visite : l&apos;adresse IP n&apos;est pas
            stockée en clair.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Avec un compte</h2>
          <p>Quand tu crées un compte, le site enregistre :</p>
          <ul>
            <li>ton pseudo et ton mot de passe (chiffré, personne ne peut le lire, pas même l&apos;éditeur) ;</li>
            <li>ton adresse e-mail, uniquement si tu en donnes une. Elle sert à retrouver ton mot de passe. Un
              compte sans adresse e-mail fonctionne aussi ;</li>
            <li>tes scores aux jeux, ta progression sur la carte d&apos;aventure, tes points d&apos;expérience,
              ton or et les objets que tu as choisis pour ton profil ;</li>
            <li>les messages que tu envoies par le formulaire de contact ;</li>
            <li>les classes que tu rejoins avec le code de ton professeur. Ton professeur voit alors ton
              pseudo et ta progression (missions, expérience, résultats aux quiz), jamais ton adresse
              e-mail. Tu peux quitter une classe à tout moment depuis ton profil.</li>
          </ul>
          <p>
            Rien d&apos;autre : pas de nom réel, pas d&apos;établissement, pas de date de
            naissance. Ton pseudo et tes meilleurs scores apparaissent dans les classements, visibles par les
            autres joueurs connectés. Choisis un pseudo qui ne te désigne pas si tu préfères rester discret.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Pourquoi, et sur quelle base</h2>
          <p>
            Ces données servent à faire fonctionner le jeu : retenir où tu en es, calculer tes récompenses,
            afficher les classements. Elles sont traitées parce que c&apos;est nécessaire au service que tu
            demandes en créant un compte (article 6.1.b du RGPD). Elles ne sont ni vendues, ni transmises à
            des fins de prospection, ni utilisées pour te profiler.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Combien de temps</h2>
          <p>
            Tant que ton compte existe. Un compte inactif depuis trois ans peut être supprimé par
            l&apos;éditeur. Les messages de contact sont effacés au plus tard un an après la réponse.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Où</h2>
          <p>
            Les comptes et les scores sont stockés chez Supabase, sur des serveurs situés dans l&apos;Union
            européenne. Le site lui-même est servi par Vercel, qui peut utiliser des serveurs hors de
            l&apos;Union pour accélérer l&apos;affichage ; aucune donnée de compte n&apos;y est conservée.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Cookies</h2>
          <p>
            Un seul cookie est posé par le site lui-même : celui qui te garde connecté. Il est indispensable et
            ne demande pas de consentement.
          </p>
          <p>
            Les pages d&apos;accueil, à propos et contact peuvent afficher une annonce Google AdSense. Google
            peut alors déposer ses propres cookies, après ton accord quand la réglementation le demande. Les
            cours, les jeux et l&apos;espace connecté n&apos;affichent pas de publicité et ne chargent pas le
            script de Google. Tu peux régler ces annonces sur{" "}
            <a href="https://adssettings.google.com" rel="noopener noreferrer">adssettings.google.com</a>.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Tes droits</h2>
          <p>
            Tu peux consulter, corriger ou effacer tes données à tout moment. Pour effacer, va sur ta page{" "}
            <Link href="/profile">Profil</Link>, section Compte, bouton « Supprimer mon compte » : tout part
            immédiatement, scores compris, et ce n&apos;est pas réversible. Pour le reste (une correction, une
            copie de tes données), écris par le <Link href="/contact">formulaire de contact</Link> depuis ton
            compte ; réponse sous un mois au plus.
          </p>
          <p>
            Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL (
            <a href="https://www.cnil.fr" rel="noopener noreferrer">cnil.fr</a>).
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Si tu as moins de 15 ans</h2>
          <p>
            Le site est fait pour des élèves, et un pseudo suffit pour jouer. Tes parents peuvent demander à
            tout moment la suppression de ton compte par le formulaire de contact, en indiquant ton pseudo.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Responsable du traitement</h2>
          <p>
            Pierre Marienne, éditeur du site (voir les <Link href="/mentions-legales">mentions légales</Link>).
          </p>
        </section>

        <p className="eq-muted text-sm">Dernière mise à jour : octobre 2026.</p>
      </article>
    </div>
  );
}
