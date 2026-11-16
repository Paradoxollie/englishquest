"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/dashboard", label: "Vue d'ensemble", exact: true },
  { href: "/dashboard/users", label: "Utilisateurs", exact: false },
  { href: "/dashboard/messages", label: "Messages", exact: false },
  { href: "/dashboard/shop", label: "Boutique", exact: false },
  { href: "/dashboard/promote-admin", label: "Promotion", exact: false },
  { href: "/teachers", label: "Espace profs", exact: false },
] as const;

const TEACHER_LINKS = [
  { href: "/dashboard", label: "Vue d'ensemble", exact: true },
  { href: "/teachers", label: "Espace profs", exact: false },
] as const;

/** Navigation horizontale du back-office entre la vue globale et les outils de gestion. */
export function DashboardNav({ isAdmin = true }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? ADMIN_LINKS : TEACHER_LINKS;

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-[var(--pro-border)] pb-4" aria-label="Navigation administration">
      {links.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`eq-btn eq-btn-sm ${active ? "eq-btn-primary" : "eq-btn-ghost"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
