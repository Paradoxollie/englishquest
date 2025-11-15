"use client";

/**
 * Shop Section Component - Boutique pour acheter avatars, titres et backgrounds
 */

import { useState, useEffect } from "react";
import { purchaseShopItemAction, equipItemAction } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ShopItem, UserItem, UserEquippedItems } from "@/types/shop";
import { GoldIcon } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

interface ShopSectionProps {
  userLevel: number;
  userGold: number;
  userId: string;
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

      // Load shop items
      const { data: items } = await supabase
        .from("shop_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      // Load user items with shop_items join
      const { data: owned } = await supabase
        .from("user_items")
        .select(`
          *,
          shop_items(*)
        `)
        .eq("user_id", userId);

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

      console.log("Shop data loaded:", {
        itemsCount: items?.length,
        ownedCount: owned?.length,
        equipped: equipped,
        userId,
      });

      if (items) setShopItems(items as ShopItem[]);
      if (owned) setUserItems(owned as any);
      if (equipped) setEquippedItems(equipped as any);
      setLoading(false);
    }

    loadData();
  }, [userId]);

  const handlePurchase = async (item: ShopItem) => {
    if (purchasing) return; // Prevent double clicks
    
    setPurchasing(item.id);
    setError(null);
    setSuccess(null);

    const result = await purchaseShopItemAction(item.id);

    if (result.success) {
      setSuccess(`${item.name} acheté avec succès !`);
      
      // Reload all data
      const supabase = createSupabaseBrowserClient();
      
      // Reload user items
      const { data: owned } = await supabase
        .from("user_items")
        .select(`
          *,
          shop_items(*)
        `)
        .eq("user_id", userId);
      if (owned) {
        // Transform to match UserItem type
        const transformed = owned.map((o: any) => ({
          ...o,
          shop_item: Array.isArray(o.shop_items) ? o.shop_items[0] : o.shop_items,
        }));
        setUserItems(transformed as any);
      }
      
      // Reload equipped items
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
      
      // Dispatch event to update customization display
      window.dispatchEvent(new CustomEvent('itemPurchased'));
      
      // Refresh page to update gold
      setTimeout(() => {
        router.refresh();
      }, 500);
    } else {
      setError(result.error || "Erreur lors de l'achat");
    }

    setPurchasing(null);
  };

  const handleEquip = async (itemId: string | null, type: "avatar" | "title" | "background") => {
    console.log("=== ShopSection - handleEquip START ===");
    console.log("Parameters:", { itemId, type, selectedType, userId });
    
    setError(null);
    setSuccess(null);

    try {
      if (!itemId) {
        console.log("ShopSection - Unequipping item:", type);
      } else {
        console.log("ShopSection - Equipping item:", { itemId, type });
      }

      const result = await equipItemAction(itemId, type);
      console.log("ShopSection - Equip result:", result);

      if (result.success) {
        setSuccess("Item équipé avec succès !");
        
        // Reload equipped items immediately
        const supabase = createSupabaseBrowserClient();
        const { data: equipped, error: equippedError } = await supabase
          .from("user_equipped_items")
          .select(`
            *,
            equipped_avatar:shop_items!equipped_avatar_id(*),
            equipped_title:shop_items!equipped_title_id(*),
            equipped_background:shop_items!equipped_background_id(*)
          `)
          .eq("user_id", userId)
          .maybeSingle();
        
        console.log("Reloaded equipped items:", { equipped, equippedError });
        
        if (equipped) {
          setEquippedItems(equipped as any);
        }
        
        // Dispatch events to update displays
        window.dispatchEvent(new CustomEvent('itemEquipped'));
        
        // Refresh page to update avatar display
        setTimeout(() => {
          router.refresh();
        }, 300);
      } else {
        const errorMsg = result.error || "Erreur lors de l'équipement";
        setError(errorMsg);
        console.error("Error equipping:", errorMsg);
      }
    } catch (error) {
      console.error("Exception in handleEquip:", error);
      setError("Une erreur inattendue s'est produite");
    }
    
    console.log("=== ShopSection - handleEquip END ===");
  };

  const filteredItems = shopItems.filter((item) => {
    const matches = item.item_type === selectedType;
    if (!matches) {
      console.log("Item filtered out:", { itemId: item.id, itemName: item.name, itemType: item.item_type, selectedType });
    }
    return matches;
  });
  
  console.log("Filtered items for", selectedType, ":", filteredItems.length, "items");
  // Extract shop_item_id from userItems
  const ownedItemIds = new Set(
    userItems.map((ui: any) => {
      // Get shop_item_id directly
      return ui.shop_item_id;
    }).filter(Boolean)
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
      {/* Error/Success Messages */}
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

      {/* Type Selector */}
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ position: "relative", zIndex: 1 }}>
        {filteredItems.map((item) => {
          // Items gratuits (price_gold === 0) sont automatiquement considérés comme possédés
          const isFree = item.price_gold === 0;
          const isOwned = isFree || ownedItemIds.has(item.id);
          const canAfford = userGold >= item.price_gold;
          const hasLevel = userLevel >= item.required_level;
          // Pour les items gratuits, on peut toujours équiper (ils sont accessibles à tous)
          // Pour les items payants, il faut avoir le niveau requis
          const canEquip = isOwned && (isFree || hasLevel);
          const canBuy = hasLevel && canAfford && !isOwned && item.price_gold > 0;
          
          // Check if item is equipped - be more explicit about the type matching
          let isEquipped = false;
          if (selectedType === "avatar" && equippedItems?.equipped_avatar_id === item.id) {
            isEquipped = true;
          } else if (selectedType === "title" && equippedItems?.equipped_title_id === item.id) {
            isEquipped = true;
          } else if (selectedType === "background" && equippedItems?.equipped_background_id === item.id) {
            isEquipped = true;
          }
          
          console.log("Item equip check:", {
            itemId: item.id,
            itemName: item.name,
            itemType: item.item_type,
            selectedType,
            isEquipped,
            canEquip,
            isOwned,
            isFree,
            hasLevel,
            equippedAvatarId: equippedItems?.equipped_avatar_id,
            equippedTitleId: equippedItems?.equipped_title_id,
            equippedBackgroundId: equippedItems?.equipped_background_id,
          });

          return (
            <div
              key={item.id}
              className={`comic-panel border-2 border-black p-4 relative ${
                isEquipped ? "bg-gradient-to-br from-cyan-900/30 to-blue-900/30" : "bg-slate-800"
              }`}
              style={{ zIndex: 1, pointerEvents: "auto" }}
              onClick={(e) => {
                // Prevent clicks on the card from interfering
                e.stopPropagation();
              }}
            >
              <div className="space-y-3" style={{ pointerEvents: "auto" }}>
                {/* Item Preview - Format portrait uniforme */}
                <div className="flex items-center justify-center rounded-lg border-2 border-black bg-slate-900 overflow-hidden" style={{ aspectRatio: "2/3", width: "100%" }}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : item.color_theme ? (
                    <div className={`w-full h-full ${getItemColor(item.color_theme)}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{item.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div>
                  <h3 className="font-bold text-white text-outline text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-slate-300 text-outline mt-1">{item.description}</p>
                  )}
                </div>

                {/* Requirements */}
                <div className="space-y-1 text-xs text-slate-400 text-outline">
                  <div className="flex items-center gap-2">
                    <GoldIcon className="w-4 h-4" />
                    <span>{item.price_gold} or</span>
                  </div>
                  <div>Niveau {item.required_level} requis</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2" style={{ pointerEvents: "auto", position: "relative", zIndex: 30 }}>
                  {canEquip ? (
                    <>
                      {isEquipped ? (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Déséquiper mousedown ===", { selectedType, itemId: item.id, itemName: item.name });
                            handleEquip(null, selectedType);
                          }}
                          onMouseUp={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Déséquiper mouseup ===", { selectedType, itemId: item.id });
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Déséquiper button clicked ===", { selectedType, itemId: item.id, itemName: item.name });
                            handleEquip(null, selectedType);
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Déséquiper touchstart ===", { selectedType, itemId: item.id });
                            handleEquip(null, selectedType);
                          }}
                          className="comic-button bg-slate-600 text-white px-4 py-2 text-sm font-bold text-outline flex-1 hover:bg-slate-500 active:bg-slate-700"
                          style={{ 
                            pointerEvents: "auto", 
                            position: "relative", 
                            zIndex: 50, 
                            cursor: "pointer",
                            touchAction: "manipulation"
                          }}
                        >
                          Déséquiper
                        </button>
                      ) : (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Équiper mousedown ===", { itemId: item.id, itemName: item.name, selectedType });
                            handleEquip(item.id, selectedType);
                          }}
                          onMouseUp={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Équiper mouseup ===", { itemId: item.id, selectedType });
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Équiper button clicked ===", { itemId: item.id, itemName: item.name, selectedType, itemType: item.item_type });
                            handleEquip(item.id, selectedType);
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("=== Équiper touchstart ===", { itemId: item.id, selectedType });
                            handleEquip(item.id, selectedType);
                          }}
                          className="comic-button bg-cyan-500 text-white px-4 py-2 text-sm font-bold text-outline flex-1 hover:bg-cyan-600 active:bg-cyan-700"
                          style={{ 
                            pointerEvents: "auto", 
                            position: "relative", 
                            zIndex: 50, 
                            cursor: "pointer",
                            touchAction: "manipulation"
                          }}
                        >
                          Équiper
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Acheter button clicked:", item.id, { canBuy, purchasing: purchasing === item.id });
                        if (!purchasing && canBuy) {
                          handlePurchase(item);
                        }
                      }}
                      disabled={!canBuy || purchasing === item.id}
                      className={`comic-button px-4 py-2 text-sm font-bold text-outline flex-1 transition-colors relative z-10 ${
                        canBuy && !purchasing
                          ? "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 cursor-pointer"
                          : "bg-slate-600 text-slate-400 cursor-not-allowed opacity-50"
                      }`}
                      style={{ pointerEvents: canBuy && !purchasing ? "auto" : "none" }}
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

