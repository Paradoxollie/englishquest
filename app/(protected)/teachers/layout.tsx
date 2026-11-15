import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default function SectionLayout({ children }: { children: ReactNode }) {
  void children;
  redirect("/home");
}
