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
      <div className="mx-auto max-w-7xl px-2 md:px-6 py-4 md:py-12">
        <div className="comic-panel-dark w-full p-3 md:p-8">
        {/* Hero Section */}
        <div className="comic-panel-dark mb-6 md:mb-12 p-4 md:p-8" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}>
          <div className="relative z-10">
            <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
              <div className="comic-panel bg-gradient-to-br from-cyan-500 to-blue-600 border-2 md:border-4 border-black p-2 md:p-4 flex-shrink-0">
                <GameIcon className="w-5 h-5 md:w-8 md:h-8 text-white text-outline" />
              </div>
              <h1 className="text-xl md:text-5xl font-bold text-white text-outline leading-tight md:leading-normal break-words min-w-0 flex-1">
                Choose your challenge.
              </h1>
            </div>
            <p className="mb-3 md:mb-4 text-sm md:text-lg text-slate-200 font-semibold text-outline leading-tight md:leading-normal break-words">
              Essayez différents jeux pour améliorer votre vocabulaire, grammaire, écoute et orthographe.
              Chaque jeu vous propose des défis adaptés à votre niveau.
            </p>
            {!isLoggedIn && (
              <p className="text-xs md:text-sm text-amber-300 font-bold text-outline break-words">
                💡 Connectez-vous pour sauvegarder vos scores et gagner de l'XP et de l'or.
              </p>
            )}
          </div>
        </div>

        {/* Call to Action for non-logged users */}
        {!isLoggedIn && (
          <div className="mb-6 md:mb-8 flex flex-wrap gap-2 md:gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="comic-button bg-emerald-600 text-white px-4 py-2 md:px-6 md:py-3 text-xs md:text-base font-bold hover:bg-emerald-700 border-2 md:border-4 border-black whitespace-nowrap"
            >
              Créer mon compte
            </Link>
            <Link
              href="/auth/login"
              className="comic-button bg-slate-800 text-white px-4 py-2 md:px-6 md:py-3 text-xs md:text-base font-bold hover:bg-slate-700 border-2 md:border-4 border-black whitespace-nowrap"
            >
              Se connecter
            </Link>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <MotionCard key={game.slug}>
              <Link href={`/play/${game.slug}`}>
                <div className="comic-card-dark h-full p-4 md:p-6 group" style={{ background: game.gradient }}>
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
                    style={{ 
                      background: game.gradient.replace('0.2', '0.3').replace('0.2', '0.3')
                    }} 
                  />
                  <div className="relative z-10">
                    {/* Game Icon and Name */}
                    <div className="mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                      <div className={`comic-panel ${game.iconBg} border-2 md:border-4 border-black p-2 md:p-3 text-lg md:text-2xl flex-shrink-0`}>
                        {game.icon}
                      </div>
                      <h2 className="text-lg md:text-2xl font-bold text-white text-outline leading-tight md:leading-normal break-words min-w-0 flex-1">{game.name}</h2>
                    </div>

                    {/* Description */}
                    <p className="mb-3 md:mb-4 text-xs md:text-base text-slate-200 font-semibold leading-tight md:leading-relaxed text-outline break-words">
                      {game.description}
                    </p>

                    {/* Tags */}
                    <div className="mb-3 md:mb-4 flex flex-wrap gap-1.5 md:gap-2">
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
                            className={`comic-panel ${tagColors[tagIndex % tagColors.length]} border-2 border-black px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold text-white text-outline`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-3 md:mb-4">
                      <span
                        className={`comic-panel ${difficultyColors[game.difficulty]} border-2 border-black px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold text-white text-outline`}
                      >
                        {game.difficulty === "easy" ? "Easy" : game.difficulty === "medium" ? "Medium" : "Hard"}
                      </span>
                    </div>

                    {/* Play Button */}
                    <div className="mt-4 md:mt-6">
                      <div className="comic-button bg-gradient-to-r from-cyan-600 to-blue-600 text-white w-full text-center px-3 py-2 md:px-4 md:py-3 text-xs md:text-base font-bold hover:from-cyan-700 hover:to-blue-700 text-outline border-2 md:border-4 border-black">
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

