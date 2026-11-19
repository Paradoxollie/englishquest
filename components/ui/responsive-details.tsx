"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Details stay user-controlled between changes of layout. */
export function ResponsiveDetails({ summary, className, children }: {
  summary: ReactNode;
  className: string;
  children: ReactNode;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px)");
    function updateLayout() {
      if (details.current) details.current.open = desktop.matches;
    }
    updateLayout();
    desktop.addEventListener("change", updateLayout);
    return () => desktop.removeEventListener("change", updateLayout);
  }, []);
  return (
    <details ref={details} className={className}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
