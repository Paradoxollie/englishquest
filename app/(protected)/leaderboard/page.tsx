import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WeeklyLeagueSection } from "@/components/rewards/weekly-league";
import { getWeeklyLeague } from "@/lib/profile/league-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { games as gameCatalog } from "@/lib/games/config";
import { GameLeaderboard } from "./components/game-leaderboard";

export const metadata: Metadata = { title: "Classements" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: games }, league] = await Promise.all([
    supabase.from("games").select("id, slug, name, description").order("name"),
    getWeeklyLeague(user.id),
  ]);
  const order = new Map(gameCatalog.map((game, index) => [game.slug, index]));
  const sorted = (games ?? []).sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));

  return (
    <div className="eq-container eq-section">
      <header className="eq-page-head">
        <p className="eq-kicker">Classements</p>
        <h1 className="eq-h1">Ligue et records</h1>
        <p className="eq-lead">
          Chaque semaine, une ligue repart de zéro : l&apos;XP gagnée depuis lundi compte. En dessous, les records de chaque
          jeu.
        </p>
      </header>

      <WeeklyLeagueSection league={league} currentUserId={user.id} />

      <section className="eq-records" aria-labelledby="records-title">
        <div className="eq-home-section-head">
          <div>
            <p className="eq-kicker">Records par jeu</p>
            <h2 id="records-title" className="eq-h2">
              Les meilleurs scores
            </h2>
          </div>
        </div>
        <p className="eq-muted eq-records-note">
          Un classement par jeu et par difficulté. Seul ton meilleur score compte, et il faut une partie pour y figurer.
        </p>
        <GameLeaderboard games={sorted} currentUserId={user.id} />
      </section>
    </div>
  );
}
