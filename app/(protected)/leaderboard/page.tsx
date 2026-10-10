import type { Metadata } from "next";
import { redirect } from "next/navigation";
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

  const { data: games } = await supabase.from("games").select("id, slug, name, description").order("name");
  const order = new Map(gameCatalog.map((game, index) => [game.slug, index]));
  const sorted = (games ?? []).sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));

  return (
    <div className="eq-container eq-section">
      <header className="eq-page-head">
        <p className="eq-kicker">Classements</p>
        <h1 className="eq-h1">Les meilleurs scores</h1>
        <p className="eq-lead">
          Un classement par jeu et par difficulté. Seul ton meilleur score compte, et il faut une partie pour y figurer.
        </p>
      </header>
      <GameLeaderboard games={sorted} currentUserId={user.id} />
    </div>
  );
}
