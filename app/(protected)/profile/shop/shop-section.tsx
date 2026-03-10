"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoldIcon } from "@/components/ui/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";
import {
  buildOwnedItemIdSet,
  canAutoGrantShopItem,
  filterVisibleShopItems,
} from "@/lib/shop/visibility";
import type { ShopItem, UserEquippedItems, UserItem } from "@/types/shop";
import { equipItemAction, purchaseShopItemAction } from "./actions";

interface ShopSectionProps {
  userLevel: number;
  userGold: number;
  userId: string;
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

export function ShopSection({ userLevel, userGold, userId }: ShopSectionProps) {
  const router = useRouter();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<UserEquippedItems | null>(null);
  const [selectedType, setSelectedType] = useState<"avatar" | "title" | "background">("avatar");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      const [{ data: items }, { data: owned }, { data: equipped }] = await Promise.all([
        supabase
          .from("shop_items")
          .select("*")
          .eq("is_active", true)
          .order("display_order"),
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
      ]);

      const ownedRows = (owned as UserItem[]) ?? [];
      const ownedItemIds = buildOwnedItemIdSet(ownedRows);

      setShopItems(
        filterVisibleShopItems((items as ShopItem[]) ?? [], ownedItemIds)
      );
      setUserItems(ownedRows);
      setEquippedItems(equipped ? normalizeEquippedItems(equipped) : null);
      setLoading(false);
    }

    loadData();
  }, [userId]);

  const handlePurchase = async (item: ShopItem) => {
    if (purchasing) {
      return;
    }

    setPurchasing(item.id);
    setError(null);
    setSuccess(null);

    const result = await purchaseShopItemAction(item.id);

    if (result.success) {
      setSuccess(`${item.name} achete avec succes.`);

      const supabase = createSupabaseBrowserClient();
      const { data: owned } = await supabase
        .from("user_items")
        .select(
          `
            *,
            shop_items(*)
          `
        )
        .eq("user_id", userId);

      if (owned) {
        const transformed = owned.map((row: any) => ({
          ...row,
          shop_item: Array.isArray(row.shop_items) ? row.shop_items[0] : row.shop_items,
        }));
        setUserItems(transformed as UserItem[]);
      }

      window.dispatchEvent(new CustomEvent("itemPurchased"));
      setTimeout(() => {
        router.refresh();
      }, 500);
    } else {
      setError(result.error || "Erreur lors de l'achat");
    }

    setPurchasing(null);
  };

  const handleEquip = async (
    itemId: string | null,
    type: "avatar" | "title" | "background"
  ) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await equipItemAction(itemId, type);

      if (result.success) {
        setSuccess("Item equipe avec succes.");

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
        window.dispatchEvent(new CustomEvent("itemEquipped"));

        setTimeout(() => {
          router.refresh();
        }, 300);
      } else {
        setError(result.error || "Erreur lors de l'equipement");
      }
    } catch {
      setError("Une erreur inattendue s'est produite");
    }
  };

  const filteredItems = shopItems.filter((item) => item.item_type === selectedType);
  const ownedItemIds = buildOwnedItemIdSet(
    userItems as Array<Pick<UserItem, "shop_item_id">>
  );

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
        <p className="text-slate-300 text-outline">Chargement de la boutique...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ position: "relative", zIndex: 1 }}>
      {error && (
        <div className="comic-panel bg-red-600 border-2 border-black p-4 text-white text-outline">
          {error}
        </div>
      )}
      {success && (
        <div className="comic-panel bg-green-600 border-2 border-black p-4 text-white text-outline">
          {success}
        </div>
      )}

      <div className="comic-panel-dark p-4">
        <div className="flex flex-wrap gap-3">
          {(["avatar", "title", "background"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`comic-button px-6 py-2 font-bold text-outline ${
                selectedType === type
                  ? "bg-cyan-500 text-white border-4 border-black"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              {type === "avatar" ? "Avatars" : type === "title" ? "Titres" : "Backgrounds"}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        style={{ position: "relative", zIndex: 1 }}
      >
        {filteredItems.map((item) => {
          const isFree = canAutoGrantShopItem(item);
          const isOwned = ownedItemIds.has(item.id) || isFree;
          const canAfford = userGold >= item.price_gold;
          const hasLevel = userLevel >= item.required_level;
          const canEquip = isOwned && (isFree || hasLevel);
          const canBuy = hasLevel && canAfford && !isOwned && item.price_gold > 0;

          const isEquipped =
            (selectedType === "avatar" && equippedItems?.equipped_avatar_id === item.id) ||
            (selectedType === "title" && equippedItems?.equipped_title_id === item.id) ||
            (selectedType === "background" &&
              equippedItems?.equipped_background_id === item.id);

          return (
            <div
              key={item.id}
              className={`comic-panel border-2 border-black p-4 ${
                isEquipped ? "bg-gradient-to-br from-cyan-900/30 to-blue-900/30" : "bg-slate-800"
              }`}
            >
              <div className="space-y-3">
                <div
                  className="flex items-center justify-center overflow-hidden rounded-lg border-2 border-black bg-slate-900"
                  style={{ aspectRatio: "2/3", width: "100%" }}
                >
                  {item.image_url ? (
                    <img
                      src={addCacheBustingIfSupabase(item.image_url)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : item.color_theme ? (
                    <div className={`h-full w-full ${getItemColor(item.color_theme)}`} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-2xl font-bold text-white">{item.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white text-outline">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-300 text-outline">{item.description}</p>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-400 text-outline">
                  <div className="flex items-center gap-2">
                    <GoldIcon className="h-4 w-4" />
                    <span>{item.price_gold} or</span>
                  </div>
                  <div>Niveau {item.required_level} requis</div>
                </div>

                <div
                  className="flex gap-2"
                  style={{ pointerEvents: "auto", position: "relative", zIndex: 30 }}
                >
                  {canEquip ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleEquip(isEquipped ? null : item.id, selectedType);
                      }}
                      className={`comic-button flex-1 px-4 py-2 text-sm font-bold text-outline ${
                        isEquipped
                          ? "bg-slate-600 text-white hover:bg-slate-500"
                          : "bg-cyan-500 text-white hover:bg-cyan-600"
                      }`}
                      style={{
                        pointerEvents: "auto",
                        position: "relative",
                        zIndex: 50,
                        cursor: "pointer",
                        touchAction: "manipulation",
                      }}
                    >
                      {isEquipped ? "Desequiper" : "Equiper"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!purchasing && canBuy) {
                          handlePurchase(item);
                        }
                      }}
                      disabled={!canBuy || purchasing === item.id}
                      className={`comic-button flex-1 px-4 py-2 text-sm font-bold text-outline transition-colors ${
                        canBuy && !purchasing
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "cursor-not-allowed bg-slate-600 text-slate-400 opacity-50"
                      }`}
                    >
                      {purchasing === item.id
                        ? "..."
                        : !canAfford
                          ? "Pas assez d'or"
                          : !hasLevel
                            ? `Niveau ${item.required_level} requis`
                            : "Acheter"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
