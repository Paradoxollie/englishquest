import { ADSENSE_CLIENT, ADSENSE_SLOTS } from "@/lib/ads/config";

// Composant serveur pour l'element AdSense (doit rester dans le HTML source)
export function FooterAdContainer() {
  return (
    <div className="mt-10 border-t border-slate-800/80 pt-6">
      <div className="mx-auto max-w-4xl px-2">
        <div className="overflow-hidden rounded-[18px] border border-slate-800/80 bg-slate-950/40 px-3 py-3 md:px-4">
          <ins
            className="adsbygoogle block"
            style={{
              display: "block",
              minHeight: "90px",
              margin: "0 auto",
            }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOTS.footer}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}
