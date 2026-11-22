import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mascot } from "@/components/comic/mascot";
import { GameCard } from "@/components/play/game-card";
import { CollectionInvitation } from "@/components/rewards/collection-invitation";
import { ART } from "@/lib/art";
import { publicPageMetadata } from "@/lib/site/metadata";
import { resolveArt } from "@/lib/art-server";
import { chapters } from "@/lib/courses/chapters";
import { games } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";
import { getServerUser } from "@/lib/supabase/auth-cache";

export const metadata = publicPageMetadata({
  path: "/",
  title: "Apprendre l’anglais en jouant",
  description: "Des jeux gratuits, des cours et des quiz pour progresser en anglais du niveau A1 au niveau B1+. Commence sans compte avec une activité de quelques minutes.",
});

const steps = [
  {
    pose: "maya-explique",
    title: "Lis la leçon",
    copy: "Une règle claire, des exemples, les pièges des francophones. Cinq minutes.",
  },
  {
    pose: "sam-bravo",
    title: "Réussis le quiz",
    copy: "Dix questions. À 80 %, la mission est validée et la suivante s'ouvre.",
  },
  {
    pose: "duo-victoire",
    title: "Entraîne-toi en jouant",
    copy: "Neuf jeux pour fixer le vocabulaire, la grammaire, les verbes irréguliers, l'orthographe et l'écoute.",
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

      <section className="eq-home-hero-pro">
        <div className="eq-container eq-home-hero-grid">
          <div className="eq-home-hero-text">
            <span className="eq-caption eq-slam">Anglais, du niveau A1 au niveau B1+</span>
            <h1 className="eq-cover-title is-home eq-slam eq-slam-2">
              Progresse en anglais, une mission après l&apos;autre.
            </h1>
            <p className="eq-lead eq-slam eq-slam-3">
              Cinquante missions courtes : une leçon, un quiz, un jeu. Chaque mission validée te fait avancer sur ton
              parcours, du collège à l&apos;âge adulte.
            </p>
            <div className="eq-home-actions-row eq-slam eq-slam-4">
              <Link href="/cours/1" className="eq-btn eq-btn-primary eq-btn-xl">
                Commencer la mission 1
              </Link>
              <Link href="/test-de-niveau" className="eq-btn eq-btn-ghost eq-btn-xl">
                Tester mon niveau
              </Link>
            </div>
            <p className="eq-home-note eq-slam eq-slam-4">
              Gratuit, sans publicité.{" "}
              <Link href="/essayer" className="eq-text-link">
                Essayer un défi sans compte
              </Link>{" · "}
              <Link href="/auth/login" className="eq-text-link">
                J&apos;ai déjà un compte
              </Link>
            </p>
          </div>

          {coverArt ? (
            <div className="eq-home-hero-art eq-slam eq-slam-3">
              <Image
                src={coverArt}
                alt="Maya et Sam, les deux héros d'English Quest, s'élancent au-dessus de Londres."
                fill
                priority
                sizes="(max-width: 960px) 90vw, 460px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="eq-container pb-10" aria-label="English Quest en chiffres">
        <ul className="eq-figures">
          <li>
            <b>50</b>
            <span>leçons de grammaire, chacune avec son quiz</span>
          </li>
          <li>
            <b>5</b>
            <span>chapitres, du niveau A1 au niveau B1+</span>
          </li>
          <li>
            <b>{games.length}</b>
            <span>jeux pour s&apos;entraîner</span>
          </li>
          <li>
            <b>0 €</b>
            <span>gratuit et sans publicité</span>
          </li>
        </ul>
      </section>

      <section className="eq-section-pro is-alt" aria-labelledby="home-how">
        <div className="eq-container">
          <div className="eq-section-head">
            <div>
              <span className="eq-caption">Comment ça marche</span>
              <h2 id="home-how" className="eq-h2">
                Une mission, trois étapes
              </h2>
            </div>
          </div>
          <ol className="eq-steps-pro">
            {steps.map((step, index) => (
              <li key={step.title} className="eq-step-pro eq-reveal">
                <div className="eq-step-pro-art">
                  <Mascot pose={step.pose} size={180} />
                </div>
                <div className="eq-step-pro-body">
                  <span className="eq-step-pro-num">Étape {index + 1}</span>
                  <h3 className="eq-h3">{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CollectionInvitation />

      <section className="eq-section-pro" aria-labelledby="home-path">
        <div className="eq-container">
          <div className="eq-section-head">
            <div>
              <span className="eq-caption">Le parcours</span>
              <h2 id="home-path" className="eq-h2">
                Cinq chapitres, de A1 à B1+
              </h2>
            </div>
            <Link href="/tous-les-cours/parcours" className="eq-text-link">
              Voir la carte des missions
            </Link>
          </div>
          <ol className="eq-issues">
            {chapters.map((chapter) => {
              const cover = resolveArt(chapter.artSrc);
              return (
                <li key={chapter.id} className="eq-reveal">
                  <Link href={`/tous-les-cours/parcours#chapitre-${chapter.id}`} className="eq-issue">
                    <span className="eq-issue-cover">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          loading="eager"
                          sizes="(max-width: 640px) 50vw, 240px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="eq-issue-body">
                      <span className="eq-issue-meta">
                        Chapitre {chapter.id} · {chapter.level.split(" - ")[0]}
                      </span>
                      <b>{chapter.name}</b>
                      <span>{chapter.tagline}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="eq-section-pro is-alt" aria-labelledby="home-games">
        <div className="eq-container">
          <div className="eq-section-head">
            <div>
              <span className="eq-caption">Entraînement</span>
              <h2 id="home-games" className="eq-h2">
                Neuf jeux pour s&apos;entraîner
              </h2>
            </div>
            <Link href="/play" className="eq-text-link">
              Tous les jeux
            </Link>
          </div>
          <div className="eq-games-grid">
            {games.map((game) => (
              <GameCard
                key={game.slug}
                game={game}
                artSrc={resolveArt(getGamePresentation(game).artworkSrc)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="eq-section-pro">
        <div className="eq-container">
          <div className="eq-teacher-cta eq-reveal">
            <div className="grid gap-1">
              <h2 className="eq-h3">Vous êtes enseignant ?</h2>
              <p>Créez une classe, donnez des missions en devoir et suivez la progression de vos élèves.</p>
            </div>
            <Link href="/profs" className="eq-btn eq-btn-ghost">
              Découvrir l&apos;espace prof
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
