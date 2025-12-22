"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

export function SidebarAd() {
    useEffect(() => {
        try {
            // Check if window is defined and if adsbygoogle exists
            if (typeof window !== "undefined") {
                // Ensure array exists
                window.adsbygoogle = window.adsbygoogle || [];

                // Only push if we haven't already (basic check)
                // Note: Better ad management might supply specific slots
                // Catching the specific "No slot size" error which is common in Dev/HMR
                try {
                    window.adsbygoogle.push({});
                } catch (e: any) {
                    // Ignore "No slot size" error as it often happens when ad is hidden/resizing
                    if (!e.message?.includes('No slot size')) {
                        console.error("AdSense push error:", e);
                    }
                }
            }
        } catch (err) {
            console.error("AdSense Sidebar error:", err);
        }
    }, []);

    return null;
}
