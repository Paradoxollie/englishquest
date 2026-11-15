import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
import { GameCard } from "@/components/play/game-card";
import { games } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";
import { getServerUser } from "@/lib/supabase/auth-cache";

const steps = [
  {
    code: "Étape 01",
    title: "Prendre son point de départ",
    copy: "Démarrez au premier chapitre ou passez le test de placement pour situer directement vos acquis de A1 à B1+.",
  },
  {
    code: "Étape 02",
    title: "Comprendre la règle sans détours",
    copy: "Cinquante leçons rédigées pour les francophones, suivies d'un quiz de validation pour vérifier ce qui reste en tête.",
  },
  {
    code: "Étape 03",
    title: "Pratiquer jusqu'au réflexe",
    copy: "Verbes irréguliers sous chrono, orthographe, vocabulaire en chute libre et révisions de cours au format arcade.",
  },
] as const;

const levels = [
  { label: "A1", name: "Fondations", active: true },
  { label: "A2", name: "Quotidien", active: false },
  { label: "A2+", name: "Autonomie", active: false },
  { label: "B1", name: "Aisance", active: false },
  { label: "B1+", name: "Maîtrise", active: false },
] as const;

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: Promise<{ compte?: string }>;
}) {
  const params = await searchParams;
  const user = await getServerUser();

  if (user) {
    redirect("/home");
  }

  const heroArt = resolveArt(ART.heroHome);
  const onboardingArt = resolveArt(ART.onboarding);

  return (
    <div>
      {params.compte === "supprime" ? (
        <p role="status" className="eq-container pt-4">
          <span className="eq-chip eq-chip-mint">Ton compte a été supprimé. Merci d&apos;avoir joué.</span>
        </p>
      ) : null}

      <section className="eq-editorial-band">
        <div className="eq-container eq-split-hero">
          <div className="grid gap-5">
            <p className="eq-kicker">Méthode &amp; Arcade · Pierre Marienne</p>
            <h1 className="eq-h1">Apprenez l&apos;anglais avec méthode, progressez par le jeu.</h1>
            <p className="eq-lead">
              Cinquante leçons accessibles sans inscription, une carte de progression par chapitres et sept jeux rapides pour
              ancrer grammaire, lexique et verbes irréguliers.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/test-de-niveau" className="eq-btn eq-btn-primary eq-btn-lg">
                Passer le test de niveau
              </Link>
              <Link href="/auth/signup" className="eq-btn eq-btn-gold eq-btn-lg">
                Créer un compte élève
              </Link>
              <Link href="/play" className="eq-btn eq-btn-ghost eq-btn-lg">
                Essayer un jeu
              </Link>
            </div>
            <p className="text-xs font-semibold text-[var(--muted)]">
              Accès libre et gratuit · Zéro publicité · Niveaux A1 à B1+
            </p>
          </div>

          {heroArt ? (
            <div className="eq-comic-panel">
              <div className="eq-comic-panel-media">
                <Image
                  src={heroArt}
                  alt="Illustration English Quest d'exploration à travers Londres"
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className="object-cover object-[72%_center]"
                />
              </div>
              <div className="eq-comic-panel-bar">
                <span>
                  <strong>50 leçons</strong> · 5 actes de progression
                </span>
                <span>7 défis jouables sans compte</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="eq-container eq-section">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="eq-kicker">Organisation</p>
            <h2 className="eq-h2 mt-1">Trois temps pour fixer chaque notion</h2>
          </div>
          <Link href="/tous-les-cours" className="font-bold text-[var(--cyan)] underline underline-offset-4">
            Parcourir les 50 cours
          </Link>
        </div>
        <ol className="eq-issue-strip mt-6">
          {steps.map((step) => (
            <li key={step.title} className="eq-issue-card">
              <span className="eq-issue-num">{step.code}</span>
              <h3 className="eq-h3">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="eq-container pb-12 md:pb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="eq-kicker">Salle d&apos;arcade</p>
            <h2 className="eq-h2 mt-1">Sept épreuves pour consolider vos bases</h2>
          </div>
          <Link href="/play" className="font-bold text-[var(--cyan)] underline underline-offset-4">
            Ouvrir tous les jeux
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <GameCard
              key={game.slug}
              game={game}
              artSrc={resolveArt(getGamePresentation(game).artworkSrc)}
              priority={index < 3}
            />
          ))}
        </div>
      </section>

      <section className="eq-container pb-14 md:pb-20">
        <div className="eq-surface grid gap-6 p-6 md:grid-cols-[1.05fr_0.95fr] md:items-center md:p-8">
          <div className="grid gap-4">
            <p className="eq-kicker">Parcours CECRL</p>
            <h2 className="eq-h2">Le programme suit votre niveau réel, jamais votre classe d&apos;âge</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Chaque chapitre réunit dix leçons ciblées et un examen final. Validez les bases en un test ou explorez librement
              l&apos;ensemble des fiches depuis la bibliothèque.
            </p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {levels.map((level) => (
                <li key={level.label} className={`eq-chip ${level.active ? "eq-chip-gold" : ""}`}>
                  <span className="font-mono font-extrabold">{level.label}</span>
                  <span>{level.name}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/quest" className="eq-btn eq-btn-primary">
                Voir la carte d&apos;aventure
              </Link>
              <Link href="/tous-les-cours" className="eq-btn eq-btn-ghost">
                Voir les 50 cours
              </Link>
            </div>
          </div>

          {onboardingArt ? (
            <div className="eq-comic-panel">
              <div className="eq-comic-panel-media">
                <Image
                  src={onboardingArt}
                  alt="Élèves montant les marches de l'académie English Quest"
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
