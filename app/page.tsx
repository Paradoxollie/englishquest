import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bubble } from "@/components/comic/bubble";
import { Burst } from "@/components/comic/burst";
import { Mascot } from "@/components/comic/mascot";
import { GameCard } from "@/components/play/game-card";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
import { chapters } from "@/lib/courses/chapters";
import { games } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";
import { getServerUser } from "@/lib/supabase/auth-cache";

const steps = [
  {
    pose: "maya-explique",
    label: "Case 1",
    title: "Lis la leçon",
    copy: "Une règle claire, des exemples, les pièges des francophones. Cinq minutes, pas plus.",
  },
  {
    pose: "sam-bravo",
    label: "Case 2",
    title: "Réussis le quiz",
    copy: "Dix questions. À 80 %, la mission est validée et la suivante s'ouvre.",
  },
  {
    pose: "duo-victoire",
    label: "Case 3",
    title: "Joue et gagne",
    copy: "Sept jeux pour t'entraîner : XP, or, étoiles, badges et défi du jour.",
  },
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

  const coverArt = resolveArt(ART.heroHome);

  return (
    <div>
      {params.compte === "supprime" ? (
        <p role="status" className="eq-container pt-4">
          <span className="eq-chip eq-chip-mint">Ton compte a été supprimé. Merci d&apos;avoir joué.</span>
        </p>
      ) : null}

      <section className="eq-cover eq-rays">
        <div className="eq-container eq-cover-grid">
          <div className="eq-cover-text">
            <span className="eq-caption eq-slam eq-slam-1">Anglais · de A1 à B1+</span>
            <h1 className="eq-cover-title is-home eq-slam eq-slam-2">
              L&apos;anglais, version <em>super-héros</em>
            </h1>
            <p className="eq-readbox eq-slam eq-slam-3 max-w-xl text-lg leading-relaxed">
              Cinquante missions pour progresser, du collège à l&apos;âge adulte. Une leçon courte, un quiz, un jeu : chaque
              mission validée rapporte de l&apos;XP et fait avancer ta carte. Gratuit, sans publicité.
            </p>
            <div className="eq-cover-actions eq-slam eq-slam-4">
              <Link href="/cours/1" className="eq-btn eq-btn-primary eq-btn-xl">
                Commencer la mission 1
              </Link>
              <Link href="/test-de-niveau" className="eq-text-link">
                Déjà des bases ? Teste ton niveau
              </Link>
            </div>
          </div>

          <div className="eq-cover-art eq-slam eq-slam-3">
            <div className="eq-cover-frame">
              <div className="eq-cover-masthead" aria-hidden="true">
                <b>English Quest</b>
                <span>N° 1</span>
              </div>
              {coverArt ? (
                <Image
                  src={coverArt}
                  alt="Maya et Sam, les deux héros d'English Quest, s'élancent au-dessus de Londres."
                  fill
                  priority
                  sizes="(max-width: 960px) 90vw, 470px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <Burst color="yellow" size={128} rotate={10} spin className="eq-pop-in">
              Gratuit !
            </Burst>
          </div>
        </div>
      </section>

      <section className="eq-band eq-band-blue py-12 md:py-16" aria-labelledby="home-how">
        <div className="eq-container">
          <div className="eq-section-head">
            <div>
              <span className="eq-caption">Comment ça marche</span>
              <h2 id="home-how" className="eq-h2">
                Une mission en trois cases
              </h2>
            </div>
          </div>
          <ol className="eq-strip">
            {steps.map((step) => (
              <li key={step.title} className="eq-strip-panel eq-reveal">
                <div className="eq-strip-art">
                  <span className="eq-caption">{step.label}</span>
                  <Mascot pose={step.pose} size={170} />
                </div>
                <div className="eq-strip-body">
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="eq-container py-12 md:py-16" aria-labelledby="home-path">
        <div className="eq-section-head">
          <div>
            <span className="eq-caption eq-caption-red">La collection</span>
            <h2 id="home-path" className="eq-h2">
              Cinq numéros, de A1 à B1+
            </h2>
          </div>
          <Link href="/quest" className="eq-text-link">
            Voir la carte des missions
          </Link>
        </div>
        <ol className="eq-issues">
          {chapters.map((chapter) => {
            const cover = resolveArt(chapter.artSrc);
            return (
              <li key={chapter.id} className="eq-reveal">
                <Link href={`/quest#chapitre-${chapter.id}`} className="eq-issue">
                  <span className="eq-issue-top">
                    N° {chapter.id}
                    <span>{chapter.level.split(" - ")[0]}</span>
                  </span>
                  <span className="eq-issue-cover">
                    {cover ? (
                      <Image src={cover} alt="" fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover" />
                    ) : null}
                  </span>
                  <span className="eq-issue-body">
                    <b>{chapter.name}</b>
                    <span>{chapter.tagline}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="eq-band eq-band-red py-12 md:py-16" aria-labelledby="home-games">
        <div className="eq-container">
          <div className="eq-section-head">
            <div>
              <span className="eq-caption">Salle d&apos;entraînement</span>
              <h2 id="home-games" className="eq-h2">
                Sept jeux pour devenir imbattable
              </h2>
            </div>
            <Link href="/play" className="eq-text-link">
              Tous les jeux
            </Link>
          </div>
          <div className="eq-games-grid">
            {games.map((game, index) => (
              <GameCard
                key={game.slug}
                game={game}
                artSrc={resolveArt(getGamePresentation(game).artworkSrc)}
                priority={index < 4}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="eq-container py-12 md:py-16">
        <div className="eq-mascot-row eq-reveal">
          <Mascot pose="maya-salut" size={150} />
          <Bubble tail="left" className="max-w-xl">
            Tu es prof ? Crée une classe, donne des missions en devoir et suis la progression de tes élèves.{" "}
            <Link href="/profs" className="underline decoration-2 underline-offset-4">
              Découvrir l&apos;espace prof
            </Link>
          </Bubble>
        </div>
      </section>
    </div>
  );
}
