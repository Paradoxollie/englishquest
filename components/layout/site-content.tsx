"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth/auth-provider";
import { RewardCelebrations } from "@/components/rewards/reward-celebrations";
import { AppHeader } from "./app-header";
import { SiteShell } from "./site-shell";

export function SiteContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/activite-classe/")) return <main>{children}</main>;
  return <AuthProvider>
    <SiteShell header={<AppHeader />}>{children}</SiteShell>
    <RewardCelebrations />
  </AuthProvider>;
}
