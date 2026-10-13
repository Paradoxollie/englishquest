"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Actualise les records et le bandeau de mission après une vraie sauvegarde. */
export function useRefreshAfterScore(status: string) {
  const router = useRouter();
  useEffect(() => {
    if (status === "saved") router.refresh();
  }, [status, router]);
}
