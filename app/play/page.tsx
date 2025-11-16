import Link from "next/link";
import { MotionCard } from "@/components/ui/motion-card";
import { GameIcon } from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { games, difficultyColors } from "@/lib/games/config";

// TODO: Later, fetch real game data from Supabase games table
// For now, using static config from lib/games/config.ts
// This config is used for UI rendering only. Actual game data
// (for scores, statistics, etc.) will come from the database.

export default async function PlayPage() {
  // Vérifier si l'utilisateur est connecté
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-6 md:p-8">
        {/* Hero Section */}
        <div className="comic-panel-dark mb-12 p-8" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}>
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-4">
              <div className="comic-panel bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-black p-4">
                <GameIcon className="w-8 h-8 text-white text-outline" />
              </div>
              <h1 className="text-4xl font-bold text-white md:text-5xl text-outline">
                Choose your challenge.
              </h1>
            </div>
            <p className="mb-4 text-lg text-slate-200 font-semibold text-outline">
              Essayez différents jeux pour améliorer votre vocabulaire, grammaire, écoute et orthographe.
              Chaque jeu vous propose des défis adaptés à votre niveau.
            </p>
            {!isLoggedIn && (
              <p className="text-sm text-amber-300 font-bold text-outline">
                💡 Connectez-vous pour sauvegarder vos scores et gagner de l'XP et de l'or.
              </p>
            )}
          </div>
        </div>

        {/* Call to Action for non-logged users */}
        {!isLoggedIn && (
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
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
        )}

        {/* Games Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <MotionCard key={game.slug}>
              <Link href={`/play/${game.slug}`}>
                <div className="comic-card-dark h-full p-6 group" style={{ background: game.gradient }}>
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
                    style={{ 
                      background: game.gradient.replace('0.2', '0.3').replace('0.2', '0.3')
                    }} 
                  />
                  <div className="relative z-10">
                    {/* Game Icon and Name */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`comic-panel ${game.iconBg} border-2 border-black p-3 text-2xl`}>
                        {game.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-white text-outline">{game.name}</h2>
                    </div>

                    {/* Description */}
                    <p className="mb-4 text-slate-200 font-semibold leading-relaxed text-outline">
                      {game.description}
                    </p>

                    {/* Tags */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {game.tags.map((tag, tagIndex) => {
                        const tagColors = [
                          "bg-cyan-600",
                          "bg-purple-600",
                          "bg-pink-600",
                          "bg-indigo-600",
                        ];
                        return (
                          <span
                            key={tag}
                            className={`comic-panel ${tagColors[tagIndex % tagColors.length]} border-2 border-black px-3 py-1 text-xs font-bold text-white text-outline`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-4">
                      <span
                        className={`comic-panel ${difficultyColors[game.difficulty]} border-2 border-black px-3 py-1 text-xs font-bold text-white text-outline`}
                      >
                        {game.difficulty === "easy" ? "Easy" : game.difficulty === "medium" ? "Medium" : "Hard"}
                      </span>
                    </div>

                    {/* Play Button */}
                    <div className="mt-6">
                      <div className="comic-button bg-gradient-to-r from-cyan-600 to-blue-600 text-white w-full text-center px-4 py-3 font-bold hover:from-cyan-700 hover:to-blue-700 text-outline">
                        Jouer →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </MotionCard>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

