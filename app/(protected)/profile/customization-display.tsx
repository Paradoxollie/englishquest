"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";
import { canAutoGrantShopItem } from "@/lib/shop/visibility";
import type { ShopItem, UserEquippedItems } from "@/types/shop";
import { equipItemAction } from "./shop/actions";

interface CustomizationDisplayProps {
  userId: string;
  username: string;
}

function normalizeEquippedItems(equipped: any): UserEquippedItems {
  return {
    ...equipped,
    equipped_avatar: Array.isArray(equipped.equipped_avatar)
      ? equipped.equipped_avatar[0]
      : equipped.equipped_avatar,
    equipped_title: Array.isArray(equipped.equipped_title)
      ? equipped.equipped_title[0]
      : equipped.equipped_title,
    equipped_background: Array.isArray(equipped.equipped_background)
      ? equipped.equipped_background[0]
      : equipped.equipped_background,
  };
}

export function CustomizationDisplay({
  userId,
  username,
}: CustomizationDisplayProps) {
  const router = useRouter();
  const [equippedItems, setEquippedItems] = useState<UserEquippedItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState<{
    avatars: ShopItem[];
    titles: ShopItem[];
    backgrounds: ShopItem[];
  }>({ avatars: [], titles: [], backgrounds: [] });
  const [showSelector, setShowSelector] = useState<
    "avatar" | "title" | "background" | null
  >(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      const [{ data: equipped }, { data: owned }, { data: freeItems }] = await Promise.all([
        supabase
          .from("user_equipped_items")
          .select(
            `
              *,
              equipped_avatar:shop_items!equipped_avatar_id(*),
              equipped_title:shop_items!equipped_title_id(*),
              equipped_background:shop_items!equipped_background_id(*)
            `
          )
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("user_items")
          .select(
            `
              *,
              shop_items(*)
            `
          )
          .eq("user_id", userId),
        supabase
          .from("shop_items")
          .select("*")
          .eq("is_active", true)
          .eq("price_gold", 0),
      ]);

      if (equipped) {
        setEquippedItems(normalizeEquippedItems(equipped));
      } else {
        setEquippedItems(null);
      }

      const ownedItems: ShopItem[] =
        owned
          ?.map((row: any) => {
            const shopItem = Array.isArray(row.shop_items) ? row.shop_items[0] : row.shop_items;
            return shopItem || null;
          })
          .filter(Boolean) ?? [];

      const ownedIds = new Set(ownedItems.map((item) => item.id));
      const defaultItems =
        freeItems?.filter((item: ShopItem) => canAutoGrantShopItem(item)) ?? [];

      for (const item of defaultItems) {
        if (!ownedIds.has(item.id)) {
          ownedItems.push(item);
        }
      }

      setAvailableItems({
        avatars: ownedItems.filter((item) => item.item_type === "avatar"),
        titles: ownedItems.filter((item) => item.item_type === "title"),
        backgrounds: ownedItems.filter((item) => item.item_type === "background"),
      });
      setLoading(false);
    }

    loadData();

    const handleItemEvent = () => {
      loadData();
    };

    window.addEventListener("itemEquipped", handleItemEvent);
    window.addEventListener("itemPurchased", handleItemEvent);

    return () => {
      window.removeEventListener("itemEquipped", handleItemEvent);
      window.removeEventListener("itemPurchased", handleItemEvent);
    };
  }, [userId]);

  const handleEquip = async (
    itemId: string | null,
    type: "avatar" | "title" | "background"
  ) => {
    const result = await equipItemAction(itemId ?? null, type);

    if (!result.success) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: equipped } = await supabase
      .from("user_equipped_items")
      .select(
        `
          *,
          equipped_avatar:shop_items!equipped_avatar_id(*),
          equipped_title:shop_items!equipped_title_id(*),
          equipped_background:shop_items!equipped_background_id(*)
        `
      )
      .eq("user_id", userId)
      .maybeSingle();

    setEquippedItems(equipped ? normalizeEquippedItems(equipped) : null);
    setShowSelector(null);
    window.dispatchEvent(new CustomEvent("itemEquipped"));

    setTimeout(() => {
      router.refresh();
    }, 300);
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
    <div className="comic-panel-dark space-y-6 p-6" style={{ position: "relative", zIndex: 1 }}>
      <h2 className="mb-4 text-2xl font-bold text-white text-outline">Personnalisation</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white text-outline">Avatar</h3>
          <button
            onClick={() => setShowSelector(showSelector === "avatar" ? null : "avatar")}
            className="comic-button bg-slate-700 px-4 py-2 text-sm font-bold text-white text-outline hover:bg-slate-600"
          >
            {showSelector === "avatar" ? "Fermer" : "Changer"}
          </button>
        </div>

        <div className="relative" style={{ width: "128px", aspectRatio: "2/3" }}>
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
                ? {
                    backgroundImage: `url(${addCacheBustingIfSupabase(currentBackground.image_url)})`,
                  }
                : undefined
            }
          />
          <div className="absolute inset-0 flex items-center justify-center p-2">
            {currentAvatar?.image_url ? (
              <img
                src={addCacheBustingIfSupabase(currentAvatar.image_url)}
                alt={currentAvatar.name}
                className="h-full w-full rounded-lg border-2 border-black object-cover"
              />
            ) : currentAvatar?.color_theme ? (
              <div
                className={`h-full w-full rounded-lg border-2 border-black ${getItemColor(
                  currentAvatar.color_theme
                )}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-black bg-slate-800/50">
                <span className="text-4xl font-bold text-white text-outline">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {showSelector === "avatar" && (
          <div
            className="comic-panel border-2 border-black bg-slate-800 p-4"
            style={{ position: "relative", zIndex: 10 }}
          >
            <div
              className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4"
              style={{ position: "relative", zIndex: 11 }}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleEquip(null, "avatar");
                }}
                className={`comic-button relative z-10 px-3 py-2 text-sm font-bold text-outline ${
                  !currentAvatar
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
              >
                Aucun
              </button>
              {availableItems.avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleEquip(avatar.id, "avatar");
                  }}
                  className={`comic-button relative z-10 px-3 py-2 text-sm font-bold text-outline ${
                    currentAvatar?.id === avatar.id
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                  style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }}
                >
                  {avatar.image_url ? (
                    <div className="w-full" style={{ aspectRatio: "2/3" }}>
                      <img
                        src={addCacheBustingIfSupabase(avatar.image_url)}
                        alt={avatar.name}
                        className="h-full w-full rounded object-cover"
                      />
                    </div>
                  ) : (
                    avatar.name
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white text-outline">Titre</h3>
          <button
            onClick={() => setShowSelector(showSelector === "title" ? null : "title")}
            className="comic-button bg-slate-700 px-4 py-2 text-sm font-bold text-white text-outline hover:bg-slate-600"
          >
            {showSelector === "title" ? "Fermer" : "Changer"}
          </button>
        </div>

        <div className="comic-panel border-2 border-black bg-slate-800 p-3 text-center">
          <span className="text-lg font-bold text-cyan-400 text-outline">
            {currentTitle?.name || "Aucun titre"}
          </span>
        </div>

        {showSelector === "title" && (
          <div
            className="comic-panel border-2 border-black bg-slate-800 p-4"
            style={{ position: "relative", zIndex: 10 }}
          >
            <div
              className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4"
              style={{ position: "relative", zIndex: 11 }}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleEquip(null, "title");
                }}
                className={`comic-button relative z-10 px-3 py-2 text-sm font-bold text-outline ${
                  !currentTitle
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
              >
                Aucun
              </button>
              {availableItems.titles.map((title) => (
                <button
                  key={title.id}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleEquip(title.id, "title");
                  }}
                  className={`comic-button relative z-10 px-3 py-2 text-sm font-bold text-outline ${
                    currentTitle?.id === title.id
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                  style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }}
                >
                  {title.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white text-outline">Background</h3>
          <button
            onClick={() =>
              setShowSelector(showSelector === "background" ? null : "background")
            }
            className="comic-button bg-slate-700 px-4 py-2 text-sm font-bold text-white text-outline hover:bg-slate-600"
          >
            {showSelector === "background" ? "Fermer" : "Changer"}
          </button>
        </div>

        <div
          className="overflow-hidden rounded-lg border-4 border-black"
          style={{ aspectRatio: "2/3", width: "100%", maxWidth: "200px" }}
        >
          {currentBackground?.image_url ? (
            <img
              src={addCacheBustingIfSupabase(currentBackground.image_url)}
              alt={currentBackground.name}
              className="h-full w-full object-cover"
            />
          ) : currentBackground?.color_theme ? (
            <div className={`h-full w-full ${getItemColor(currentBackground.color_theme)}`} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <span className="font-bold text-white text-outline">
                {currentBackground?.name || "Defaut"}
              </span>
            </div>
          )}
        </div>

        {showSelector === "background" && (
          <div
            className="comic-panel border-2 border-black bg-slate-800 p-4"
            style={{ position: "relative", zIndex: 10 }}
          >
            <div
              className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4"
              style={{ position: "relative", zIndex: 11 }}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleEquip(null, "background");
                }}
                className={`comic-button relative z-10 px-3 py-2 text-sm font-bold text-outline ${
                  !currentBackground
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
              >
                Aucun
              </button>
              {availableItems.backgrounds.map((background) => (
                <button
                  key={background.id}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleEquip(background.id, "background");
                  }}
                  className={`comic-button relative z-10 px-3 py-2 text-sm font-bold text-outline ${
                    currentBackground?.id === background.id
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                  style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }}
                >
                  {background.image_url ? (
                    <div className="w-full" style={{ aspectRatio: "2/3" }}>
                      <img
                        src={addCacheBustingIfSupabase(background.image_url)}
                        alt={background.name}
                        className="h-full w-full rounded object-cover"
                      />
                    </div>
                  ) : (
                    background.name
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
