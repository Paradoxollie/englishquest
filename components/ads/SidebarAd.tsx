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
            if (typeof window !== "undefined" && window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error("AdSense Sidebar error:", err);
        }
    }, []);

    return null;
}
