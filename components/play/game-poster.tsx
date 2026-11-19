"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Reserve the illustrated card frame, then fetch its art as it approaches the screen. */
export function GamePoster({ children, priority }: { children: ReactNode; priority: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    if (priority || !frame.current) return;
    if (!("IntersectionObserver" in window)) {
      const nextFrame = requestAnimationFrame(() => setNearby(true));
      return () => cancelAnimationFrame(nextFrame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearby(true);
        observer.disconnect();
      }
    }, { rootMargin: "280px 0px" });
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={frame} className="eq-game-poster">
      {priority || nearby ? children : <noscript>{children}</noscript>}
    </div>
  );
}
