import { ADSENSE_CLIENT, ADSENSE_SLOTS } from "@/lib/ads/config";

// Composant serveur pour l'element AdSense desktop
export function SidebarAdContainer() {
  return (
    <div className="w-full space-y-3">
      <div className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
        Publicite
      </div>
      <div className="comic-panel border border-slate-800/80 bg-slate-950/55 p-3">
        <ins
          className="adsbygoogle block"
          style={{
            display: "block",
            width: "100%",
            height: "600px",
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOTS.sidebar}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
