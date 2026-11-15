import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
import { GameCard } from "@/components/play/game-card";
import { chapters } from "@/lib/courses/chapters";
import { games } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";
import { getServerUser } from "@/lib/supabase/auth-cache";

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
            <h1 className="eq-h1">Apprends l&apos;anglais, une mission après l&apos;autre.</h1>
            <p className="eq-lead">
              Une leçon courte, un quiz, un jeu. Cinquante missions de A1 à B1+, gratuites et sans publicité, à faire
              en classe ou chez toi.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              <Link href="/cours/1" className="eq-btn eq-btn-primary eq-btn-lg">
                Commencer la mission 1
              </Link>
              <Link href="/test-de-niveau" className="eq-text-link">
                Tu as déjà des bases ? Teste ton niveau
              </Link>
            </div>
          </div>

          {heroArt ? (
            <div className="eq-comic-panel">
              <div className="eq-comic-panel-media">
                <Image
                  src={heroArt}
                  alt="Maya et Sam, les deux élèves d'English Quest, partent à l'aventure dans une rue de Londres."
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="eq-container eq-section" aria-labelledby="home-path">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="home-path" className="eq-h2">
            Cinq chapitres, de A1 à B1+
          </h2>
          <Link href="/quest" className="eq-text-link">
            Voir la carte
          </Link>
        </div>
        <ol className="eq-chapter-strip mt-6">
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <Link href={`/quest#chapitre-${chapter.id}`} className="eq-chapter-tile eq-card-link">
                <span className="eq-chapter-tile-level">{chapter.level.split(" - ")[0]}</span>
                <span className="eq-chapter-tile-name">{chapter.name}</span>
                <span className="eq-chapter-tile-copy">{chapter.tagline}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="eq-container pb-14 md:pb-20" aria-labelledby="home-games">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="home-games" className="eq-h2">
            Et pour t&apos;entraîner : sept jeux
          </h2>
          <Link href="/play" className="eq-text-link">
            Tous les jeux
          </Link>
        </div>
        <div className="eq-games-grid mt-6">
          {games.map((game, index) => (
            <GameCard
              key={game.slug}
              game={game}
              artSrc={resolveArt(getGamePresentation(game).artworkSrc)}
              priority={index < 4}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
