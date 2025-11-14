import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGameBySlug, difficultyColors } from "@/lib/games/config";

// TODO: Later, fetch game data from Supabase games table
// For now, using static config from lib/games/config.ts

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  // Vérifier si l'utilisateur est connecté
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/play"
            className="comic-button bg-slate-800 text-white px-4 py-2 font-bold hover:bg-slate-700 inline-flex items-center gap-2"
          >
            ← Retour aux jeux
          </Link>
        </div>

        {/* Game Header */}
        <div className="comic-panel-dark mb-8 p-8">
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-4">
              <div className={`comic-panel ${game.iconBg} border-2 border-black p-4 text-4xl`}>
                {game.icon}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white md:text-5xl mb-2 text-outline">
                  {game.name}
                </h1>
                <span
                  className={`comic-panel ${difficultyColors[game.difficulty]} border-2 border-black px-3 py-1 text-sm font-bold text-white text-outline`}
                >
                  {game.difficulty === "easy" ? "Easy" : game.difficulty === "medium" ? "Medium" : "Hard"}
                </span>
              </div>
            </div>
            <p className="text-lg text-slate-300 font-semibold mb-4 text-outline">
              {game.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="comic-panel bg-slate-700 border-2 border-black px-3 py-1 text-xs font-bold text-white text-outline"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="comic-panel-dark p-8">
          <div className="relative z-10 text-center">
            <div className="mb-6 text-6xl">🚧</div>
            <h2 className="text-2xl font-bold text-white mb-4 text-outline">
              Ce jeu n'est pas encore implémenté
            </h2>
            <p className="text-lg text-slate-300 font-semibold mb-6 text-outline">
              Ce jeu sera bientôt disponible. Vous pourrez gagner de l'XP et de l'or en y jouant.
            </p>
            {!isLoggedIn && (
              <>
                <p className="text-sm text-amber-300 font-bold mb-6 text-outline">
                  💡 Connectez-vous pour être notifié quand ce jeu sera disponible.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/auth/signup"
                    className="comic-button bg-emerald-600 text-white px-6 py-3 font-bold hover:bg-emerald-700"
                  >
                    Créer mon compte
                  </Link>
                  <Link
                    href="/auth/login"
                    className="comic-button bg-slate-800 text-white px-6 py-3 font-bold hover:bg-slate-700"
                  >
                    Se connecter
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TODO: Replace the "Coming Soon" section above with the actual game component */}
        {/* Example structure for future implementation:
        
        <GameComponent 
          gameSlug={game.slug}
          userId={user?.id} // Get from auth
          onScoreUpdate={(score) => {
            // Save to Supabase game_scores table
            // Update user XP and gold
          }}
        />
        
        */}
      </div>
    </div>
  );
}

