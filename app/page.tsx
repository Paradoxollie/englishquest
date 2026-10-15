import Image from "next/image";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GameCard } from "@/components/play/game-card";
import { games } from "@/lib/games/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const steps = [
  {
    title: "Tu choisis ton point de départ",
    copy: "Débutant, tu commences au premier chapitre. Tu as déjà des bases ? Le test de niveau te place au bon endroit de la carte en quelques minutes.",
  },
  {
    title: "Chaque mission, un cours et un quiz",
    copy: "Une notion, quelques minutes de lecture, dix questions. Avec 80 %, la mission est validée et la suivante s'ouvre.",
  },
  {
    title: "Le jeu ancre la notion",
    copy: "Grammar Rush te repose la notion du cours, mêlée aux précédentes. Six autres jeux entraînent le vocabulaire et les verbes.",
  },
] as const;

const levels = [
  { label: "A1", name: "Débutant", on: true },
  { label: "A2", name: "Élémentaire", on: false },
  { label: "B1", name: "Intermédiaire", on: false },
  { label: "B2", name: "Avancé", on: false },
  { label: "C1", name: "Expert", on: false },
] as const;

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: Promise<{ compte?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  const heroArt = resolveArt(ART.heroHome);

  return (
    <div>
      {params.compte === "supprime" ? (
        <p role="status" className="eq-container pt-4">
          <span className="eq-chip eq-chip-mint">Ton compte a été supprimé. Merci d&apos;avoir joué.</span>
        </p>
      ) : null}
      <section className="eq-hero">
        {heroArt ? (
          <div className="eq-hero-art">
            <Image src={heroArt} alt="" fill priority sizes="100vw" className="object-cover object-[70%_center]" />
          </div>
        ) : null}
        <div className="eq-container eq-hero-body">
          <div className="eq-reveal grid min-h-[560px] content-center gap-6 py-16 md:min-h-[620px] md:max-w-[640px] md:py-24">
            <h1 className="eq-h1">Apprends l&apos;anglais comme on avance dans un jeu.</h1>
            <p className="eq-lead text-[1.15rem]">
              Un test de niveau, puis un parcours à ta mesure : des cours courts, un quiz pour
              vérifier, un jeu pour ancrer. Chaque mission rapporte de l&apos;expérience et de
              l&apos;or.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/test-de-niveau" className="eq-btn eq-btn-primary eq-btn-lg">
                Tester mon niveau, 5 minutes
              </Link>
              <Link href="/auth/signup" className="eq-btn eq-btn-ghost eq-btn-lg">
                Créer un compte gratuit
              </Link>
            </div>
            <p className="text-sm">
              <Link href="/play" className="font-bold text-[var(--cyan)]">
                Ou essaie un jeu tout de suite, sans compte
              </Link>
            </p>
            <p className="text-sm text-[var(--muted)]">
              Gratuit, sans publicité dans les cours et les jeux.{" "}
              <span className="font-bold text-[var(--fg)]">
                Un site de Pierre Marienne, professeur d&apos;anglais.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="eq-container eq-section">
        <h2 className="eq-h2">Comment on progresse</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="eq-card">
              <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-[var(--gold)] font-[var(--font-display)] text-sm font-extrabold text-[var(--ink)]">
                {index + 1}
              </span>
              <h3 className="eq-h3 mt-3">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="eq-container pb-10 md:pb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="eq-h2">Sept jeux, sept façons de s&apos;entraîner</h2>
          <Link href="/play" className="font-bold text-[var(--cyan)]">
            Tous les jeux
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} compact />
          ))}
        </div>
      </section>

      <section className="eq-container pb-12 md:pb-20">
        <div className="eq-surface grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:items-center md:p-8">
          <div>
            <h2 className="eq-h2">Le parcours suit ton niveau, pas ton âge</h2>
            <p className="mt-3 text-[var(--muted)]">
              Un collégien déjà bilingue démarre loin dans la carte. Un adulte qui reprend
              démarre au premier chapitre. Même carte, mêmes règles, mêmes récompenses.
            </p>
            <Link href="/tous-les-cours" className="eq-btn eq-btn-ghost mt-5">
              Voir les 50 cours
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <li key={level.label} className={`eq-chip ${level.on ? "eq-chip-gold" : ""}`}>
                <span>{level.label}</span>
                <span className={level.on ? "" : "eq-muted"}>{level.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
