import type { ShopItem } from "@/types/shop";

/* Avatar compact pour les classements : fond équipé, image ou initiale. */

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
  username,
  equippedAvatar,
  equippedBackground,
  size = 40,
}: {
  username: string;
  equippedAvatar?: ShopItem | null;
  equippedBackground?: ShopItem | null;
  size?: number;
}) {
  const background = equippedBackground ?? null;
  const avatar = equippedAvatar ?? null;
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
    <span className="eq-avatar" style={style} aria-hidden="true">
      {avatar?.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar.image_url} alt="" />
      ) : avatar?.color_theme ? (
        <i style={{ background: themeColor(avatar.color_theme) }} />
      ) : (
        <b>{username.charAt(0).toUpperCase()}</b>
      )}
    </span>
  );
}
