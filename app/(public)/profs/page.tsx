import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pour les profs",
  description:
    "English Quest en classe : une classe avec un code à projeter, le suivi des missions de chaque élève, des devoirs avec date limite. Gratuit, pour les professeurs d'anglais de la 6e à la terminale.",
};

const features = [
  {
    title: "Une classe, un code",
    copy: "Vous créez la classe, le site lui donne un code de six caractères. Les élèves le tapent et la rejoignent. Pas de liste à saisir, pas d'adresse e-mail à collecter.",
  },
  {
    title: "Le code en grand, au tableau",
    copy: "Un bouton affiche le code seul à l'écran, en très grand, avec l'adresse à taper. Lisible du fond de la salle, au vidéoprojecteur comme sur un écran interactif.",
  },
  {
    title: "Le suivi de chaque élève",
    copy: "Missions validées sur cinquante, mission en cours, dernière activité, expérience, moyenne aux quiz. Le tableau se trie d'un clic sur chaque colonne.",
  },
  {
    title: "Les notions qui coincent",
    copy: "Les missions où la classe obtient ses scores les plus bas au quiz remontent d'elles-mêmes. De quoi savoir quoi reprendre en classe.",
  },
  {
    title: "Des devoirs avec date limite",
    copy: "Vous donnez une mission à faire pour une date. Chaque élève la voit en haut de son accueil. Vous voyez qui l'a faite, qui est en retard.",
  },
  {
    title: "Gratuit, sans publicité dans les cours",
    copy: "Pas d'abonnement, pas de version payante. Les cours et les jeux restent sans publicité, pour vous comme pour vos élèves.",
  },
] as const;

const steps = [
  {
    title: "Créez un compte",
    copy: "Un pseudo et un mot de passe, comme vos élèves. L'adresse e-mail est facultative, mais utile pour vous répondre.",
  },
  {
    title: "Écrivez-moi depuis la page Contact",
    copy: "Donnez votre pseudo et votre établissement. Je vous active le rôle professeur dès que possible.",
  },
  {
    title: "Ouvrez l'onglet Profs",
    copy: "Il apparaît dans le menu dès que le rôle est actif. Créez votre première classe et projetez son code.",
  },
] as const;

export default function TeachersLandingPage() {
  return (
    <div className="eq-container eq-section">
      <div className="mx-auto grid max-w-5xl gap-12">
        <header className="eq-profs-hero">
          <p className="eq-kicker">Pour les professeurs d&apos;anglais</p>
          <h1 className="eq-h1">English Quest en classe</h1>
          <p className="eq-lead">
            Vos élèves avancent dans les missions à leur rythme, en classe ou à la maison. Vous voyez où chacun en est,
            vous repérez ce qui bloque et vous donnez des devoirs. Gratuitement.
          </p>
          <div className="eq-home-actions">
            <Link href="/contact" className="eq-btn eq-btn-gold eq-btn-lg">
              Demander un compte professeur
            </Link>
            <Link href="/tous-les-cours" className="eq-btn eq-btn-ghost eq-btn-lg">
              Voir les cinquante cours
            </Link>
          </div>
        </header>

        <section aria-labelledby="profs-for">
          <h2 id="profs-for" className="eq-h2">
            Pour qui
          </h2>
          <p className="mt-3 max-w-3xl text-[var(--muted)]">
            Les professeurs d&apos;anglais de collège et de lycée, de la 6e à la terminale. Les cinquante missions vont du
            niveau A1 au niveau C1 : chaque élève travaille à son niveau, le test de niveau le place au bon endroit de la
            carte. Chaque mission, c&apos;est un cours court, un quiz de dix questions à réussir à 80 % et un jeu qui reprend
            la notion.
          </p>
        </section>

        <section aria-labelledby="profs-features">
          <h2 id="profs-features" className="eq-h2">
            Ce que vous obtenez
          </h2>
          <ul className="eq-profs-grid">
            {features.map((feature) => (
              <li key={feature.title} className="eq-card">
                <h3 className="eq-h3">{feature.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{feature.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="profs-privacy" className="eq-card eq-profs-privacy">
          <h2 id="profs-privacy" className="eq-h3">
            Ce que vous voyez de vos élèves
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Leur pseudo et leur progression : missions, expérience, résultats aux quiz. Jamais leur adresse e-mail, ni
            aucun autre élève que ceux qui ont rejoint votre classe. Un élève peut quitter la classe depuis son profil, et
            vous pouvez retirer un élève de la vôtre.
          </p>
        </section>

        <section aria-labelledby="profs-how">
          <h2 id="profs-how" className="eq-h2">
            Obtenir un compte professeur
          </h2>
          <ol className="eq-profs-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="eq-profs-step-num" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3 className="eq-h3">{step.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{step.copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="eq-home-actions mt-6">
            <Link href="/contact" className="eq-btn eq-btn-gold">
              Écrire depuis la page Contact
            </Link>
            <Link href="/auth/signup" className="eq-btn eq-btn-ghost">
              Créer un compte
            </Link>
          </div>
        </section>

        <p className="text-sm text-[var(--muted)]">
          Pierre Marienne, professeur d&apos;anglais. Je fais ce site pour mes propres classes et je l&apos;ouvre aux
          collègues : vos retours m&apos;aident à l&apos;améliorer.
        </p>
      </div>
    </div>
  );
}
