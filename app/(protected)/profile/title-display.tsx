"use client";

/**
 * Title Display Component - Affiche le titre équipé
 */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserEquippedItems, ShopItem } from "@/types/shop";

interface TitleDisplayProps {
  userId: string;
}

export function TitleDisplay({ userId }: TitleDisplayProps) {
  const [equippedTitle, setEquippedTitle] = useState<ShopItem | null>(null);
  const [loading, setLoading] = useState(true);

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
        setEquippedTitle(equipped.equipped_title as ShopItem);
      }
      setLoading(false);
    }

    loadData();
  }, [userId]);

  if (loading || !equippedTitle) {
    return null;
  }

  return (
    <p className="mt-1 text-sm font-semibold text-cyan-400 text-outline">
      {equippedTitle.name}
    </p>
  );
}

