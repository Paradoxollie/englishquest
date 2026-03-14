"use client";

import { usePathname } from "next/navigation";
import { getAdRouteSettings } from "@/lib/ads/config";

export function ConditionalAdSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adSettings = getAdRouteSettings(pathname);

  if (!adSettings.footer && !adSettings.sidebar) {
    return null;
  }

  return <>{children}</>;
}
