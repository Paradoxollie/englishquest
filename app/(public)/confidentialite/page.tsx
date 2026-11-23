import { publicPageMetadata } from "@/lib/site/metadata";
import Link from "next/link";
import { PageHead } from "@/components/comic/page-head";

export const metadata = publicPageMetadata({
  path: "/confidentialite",
  title: "Confidentialité",
  description: "Quelles données English Quest conserve, pourquoi, combien de temps, et comment les consulter ou les supprimer.",
});

export default function PrivacyPage() {
  return (
    <div>
      <PageHead caption="Tes données" title="Politique de confidentialité">
        La version courte : le site garde le strict nécessaire pour faire fonctionner ton compte, ne vend rien à
        personne, et tu peux tout effacer toi-même depuis ton profil.
      </PageHead>

      <div className="eq-container eq-section">
        <article className="eq-legal mx-auto max-w-3xl">
          <section className="mt-0 pt-0 border-t-0">
            <h2 className="eq-h2">Sans compte</h2>
          <p>
            Tu peux lire les cours et jouer en invité. Tes scores de jeu restent sur l’écran de fin de partie.
            Quand tu réussis un quiz de cours, ton navigateur garde le numéro de la mission et ta meilleure note
            pendant 180 jours au maximum. Le résultat du test de niveau peut également y rester jusqu’à 14 jours
            pour que la carte et la bibliothèque te proposent le cours conseillé.
          </p>
          <p>
            Ces résultats restent associés à ce navigateur. Quand tu crées un compte ou t’y connectes sur cet appareil,
            English Quest les vérifie, les rattache à ton parcours et efface leur copie locale après le transfert.
            Tu peux aussi les effacer dans les réglages de ton navigateur, en supprimant les données du site.
          </p>
          <p>
            Dans l’aventure BD, ce navigateur garde ta case en cours et ton brouillon. Un cookie conserve
            tes étapes validées pendant 180 jours au maximum. Si tu te connectes sur un appareil partagé,
            tu peux choisir de rattacher à ton compte les étapes que tu as jouées en invité.
          </p>
          <p>
            Le site compte aussi les pages consultées à partir d’une empreinte du réseau.
            Le journal des visites ne conserve pas l’adresse IP en clair.
          </p>
          <p>
            Si tu écris depuis la page Contact, ton nom ou pseudo, ton adresse e-mail et les messages sont conservés
            pour cet échange. Un lien privé te permet de lire les réponses et d’écrire à nouveau. Garde-le pour toi.
            Si tu choisis de l’enregistrer sur ton appareil, tu peux le retirer depuis la page Contact.
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
            <li>les échanges avec l’équipe dans « Mes messages ». Avec ou sans compte, si tu cliques sur
              « Confirmer ma lecture », l’équipe voit la date de ta confirmation.</li>
            <li>dans l’aventure BD, tes étapes validées, ta case en cours et tes réponses en cours de rédaction
              pour reprendre sur un autre appareil.</li>
            <li>les classes que tu rejoins avec le code de ton professeur. Ton professeur voit alors ton
              pseudo et ta progression (missions, expérience, résultats aux quiz), jamais ton adresse
              e-mail. Tu peux quitter une classe à tout moment depuis ton profil.</li>
          </ul>
          <p>
            En séance de classe, ton professeur voit les pseudos présents, les réponses comptabilisées et les résultats
            de chaque manche. Les participants voient le podium de leur séance. Le site garde tes réponses aux
            exercices pour reprendre après une coupure. Quitter la classe efface ta participation et tes résultats
            de ses séances. Ton professeur peut aussi consulter le nombre de parties libres et de missions validées
            pendant les sept derniers jours, à partir de ton entrée dans la classe.
          </p>
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
            Les données du compte sont conservées tant que ton compte existe. Un compte inactif depuis trois ans peut être supprimé par
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
            Les cookies de connexion te gardent connecté. D’autres cookies servent à retrouver ton point de départ
            et tes quiz réussis quand tu joues en invité. Si ton navigateur bloque la sauvegarde, tu peux toujours
            ouvrir le cours conseillé et poursuivre ton parcours. English Quest ne dépose aucun cookie publicitaire.
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
            Tu peux lire les cours et jouer sans compte. Si tu en crées un, tu peux utiliser un pseudo.
            Tes parents peuvent demander la suppression de ton compte par le formulaire de contact, en indiquant ce pseudo.
          </p>
        </section>

        <section>
          <h2 className="eq-h2">Responsable du traitement</h2>
          <p>
            Pierre Marienne, éditeur du site (voir les <Link href="/mentions-legales">mentions légales</Link>).
          </p>
        </section>

        <p className="eq-muted text-sm">Dernière mise à jour en novembre 2026.</p>
      </article>
      </div>
    </div>
  );
}
