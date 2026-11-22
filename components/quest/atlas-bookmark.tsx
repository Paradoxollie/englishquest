"use client";

import { useEffect } from "react";

export function AtlasBookmark() {
  useEffect(() => {
    function openAtlas() {
      if (window.location.hash === "#atlas") window.location.replace("/quest/atlas");
    }
    openAtlas();
    window.addEventListener("hashchange", openAtlas);
    return () => window.removeEventListener("hashchange", openAtlas);
  }, []);
  return null;
}
