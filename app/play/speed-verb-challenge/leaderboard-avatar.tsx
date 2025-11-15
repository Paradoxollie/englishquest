"use client";

/**
 * Simple Avatar Component for Leaderboards
 * Displays user avatar with background from equipped items
 */

import type { ShopItem } from "@/types/shop";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";

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
  
  // Normalize to handle undefined/null
  const avatar = equippedAvatar ?? null;
  const background = equippedBackground ?? null;
  const title = equippedTitle ?? null;

  return (
    <div
      className={`relative flex items-center justify-center rounded-full border-2 border-black ${classes.container} ${
        background?.image_url
          ? "bg-cover bg-center"
          : background?.color_theme
          ? getItemColor(background.color_theme)
          : "bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border-emerald-800/40"
      }`}
      style={
        background?.image_url
          ? { backgroundImage: `url(${addCacheBustingIfSupabase(background.image_url)})` }
          : undefined
      }
    >
      {avatar?.image_url ? (
        <img
          src={addCacheBustingIfSupabase(avatar.image_url)}
          alt={avatar.name || username}
          className={`rounded-full border-2 border-black object-cover ${classes.avatar}`}
          style={{ objectPosition: "center top" }}
        />
      ) : avatar?.color_theme ? (
        <div
          className={`rounded-full border-2 border-black ${getItemColor(avatar.color_theme)} ${classes.avatar}`}
        />
      ) : (
        <span className={`font-bold text-white text-outline ${classes.text}`}>
          {username.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

