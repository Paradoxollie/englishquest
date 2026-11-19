"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { restoreGuestPlacementAction, confirmGuestPlacementAction } from "@/app/(public)/test-de-niveau/actions";
import { PLACEMENT_TOKEN_STORAGE_KEY } from "@/lib/placement/placement-storage";

/** Import older signed results that were only visible to the signup form. */
export function RecoverGuestPlacement() {
  const router = useRouter();
  useEffect(() => {
    let active = true;
    async function recover() {
      try {
        const token = window.localStorage.getItem(PLACEMENT_TOKEN_STORAGE_KEY);
        if (!token || !active) return;
        const chapter = await restoreGuestPlacementAction(token);
        if (chapter !== null && !await confirmGuestPlacementAction(chapter)) return;
        window.localStorage.removeItem(PLACEMENT_TOKEN_STORAGE_KEY);
        if (active && chapter !== null) router.refresh();
      } catch {
        // Retry on a later visit if storage or the connection was unavailable.
      }
    }
    void recover();
    return () => { active = false; };
  }, [router]);
  return null;
}
