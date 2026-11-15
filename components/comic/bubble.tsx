import type { ReactNode } from "react";

type Tail = "left" | "right" | "bottom-left" | "bottom-right" | "top-left";

/** Bulle de BD : consignes, encouragements, retours des mascottes. */
export function Bubble({
  children,
  tail = "left",
  tone = "white",
  className = "",
}: {
  children: ReactNode;
  tail?: Tail;
  tone?: "white" | "yellow";
  className?: string;
}) {
  return <div className={`eq-bubble eq-bubble-${tone} eq-bubble-tail-${tail} ${className}`}>{children}</div>;
}
