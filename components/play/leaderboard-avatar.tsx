import type { ShopItem } from "@/types/shop";
import { CharacterFace } from "@/components/rewards/character-face";
import { characterFaceUrl } from "@/lib/shop/characters";

const THEME_COLORS: Record<string, string> = {
  emerald: "#2f9e6b",
  green: "#3d9c5a",
  red: "#c94a4a",
  blue: "#3b6fd1",
  purple: "#7b5bd1",
  gold: "#d7a53b",
  dark: "#1a2236",
  slate: "#4b5872",
  cyan: "#2aa5c6",
};

function themeColor(theme: string | null | undefined) {
  return THEME_COLORS[theme ?? "slate"] ?? THEME_COLORS.slate;
}

export function LeaderboardAvatar({
  equippedAvatar,
  equippedBackground,
  size = 40,
}: {
  equippedAvatar?: ShopItem | null;
  equippedBackground?: ShopItem | null;
  size?: number;
}) {
  const background = equippedBackground ?? null;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    background: background?.image_url
      ? `center / cover url(${background.image_url})`
      : background?.color_theme
        ? themeColor(background.color_theme)
        : "var(--ink-4)",
  };

  return (
    <span className="eq-avatar" style={style} data-backdrop={Boolean(background?.image_url || background?.color_theme) || undefined} aria-hidden="true">
      <CharacterFace src={characterFaceUrl(equippedAvatar)} size={size} />
    </span>
  );
}
