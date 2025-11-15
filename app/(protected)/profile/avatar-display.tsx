"use client";

/**
 * Avatar Display Component - Affiche l'avatar avec les items équipés
 */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserEquippedItems, ShopItem } from "@/types/shop";

interface AvatarDisplayProps {
  userId: string;
  username: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarDisplay({ userId, username, size = "md" }: AvatarDisplayProps) {
  const [equippedItems, setEquippedItems] = useState<UserEquippedItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createSupabaseBrowserClient();
      const { data: equipped } = await supabase
        .from("user_equipped_items")
        .select(`
          *,
          equipped_avatar:shop_items!equipped_avatar_id(*),
          equipped_background:shop_items!equipped_background_id(*)
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (equipped) setEquippedItems(equipped as any);
      setLoading(false);
    }

    loadData();
    
    // Listen for custom events to refresh when items are equipped
    const handleEquipEvent = () => {
      loadData();
    };
    
    window.addEventListener('itemEquipped', handleEquipEvent);
    
    return () => {
      window.removeEventListener('itemEquipped', handleEquipEvent);
    };
  }, [userId]);

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

  if (loading) {
    const sizeClasses = {
      sm: "h-12 w-12 text-xl",
      md: "h-16 w-16 text-2xl",
      lg: "h-24 w-24 text-4xl",
    };
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border-2 border-emerald-800/40 ${sizeClasses[size]}`}
      >
        <span className="font-bold text-emerald-400">{username.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  const currentAvatar = equippedItems?.equipped_avatar;
  const currentBackground = equippedItems?.equipped_background;

  const sizeClasses = {
    sm: { container: "h-12 w-12", avatar: "h-10 w-10", text: "text-xl" },
    md: { container: "h-16 w-16", avatar: "h-14 w-14", text: "text-2xl" },
    lg: { container: "h-24 w-24", avatar: "h-20 w-20", text: "text-4xl" },
  };

  const classes = sizeClasses[size];

  // For header, use a square format but maintain portrait aspect for avatar
  return (
    <div
      className={`relative flex items-center justify-center rounded-full border-2 border-black ${classes.container} ${
        currentBackground?.image_url
          ? "bg-cover bg-center"
          : currentBackground?.color_theme
          ? getItemColor(currentBackground.color_theme)
          : "bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border-emerald-800/40"
      }`}
      style={
        currentBackground?.image_url
          ? { backgroundImage: `url(${currentBackground.image_url})` }
          : undefined
      }
    >
      {currentAvatar?.image_url ? (
        <img
          src={currentAvatar.image_url}
          alt={currentAvatar.name}
          className={`rounded-full border-2 border-black object-cover ${classes.avatar}`}
          style={{ objectPosition: "center top" }}
        />
      ) : currentAvatar?.color_theme ? (
        <div
          className={`rounded-full border-2 border-black ${getItemColor(currentAvatar.color_theme)} ${classes.avatar}`}
        />
      ) : (
        <span className={`font-bold text-white text-outline ${classes.text}`}>
          {username.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

