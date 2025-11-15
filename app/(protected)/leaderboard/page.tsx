import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GameLeaderboard } from "./components/game-leaderboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Récupérer tous les jeux disponibles
  const { data: games } = await supabase
    .from("games")
    .select("id, slug, name, description")
    .order("name");

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Hero Section */}
        <div className="comic-panel-dark mb-8 p-6" style={{ background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)" }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="comic-panel bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-black p-4">
              <span className="text-4xl">🏆</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white text-outline">
                Classements
              </h1>
              <p className="text-slate-300 text-outline font-semibold mt-1">
                Découvre où tu te situes parmi les meilleurs joueurs
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard Component */}
        <GameLeaderboard games={games || []} />
      </div>
    </div>
  );
}

