"use client";

/**
 * Simple Avatar Component for Leaderboards
 * Displays user avatar with background from equipped items
 */

import type { ShopItem } from "@/types/shop";

interface LeaderboardAvatarProps {
  userId: string;
  username: string;
  equippedAvatar?: ShopItem | null;
  equippedBackground?: ShopItem | null;
  equippedTitle?: ShopItem | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const getItemColor = (theme: string | null) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    gold: "bg-yellow-500",
    dark: "bg-slate-800",
    slate: "bg-slate-600",
    cyan: "bg-cyan-500",
  };
  return colors[theme || "slate"] || "bg-slate-500";
};

export function LeaderboardAvatar({ 
  userId, 
  username, 
  equippedAvatar, 
  equippedBackground,
  equippedTitle,
  size = "md" 
}: LeaderboardAvatarProps) {
  const sizeClasses = {
    sm: { container: "h-16 w-16", avatar: "h-14 w-14", text: "text-base" },
    md: { container: "h-20 w-20", avatar: "h-16 w-16", text: "text-lg" },
    lg: { container: "h-24 w-24", avatar: "h-20 w-20", text: "text-xl" },
    xl: { container: "h-28 w-28", avatar: "h-24 w-24", text: "text-2xl" },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-full border-2 border-black ${classes.container} ${
        equippedBackground?.image_url
          ? "bg-cover bg-center"
          : equippedBackground?.color_theme
          ? getItemColor(equippedBackground.color_theme)
          : "bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border-emerald-800/40"
      }`}
      style={
        equippedBackground?.image_url
          ? { backgroundImage: `url(${equippedBackground.image_url})` }
          : undefined
      }
    >
      {equippedAvatar?.image_url ? (
        <img
          src={equippedAvatar.image_url}
          alt={equippedAvatar.name}
          className={`rounded-full border-2 border-black object-cover ${classes.avatar}`}
          style={{ objectPosition: "center top" }}
        />
      ) : equippedAvatar?.color_theme ? (
        <div
          className={`rounded-full border-2 border-black ${getItemColor(equippedAvatar.color_theme)} ${classes.avatar}`}
        />
      ) : (
        <span className={`font-bold text-white text-outline ${classes.text}`}>
          {username.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

