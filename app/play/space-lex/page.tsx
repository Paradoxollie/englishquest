import { gameMetadata } from "@/lib/site/metadata";
import { unstable_cache } from "next/cache";
import { GameBoard } from "@/components/play/game-board";
import { GameShell } from "@/components/play/game-shell";
import { getMissionForGame } from "@/lib/courses/mission-for-game";
import { getGameBySlug } from "@/lib/games/config";
import { getPlayerGameLevel } from "@/lib/games/player-level-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { SpaceLexGame } from "./space-lex-game";

const SLUG = "space-lex";

export const metadata = gameMetadata(
  SLUG,
  "Vocabulaire anglais dans l’espace · Lexicon Blaster",
  "Un shooter spatial où l'on tire sur les bons mots : thèmes, connecteurs, synonymes, et des boss. Consignes en français pour les débutants.",
);

export const dynamic = "force-dynamic";

const getDefaultShipSkinImageUrl = unstable_cache(
  async (): Promise<string | null> => {
    try {
      const adminClient = createSupabaseAdminClient();
      const { data: defaultSkin } = await adminClient
        .from("shop_items")
        .select("image_url")
        .eq("item_type", "ship_skin")
        .eq("is_active", true)
        .eq("is_public", true)
        .eq("price_gold", 0)
        .eq("required_level", 1)
        .order("display_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      return defaultSkin?.image_url ?? null;
    } catch {
      return null;
    }
  },
  ["default-public-starter-ship"],
  { revalidate: 3600, tags: ["shop-catalogue"] }
);

async function loadShipSkinImageUrl(userId: string | null): Promise<string | null> {
  try {
    if (userId) {
      const adminClient = createSupabaseAdminClient();
      const { data: equipped } = await adminClient
        .from("user_equipped_items")
        .select("equipped_ship_skin:shop_items!equipped_ship_skin_id(image_url)")
        .eq("user_id", userId)
        .maybeSingle();
      const skin = Array.isArray(equipped?.equipped_ship_skin)
        ? equipped.equipped_ship_skin[0]
        : equipped?.equipped_ship_skin;
      if (skin?.image_url) {
        return skin.image_url;
      }
    }
    return await getDefaultShipSkinImageUrl();
  } catch {
    return null;
  }
}

export default async function SpaceLexPage() {
  const game = getGameBySlug(SLUG);
  if (!game) {
    return null;
  }

  const user = await getServerUser();
  const userId = user?.id ?? null;
  const [mission, suggestedLevel, initialShipSkinImageUrl] = await Promise.all([
    getMissionForGame(userId, SLUG),
    getPlayerGameLevel(userId),
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
        suggestedLevel={suggestedLevel}
      />
    </GameShell>
  );
}
