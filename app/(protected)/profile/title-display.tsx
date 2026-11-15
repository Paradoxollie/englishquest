"use client";

/**
 * Title Display Component - Affiche le titre équipé
 */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserEquippedItems, ShopItem } from "@/types/shop";

interface TitleDisplayProps {
  userId: string;
  initialTitle?: ShopItem | null;
}

export function TitleDisplay({ userId, initialTitle }: TitleDisplayProps) {
  const [equippedTitle, setEquippedTitle] = useState<ShopItem | null>(initialTitle ?? null);
  const [loading, setLoading] = useState(initialTitle === undefined);

  useEffect(() => {
    async function loadData() {
      const supabase = createSupabaseBrowserClient();
      const { data: equipped } = await supabase
        .from("user_equipped_items")
        .select(`
          equipped_title:shop_items!equipped_title_id(*)
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (equipped?.equipped_title) {
        // Handle both array and single object cases
        const title = Array.isArray(equipped.equipped_title) 
          ? equipped.equipped_title[0] 
          : equipped.equipped_title;
        if (title) {
          setEquippedTitle(title as ShopItem);
        }
      } else {
        setEquippedTitle(null);
      }
      setLoading(false);
    }

    if (initialTitle === undefined) {
      loadData();
    }

    const handleEquipEvent = () => {
      loadData();
    };
    window.addEventListener("itemEquipped", handleEquipEvent);
    return () => {
      window.removeEventListener("itemEquipped", handleEquipEvent);
    };
  }, [userId, initialTitle]);

  if (loading || !equippedTitle) {
    return null;
  }

  return (
    <p className="mt-1 text-sm font-semibold text-[var(--cyan)]">
      {equippedTitle.name}
    </p>
  );
}

