"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ShopItem, ShopItemType } from "@/types/shop";
import type { Equipment, ProfileCollection } from "./collection-data";

type Outfit = Record<ShopItemType, ShopItem | null>;
export type { Outfit };

type Inventory = { gold: number; ownedIds: string[]; equipment: Equipment };
type SavedInventory = { source: ProfileCollection; initialGold: number; value: Inventory };

type WardrobeState = {
  items: ShopItem[];
  ownedIds: Set<string>;
  outfit: Outfit;
  gold: number;
  level: number;
  xp: number;
  username: string;
  unavailable: boolean;
  purchased: (itemIds: string[], newGold: number) => void;
  equipped: (type: ShopItemType, itemId: string | null) => void;
};

const WardrobeContext = createContext<WardrobeState | null>(null);

export function WardrobeProvider({ collection, gold, level, xp, username, userId, children }: {
  collection: ProfileCollection;
  gold: number;
  level: number;
  xp: number;
  username: string;
  userId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const updates = useRef<BroadcastChannel | null>(null);
  const [saved, setSaved] = useState<SavedInventory | null>(null);
  const initial = { gold, ownedIds: collection.ownedIds, equipment: collection.equipment };
  // A navigation or refresh brings back the authoritative account inventory.
  const current = saved?.source === collection && saved.initialGold === gold ? saved.value : initial;
  const ownedIds = useMemo(() => new Set(current.ownedIds), [current.ownedIds]);
  const byId = useMemo(() => new Map(collection.items.map(item => [item.id, item])), [collection.items]);
  const itemIn = (type: ShopItemType) => byId.get(current.equipment[type] ?? "") ?? null;

  useEffect(() => {
    function refresh(eventName = "itemEquipped") {
      router.refresh();
      window.dispatchEvent(new Event(eventName));
    }
    const onFocus = () => refresh();
    const onRestore = (event: PageTransitionEvent) => { if (event.persisted) refresh(); };
    window.addEventListener("pageshow", onRestore);
    // Older browsers catch up when the player returns to this tab.
    if (typeof BroadcastChannel === "undefined") {
      window.addEventListener("focus", onFocus);
      return () => {
        window.removeEventListener("focus", onFocus);
        window.removeEventListener("pageshow", onRestore);
      };
    }
    const channel = new BroadcastChannel(`english-quest-wardrobe-${userId}`);
    updates.current = channel;
    channel.onmessage = ({ data }) => {
      if (data === "itemEquipped" || data === "itemPurchased") refresh(data);
    };
    return () => {
      window.removeEventListener("pageshow", onRestore);
      updates.current = null;
      channel.close();
    };
  }, [router, userId]);

  function save(value: Inventory, eventName: "itemPurchased" | "itemEquipped") {
    setSaved({ source: collection, initialGold: gold, value });
    router.refresh();
    window.dispatchEvent(new Event(eventName));
    updates.current?.postMessage(eventName);
  }

  return (
    <WardrobeContext.Provider value={{
      items: collection.items, ownedIds, gold: current.gold, level, xp, username,
      unavailable: collection.unavailable,
      outfit: { avatar: itemIn("avatar"), background: itemIn("background"), title: itemIn("title"), ship_skin: itemIn("ship_skin") },
      purchased(itemIds, newGold) {
        save({ ...current, gold: newGold, ownedIds: [...new Set([...current.ownedIds, ...itemIds])] }, "itemPurchased");
      },
      equipped(type, itemId) {
        save({ ...current, equipment: { ...current.equipment, [type]: itemId } }, "itemEquipped");
      },
    }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const state = useContext(WardrobeContext);
  if (!state) throw new Error("WardrobeProvider is missing");
  return state;
}

export function ProfileGold() {
  return <>{useWardrobe().gold.toLocaleString("fr-FR")}</>;
}
