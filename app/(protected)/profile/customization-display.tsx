"use client";

/**
 * Customization Display Component - Affiche l'avatar, titre et background équipés
 */

import { useEffect, useState } from "react";
import { equipItemAction } from "./shop/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserEquippedItems, ShopItem } from "@/types/shop";
import { useRouter } from "next/navigation";

interface CustomizationDisplayProps {
  userId: string;
  username: string;
}

export function CustomizationDisplay({ userId, username }: CustomizationDisplayProps) {
  const router = useRouter();
  const [equippedItems, setEquippedItems] = useState<UserEquippedItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState<{
    avatars: ShopItem[];
    titles: ShopItem[];
    backgrounds: ShopItem[];
  }>({ avatars: [], titles: [], backgrounds: [] });
  const [showSelector, setShowSelector] = useState<"avatar" | "title" | "background" | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      // Load equipped items
      const { data: equipped } = await supabase
        .from("user_equipped_items")
        .select(`
          *,
          equipped_avatar:shop_items!equipped_avatar_id(*),
          equipped_title:shop_items!equipped_title_id(*),
          equipped_background:shop_items!equipped_background_id(*)
        `)
        .eq("user_id", userId)
        .maybeSingle();

      // Load user owned items with proper join
      const { data: owned } = await supabase
        .from("user_items")
        .select(`
          *,
          shop_items(*)
        `)
        .eq("user_id", userId);

      // Load free items (price_gold === 0) - these are automatically available
      const { data: freeItems } = await supabase
        .from("shop_items")
        .select("*")
        .eq("is_active", true)
        .eq("price_gold", 0);

      console.log("CustomizationDisplay - Loaded data:", {
        equipped: equipped,
        ownedCount: owned?.length,
        freeItemsCount: freeItems?.length,
        freeItems: freeItems,
      });

      if (equipped) setEquippedItems(equipped as any);
      
      // Combine owned items and free items
      const ownedItemsList: ShopItem[] = [];
      if (owned) {
        ownedItemsList.push(
          ...owned
            .map((o: any) => {
              const shopItem = Array.isArray(o.shop_items) ? o.shop_items[0] : o.shop_items;
              return shopItem;
            })
            .filter(Boolean)
        );
      }
      if (freeItems) {
        // Add free items, avoiding duplicates
        const ownedIds = new Set(ownedItemsList.map((i: ShopItem) => i.id));
        freeItems.forEach((item: ShopItem) => {
          if (!ownedIds.has(item.id)) {
            ownedItemsList.push(item);
          }
        });
      }
      
      console.log("CustomizationDisplay - Available items:", {
        avatars: ownedItemsList.filter((i: ShopItem) => i?.item_type === "avatar").map((i: ShopItem) => ({ id: i.id, name: i.name })),
        titles: ownedItemsList.filter((i: ShopItem) => i?.item_type === "title").map((i: ShopItem) => ({ id: i.id, name: i.name })),
        backgrounds: ownedItemsList.filter((i: ShopItem) => i?.item_type === "background").map((i: ShopItem) => ({ id: i.id, name: i.name })),
      });
      
      setAvailableItems({
        avatars: ownedItemsList.filter((i: ShopItem) => i?.item_type === "avatar"),
        titles: ownedItemsList.filter((i: ShopItem) => i?.item_type === "title"),
        backgrounds: ownedItemsList.filter((i: ShopItem) => i?.item_type === "background"),
      });
      setLoading(false);
    }

    loadData();
    
    // Listen for custom events to refresh when items are purchased/equipped
    const handleItemEvent = () => {
      loadData();
    };
    
    window.addEventListener('itemEquipped', handleItemEvent);
    window.addEventListener('itemPurchased', handleItemEvent);
    
    return () => {
      window.removeEventListener('itemEquipped', handleItemEvent);
      window.removeEventListener('itemPurchased', handleItemEvent);
    };
  }, [userId]);

  const handleEquip = async (itemId: string | null, type: "avatar" | "title" | "background") => {
    console.log("CustomizationDisplay - Equipping item:", { itemId, type, userId, itemIdType: typeof itemId });
    
    // Ensure we pass null explicitly, not undefined
    const result = await equipItemAction(itemId ?? null, type);
    console.log("CustomizationDisplay - Equip result:", result);
    
    if (result.success) {
      // Reload data immediately
      const supabase = createSupabaseBrowserClient();
      const { data: equipped } = await supabase
        .from("user_equipped_items")
        .select(`
          *,
          equipped_avatar:shop_items!equipped_avatar_id(*),
          equipped_title:shop_items!equipped_title_id(*),
          equipped_background:shop_items!equipped_background_id(*)
        `)
        .eq("user_id", userId)
        .maybeSingle();
      if (equipped) setEquippedItems(equipped as any);
      setShowSelector(null);
      
      // Dispatch event to update avatar display
      window.dispatchEvent(new CustomEvent('itemEquipped'));
      
      // Refresh page to update avatar display
      setTimeout(() => {
        router.refresh();
      }, 300);
    } else {
      console.error("Error equipping item:", result.error);
    }
  };


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
    return (
      <div className="comic-panel-dark p-8 text-center">
        <p className="text-slate-300 text-outline">Chargement...</p>
      </div>
    );
  }

  const currentAvatar = equippedItems?.equipped_avatar;
  const currentTitle = equippedItems?.equipped_title;
  const currentBackground = equippedItems?.equipped_background;

  return (
    <div className="comic-panel-dark p-6 space-y-6" style={{ position: "relative", zIndex: 1 }}>
      <h2 className="text-2xl font-bold text-white text-outline mb-4">Personnalisation</h2>

      {/* Avatar Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white text-outline">Avatar</h3>
          <button
            onClick={() => setShowSelector(showSelector === "avatar" ? null : "avatar")}
            className="comic-button bg-slate-700 text-white px-4 py-2 text-sm font-bold text-outline hover:bg-slate-600"
          >
            {showSelector === "avatar" ? "Fermer" : "Changer"}
          </button>
        </div>

        {/* Avatar Display - Format portrait */}
        <div className="relative" style={{ width: "128px", aspectRatio: "2/3" }}>
          {/* Background */}
          <div
            className={`absolute inset-0 rounded-lg border-4 border-black ${
              currentBackground?.image_url
                ? "bg-cover bg-center"
                : currentBackground?.color_theme
                ? getItemColor(currentBackground.color_theme)
                : "bg-gradient-to-br from-emerald-950/30 to-emerald-900/30"
            }`}
            style={
              currentBackground?.image_url
                ? { backgroundImage: `url(${currentBackground.image_url})` }
                : undefined
            }
          />
          {/* Avatar */}
          <div className="absolute inset-0 flex items-center justify-center p-2">
            {currentAvatar?.image_url ? (
              <img
                src={currentAvatar.image_url}
                alt={currentAvatar.name}
                className="w-full h-full rounded-lg border-2 border-black object-cover"
              />
            ) : currentAvatar?.color_theme ? (
              <div className={`w-full h-full rounded-lg ${getItemColor(currentAvatar.color_theme)} border-2 border-black`} />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-lg bg-slate-800/50 border-2 border-black">
                <span className="text-4xl font-bold text-white text-outline">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {showSelector === "avatar" && (
          <div className="comic-panel bg-slate-800 border-2 border-black p-4" style={{ position: "relative", zIndex: 10 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2" style={{ position: "relative", zIndex: 11 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Aucun avatar clicked");
                  handleEquip(null, "avatar");
                }}
                className={`comic-button px-3 py-2 text-sm font-bold text-outline relative z-10 ${
                  !currentAvatar
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
                style={{ pointerEvents: "auto" }}
              >
                Aucun
              </button>
              {availableItems.avatars.map((avatar) => {
                console.log("Rendering avatar button:", avatar.id, avatar.name);
                return (
                <button
                  key={avatar.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Avatar mousedown:", avatar.id, avatar.name);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Avatar clicked:", avatar.id, avatar.name);
                    handleEquip(avatar.id, "avatar");
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Avatar touchstart:", avatar.id, avatar.name);
                    handleEquip(avatar.id, "avatar");
                  }}
                  className={`comic-button px-3 py-2 text-sm font-bold text-outline relative z-10 ${
                    currentAvatar?.id === avatar.id
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                  style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }}
                >
                  {avatar.image_url ? (
                    <div className="w-full" style={{ aspectRatio: "2/3" }}>
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ) : (
                    avatar.name
                  )}
                </button>
              );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Title Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white text-outline">Titre</h3>
          <button
            onClick={() => setShowSelector(showSelector === "title" ? null : "title")}
            className="comic-button bg-slate-700 text-white px-4 py-2 text-sm font-bold text-outline hover:bg-slate-600"
          >
            {showSelector === "title" ? "Fermer" : "Changer"}
          </button>
        </div>

        <div className="comic-panel bg-slate-800 border-2 border-black p-3 text-center">
          <span className="text-lg font-bold text-cyan-400 text-outline">
            {currentTitle?.name || "Aucun titre"}
          </span>
        </div>

        {showSelector === "title" && (
          <div className="comic-panel bg-slate-800 border-2 border-black p-4" style={{ position: "relative", zIndex: 10 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2" style={{ position: "relative", zIndex: 11 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Aucun title clicked");
                  handleEquip(null, "title");
                }}
                className={`comic-button px-3 py-2 text-sm font-bold text-outline relative z-10 ${
                  !currentTitle
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
                style={{ pointerEvents: "auto" }}
              >
                Aucun
              </button>
              {availableItems.titles.map((title) => {
                console.log("Rendering title button:", title.id, title.name);
                return (
                <button
                  key={title.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Title mousedown:", title.id, title.name);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Title clicked:", title.id, title.name);
                    handleEquip(title.id, "title");
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Title touchstart:", title.id, title.name);
                    handleEquip(title.id, "title");
                  }}
                  className={`comic-button px-3 py-2 text-sm font-bold text-outline relative z-10 ${
                    currentTitle?.id === title.id
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                  style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }}
                >
                  {title.name}
                </button>
              );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Background Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white text-outline">Background</h3>
          <button
            onClick={() => setShowSelector(showSelector === "background" ? null : "background")}
            className="comic-button bg-slate-700 text-white px-4 py-2 text-sm font-bold text-outline hover:bg-slate-600"
          >
            {showSelector === "background" ? "Fermer" : "Changer"}
          </button>
        </div>

        {/* Background Display - Format portrait */}
        <div
          className="rounded-lg border-4 border-black overflow-hidden"
          style={{ aspectRatio: "2/3", width: "100%", maxWidth: "200px" }}
        >
          {currentBackground?.image_url ? (
            <img
              src={currentBackground.image_url}
              alt={currentBackground.name}
              className="w-full h-full object-cover"
            />
          ) : currentBackground?.color_theme ? (
            <div className={`w-full h-full ${getItemColor(currentBackground.color_theme)}`} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <span className="text-white font-bold text-outline">
                {currentBackground?.name || "Défaut"}
              </span>
            </div>
          )}
        </div>

        {showSelector === "background" && (
          <div className="comic-panel bg-slate-800 border-2 border-black p-4" style={{ position: "relative", zIndex: 10 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2" style={{ position: "relative", zIndex: 11 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Aucun background clicked");
                  handleEquip(null, "background");
                }}
                className={`comic-button px-3 py-2 text-sm font-bold text-outline relative z-10 ${
                  !currentBackground
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
                style={{ pointerEvents: "auto" }}
              >
                Aucun
              </button>
              {availableItems.backgrounds.map((bg) => {
                console.log("Rendering background button:", bg.id, bg.name);
                return (
                <button
                  key={bg.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Background mousedown:", bg.id, bg.name);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Background clicked:", bg.id, bg.name);
                    handleEquip(bg.id, "background");
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Background touchstart:", bg.id, bg.name);
                    handleEquip(bg.id, "background");
                  }}
                  className={`comic-button px-3 py-2 text-sm font-bold text-outline relative z-10 ${
                    currentBackground?.id === bg.id
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                  style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }}
                >
                  {bg.image_url ? (
                    <div className="w-full" style={{ aspectRatio: "2/3" }}>
                      <img
                        src={bg.image_url}
                        alt={bg.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ) : (
                    bg.name
                  )}
                </button>
              );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
