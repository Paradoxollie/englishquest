"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { logoutAction } from "@/app/(protected)/actions";
import { guestHeaderState, type HeaderState } from "@/lib/navigation/header-state-types";

const baseNavLinks = [
  { label: "Accueil", href: "/" },
  { label: "Aventure", href: "/quest" },
  { label: "Cours", href: "/tous-les-cours" },
  { label: "Jeux", href: "/play" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "/home";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [headerState, setHeaderState] = useState<HeaderState>(guestHeaderState);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadHeaderState() {
      if (!user) {
        setHeaderState(guestHeaderState);
        setHeaderLoading(false);
        return;
      }

      setHeaderLoading(true);

      try {
        const response = await fetch("/api/header-state", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch header state");
        }

        const data = (await response.json()) as HeaderState;

        if (!ignore) {
          setHeaderState(data);
        }
      } catch {
        if (!ignore) {
          setHeaderState({ ...guestHeaderState, isAuthenticated: true });
        }
      } finally {
        if (!ignore) {
          setHeaderLoading(false);
        }
      }
    }

    void loadHeaderState();

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutAction();
    router.refresh();
  };

  const navLinks = [
    ...baseNavLinks,
    // L'espace profs (classes, suivi, devoirs) : visible seulement des comptes prof et admin.
    // Les visiteurs trouvent la présentation sur /profs, en pied de page.
    ...(headerState.canAccessTeachers ? [{ label: "Profs", href: "/teachers" }] : []),
    ...(headerState.canAccessDashboard ? [{ label: "Dashboard", href: "/dashboard" }] : []),
  ];

  const resolvedLoading = loading || (Boolean(user) && headerLoading);
  const completion = Math.max(0, Math.min(100, Math.round(headerState.completionRate)));

  return (
    <header className="eq-header">
      <div className="eq-container eq-header-row">
        <Link href={user ? "/home" : "/"} className="eq-brand" aria-label="English Quest, accueil">
          <span className="eq-brand-mark" aria-hidden="true">
            EQ
          </span>
          <span className="eq-brand-text">English Quest</span>
        </Link>

        <nav className="eq-nav" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="eq-nav-link"
              aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="eq-header-actions">
          {resolvedLoading ? (
            <span className="eq-header-skeleton" aria-hidden="true" />
          ) : user ? (
            <>
              <Link href="/messages" className="eq-btn eq-btn-ghost eq-btn-sm" title="Mes messages">
                Messages
              </Link>
              <Link href="/profile" className="eq-profile-link" title="Mon profil">
                <span
                  className="eq-ring"
                  data-level={headerState.username ? headerState.username.slice(0, 1).toUpperCase() : "·"}
                  style={{ ["--p" as string]: completion }}
                  aria-hidden="true"
                />
                <span className="eq-profile-name">{headerState.username ?? "Profil"}</span>
              </Link>
              <button type="button" onClick={handleLogout} className="eq-btn eq-btn-ghost eq-btn-sm">
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="eq-btn eq-btn-ghost eq-btn-sm">
                Se connecter
              </Link>
              <Link href="/auth/signup" className="eq-btn eq-btn-gold eq-btn-sm">
                Créer un compte
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="eq-burger"
          aria-expanded={menuOpen}
          aria-controls="eq-mobile-menu"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="eq-burger-bar" />
          <span className="eq-burger-bar" />
          <span className="eq-burger-bar" />
        </button>
      </div>

      <div id="eq-mobile-menu" className="eq-mobile-menu" hidden={!menuOpen}>
        <nav className="eq-container eq-mobile-nav" aria-label="Navigation mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="eq-mobile-link"
              aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="eq-mobile-actions">
            {user ? (
              <>
                <Link href="/profile" className="eq-btn eq-btn-ghost">
                  Mon profil
                </Link>
                <Link href="/messages" className="eq-btn eq-btn-ghost">
                  Messages
                </Link>
                <button type="button" onClick={handleLogout} className="eq-btn eq-btn-ghost">
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="eq-btn eq-btn-ghost">
                  Se connecter
                </Link>
                <Link href="/auth/signup" className="eq-btn eq-btn-gold">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
