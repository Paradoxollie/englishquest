"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { FooterAd } from "@/components/ads/FooterAd";
import { FooterAdContainer } from "@/components/ads/FooterAdServer";
import { ADSENSE_CLIENT, getAdRouteSettings } from "@/lib/ads/config";

const DISABLED_AD_SETTINGS = {
  loadScript: false,
  footer: false,
  sidebar: false,
};

export function AdLayoutShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [canRenderAds, setCanRenderAds] = useState(false);
  const adSettings = canRenderAds ? getAdRouteSettings(pathname) : DISABLED_AD_SETTINGS;

  useEffect(() => {
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    setCanRenderAds(!localHosts.has(window.location.hostname));
  }, []);

  return (
    <div className="eq-shell">
      {adSettings.loadScript ? (
        <Script
          id="google-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      ) : null}

      {header}

      <main className="eq-main">
        {children}

        {adSettings.footer ? (
          <div className="eq-container">
            <FooterAdContainer />
            <FooterAd />
          </div>
        ) : null}
      </main>

      <footer className="eq-footer">
        <div className="eq-container eq-footer-row">
          <div className="eq-footer-brand">
            <span className="eq-brand-mark" aria-hidden="true">
              EQ
            </span>
            <div>
              <p className="eq-footer-title">English Quest</p>
              <p className="eq-footer-sub">Un site de Pierre Marienne, professeur d&apos;anglais. Gratuit, sans publicité dans les cours et les jeux.</p>
            </div>
          </div>
          <nav className="eq-footer-links" aria-label="Pied de page">
            <Link href="/tous-les-cours">Cours</Link>
            <Link href="/play">Jeux</Link>
            <Link href="/quest">Aventure</Link>
            <Link href="/about">À propos</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
