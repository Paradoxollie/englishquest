// Composant serveur pour l'élément AdSense (doit être dans le HTML source pour validation Google)
// IMPORTANT: Ce composant doit rester un composant serveur (pas de "use client")
// Il sera rendu dans le HTML source pour que Google puisse le détecter
export function FooterAdContainer() {
  return (
    <>
      {/* AdSense Container - DOIT être dans le HTML source pour validation Google */}
      {/* Placé tôt dans le body pour être visible par le crawler Google */}
      <div 
        id="adsense-container"
        className="mt-8 border-t border-slate-800/60 pt-4"
        style={{ display: "block" }}
      >
        <div className="mx-auto max-w-5xl px-2">
          <div className="flex flex-col items-center">
            <span className="mb-1 block text-xs text-slate-500 text-center">
              Sponsored
            </span>
            <ins
              className="adsbygoogle"
              style={{ 
                display: "block",
                minHeight: "100px",
                margin: "0 auto",
                width: "100%",
              }}
              data-ad-client="ca-pub-6094969027977372"
              data-ad-slot="1844574488"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      </div>
    </>
  );
}

