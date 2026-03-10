"use client";

import { usePathname } from "next/navigation";

const AD_FREE_PREFIXES = [
  "/auth",
  "/cours",
  "/dashboard",
  "/home",
  "/leaderboard",
  "/messages",
  "/play",
  "/profile",
  "/quest",
  "/teachers",
  "/tous-les-cours",
];

export function ConditionalAdSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideAds = AD_FREE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideAds) {
    return null;
  }

  return <>{children}</>;
}
