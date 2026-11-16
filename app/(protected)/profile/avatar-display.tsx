"use client";

/**
 * Avatar Display Component - Affiche l'avatar avec les items équipés
 */

import { useEffect, useState } from "react";
import { ShopClassArt } from "@/components/ui/game-icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserEquippedItems, ShopItem } from "@/types/shop";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";

interface AvatarDisplayProps {
  userId: string;
  username: string;
  size?: "sm" | "md" | "lg";
  initialEquipped?: UserEquippedItems | null;
}

export function AvatarDisplay({ userId, username, size = "md", initialEquipped }: AvatarDisplayProps) {
  const [equippedItems, setEquippedItems] = useState<UserEquippedItems | null>(initialEquipped ?? null);
  const [loading, setLoading] = useState(initialEquipped === undefined);

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

      if (equipped) {
        // Handle potential array returns from Supabase relations
        const equippedData: any = {
          ...equipped,
          equipped_avatar: Array.isArray(equipped.equipped_avatar) 
            ? equipped.equipped_avatar[0] 
            : equipped.equipped_avatar,
          equipped_background: Array.isArray(equipped.equipped_background) 
            ? equipped.equipped_background[0] 
            : equipped.equipped_background,
        };
        setEquippedItems(equippedData);
      }
      setLoading(false);
    }

    if (initialEquipped === undefined) {
      loadData();
    }
    
    // Listen for custom events to refresh when items are equipped
    const handleEquipEvent = () => {
      loadData();
    };
    
    window.addEventListener('itemEquipped', handleEquipEvent);
    
    return () => {
      window.removeEventListener('itemEquipped', handleEquipEvent);
    };
  }, [userId, initialEquipped]);

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
        className={`flex items-center justify-center rounded-full border-2 border-[var(--ink-rule)] bg-[var(--ink-2)] text-[var(--fg)] ${sizeClasses[size]}`}
      >
        <span className="font-bold">{username.charAt(0).toUpperCase()}</span>
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
      className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--pro-border-strong)] ${classes.container} ${
        currentBackground?.image_url
          ? "bg-cover bg-center"
          : currentBackground?.item_key
          ? "bg-[var(--pro-surface-2)]"
          : currentBackground?.color_theme
          ? getItemColor(currentBackground.color_theme)
          : "bg-[var(--pro-surface-2)]"
      }`}
      style={
        currentBackground?.image_url
          ? { backgroundImage: `url(${addCacheBustingIfSupabase(currentBackground.image_url)})` }
          : undefined
      }
    >
      {!currentBackground?.image_url && currentBackground?.item_key ? (
        <div className="pointer-events-none absolute inset-0">
          <ShopClassArt
            itemKey={currentBackground.item_key}
            itemType="background"
            name={currentBackground.name}
          />
        </div>
      ) : null}
      {currentAvatar?.image_url ? (
        <img
          src={addCacheBustingIfSupabase(currentAvatar.image_url)}
          alt={currentAvatar.name}
          className={`relative z-10 rounded-full border border-[var(--pro-border-strong)] object-cover ${classes.avatar}`}
          style={{ objectPosition: "center top" }}
        />
      ) : currentAvatar?.item_key ? (
        <div className={`relative z-10 overflow-hidden rounded-full border border-[var(--pro-border-strong)] ${classes.avatar}`}>
          <ShopClassArt itemKey={currentAvatar.item_key} itemType="avatar" name={currentAvatar.name} />
        </div>
      ) : currentAvatar?.color_theme ? (
        <div
          className={`relative z-10 rounded-full border border-[var(--pro-border-strong)] ${getItemColor(currentAvatar.color_theme)} ${classes.avatar}`}
        />
      ) : (
        <span className={`relative z-10 font-bold text-[var(--pro-text)] ${classes.text}`}>
          {username.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

