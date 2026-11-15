import type { Metadata } from "next";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SpaceLexGame } from "./space-lex-game";

export const metadata: Metadata = {
  title: "Lexicon Blaster",
  description: "Un shooter spatial où l'on tire sur les bons mots : familles de mots, connecteurs, synonymes, et des boss.",
};

export const dynamic = "force-dynamic";

const SLUG = "space-lex";

async function loadShipSkinImageUrl(userId: string | null): Promise<string | null> {
  try {
    const adminClient = createSupabaseAdminClient();
    if (userId) {
      const { data: equipped } = await adminClient
        .from("user_equipped_items")
        .select("equipped_ship_skin_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (equipped?.equipped_ship_skin_id) {
        const { data: skinItem } = await adminClient
          .from("shop_items")
          .select("image_url")
          .eq("id", equipped.equipped_ship_skin_id)
          .maybeSingle();
        if (skinItem?.image_url) {
          return skinItem.image_url;
        }
      }
    }
    const { data: defaultSkin } = await adminClient
      .from("shop_items")
      .select("image_url")
      .eq("item_type", "ship_skin")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    return defaultSkin?.image_url ?? null;
  } catch {
    return null;
  }
}

export default async function SpaceLexPage() {
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  const [mission, initialShipSkinImageUrl] = await Promise.all([
    getMissionForGame(userId, SLUG),
    loadShipSkinImageUrl(userId),
  ]);

  return (
    <GameShell
      game={game}
      mission={mission}
      isLoggedIn={Boolean(user)}
      aside={<GameBoard slug={SLUG} userId={userId} buckets={[{ key: "all", label: "Tous" }]} />}
    >
      <SpaceLexGame
        isLoggedIn={Boolean(user)}
        missionTarget={mission && mission.quizPassed && !mission.alreadyReached ? mission.scoreTarget : null}
        initialShipSkinImageUrl={initialShipSkinImageUrl}
      />
    </GameShell>
  );
}
