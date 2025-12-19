// Composant serveur pour l'élément AdSense Sidebar
// IMPORTANT: Ce composant doit rester un composant serveur
export function SidebarAdContainer() {
    return (
        <div className="w-full">
            {/* Container minimaliste sans bordures ni fond */}
            <div className="flex flex-col items-center">
                <ins
                    className="adsbygoogle block"
                    style={{
                        display: "block",
                        width: "100%",
                        height: "600px"
                    }}
                    data-ad-client="ca-pub-6094969027977372"
                    data-ad-slot="1844574488"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            </div>
        </div>
    );
}
