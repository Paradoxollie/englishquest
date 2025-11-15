"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function FooterAd() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // fail silently
    }
  }, []);

  return (
    <div className="mt-8 border-t border-slate-800/60 pt-4">
      <div className="mx-auto max-w-5xl px-2">
        <span className="mb-1 block text-xs text-slate-500">
          Sponsored
        </span>
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client="ca-pub-6094969027977372"
          data-ad-slot="REPLACE_WITH_YOUR_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

