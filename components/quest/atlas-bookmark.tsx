"use client";

import { useEffect } from "react";

export function AtlasBookmark() {
  useEffect(() => {
    function openBookmark() {
      const anchor = window.location.hash;
      if (anchor === "#atlas") window.location.replace("/quest/atlas");
      if (/^#(?:chapitre-[1-5]|mission-courante)$/.test(anchor)) {
        window.location.replace(`/tous-les-cours/parcours${anchor}`);
      }
    }
    openBookmark();
    window.addEventListener("hashchange", openBookmark);
    return () => window.removeEventListener("hashchange", openBookmark);
  }, []);
  return null;
}
