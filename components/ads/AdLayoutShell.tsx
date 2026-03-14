"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { FooterAd } from "@/components/ads/FooterAd";
import { FooterAdContainer } from "@/components/ads/FooterAdServer";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { SidebarAdContainer } from "@/components/ads/SidebarAdServer";
import { ADSENSE_CLIENT, getAdRouteSettings } from "@/lib/ads/config";

export function AdLayoutShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const adSettings = getAdRouteSettings(pathname);

  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-[1600px] px-2 py-3 md:px-4 md:py-6">
      {adSettings.loadScript ? (
        <Script
          id="google-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          data-overlays="bottom"
          strategy="afterInteractive"
        />
      ) : null}

      <div className="flex min-h-screen flex-col gap-4 md:gap-10">
        {header}

        <div className="flex flex-1 justify-center gap-6">
          {adSettings.sidebar ? (
            <div className="hidden w-[300px] flex-shrink-0 2xl:block" aria-hidden="true" />
          ) : null}

          <main
            className={
              adSettings.sidebar
                ? "max-w-5xl min-w-0 flex-1"
                : "mx-auto w-full max-w-6xl min-w-0 flex-1"
            }
          >
            {children}

            {adSettings.footer ? (
              <>
                <FooterAdContainer />
                <FooterAd />
              </>
            ) : null}
          </main>

          {adSettings.sidebar ? (
            <aside className="hidden w-[300px] flex-shrink-0 2xl:block">
              <div className="sticky top-6">
                <SidebarAdContainer />
                <SidebarAd />
              </div>
            </aside>
          ) : null}
        </div>

        <footer className="space-y-2 pb-4 text-center text-xs text-slate-400">
          <div>English Quest - Apprentissage de l'anglais gamifie</div>
          <div className="flex justify-center gap-4 text-slate-500">
            <Link href="/about" className="transition-colors hover:text-slate-400">
              A propos
            </Link>
            <Link href="/contact" className="transition-colors hover:text-slate-400">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
