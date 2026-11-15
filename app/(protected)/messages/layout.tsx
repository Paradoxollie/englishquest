import type { ReactNode } from "react";

export default function SectionLayout({ children }: { children: ReactNode }) {
  return <div className="eq-container eq-section">{children}</div>;
}
