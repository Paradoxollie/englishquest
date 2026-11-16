"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { logoutAction } from "@/app/(protected)/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { guestHeaderState, type HeaderState } from "@/lib/navigation/header-state-types";

const baseNavLinks = [
  { label: "Accueil", href: "/" },
  { label: "Aventure", href: "/quest" },
  { label: "Cours", href: "/tous-les-cours" },
  { label: "Jeux", href: "/play" },
  { label: "Classements", href: "/leaderboard" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "/home";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const pathname = usePathname();
  const router = useRouter();
  const [headerState, setHeaderState] = useState<HeaderState>(guestHeaderState);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadHeaderState() {
      if (!userId) {
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

    const handleRefresh = () => {
      void loadHeaderState();
    };
    window.addEventListener("eq:reward", handleRefresh);

    return () => {
      ignore = true;
      window.removeEventListener("eq:reward", handleRefresh);
    };
  }, [userId]);

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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E4ED8" stroke="#141A29" strokeWidth="2" />
              <path
                d="M8.5 11.5C8.5 10.67 9.17 10 10 10H14.5C15.33 10 16 10.67 16 11.5V22.5C15.2 21.85 14.15 21.5 13 21.5H10C9.17 21.5 8.5 20.83 8.5 20V11.5Z"
                fill="#FFFDF9"
                stroke="#141A29"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M23.5 11.5C23.5 10.67 22.83 10 22 10H17.5C16.67 10 16 10.67 16 11.5V22.5C16.8 21.85 17.85 21.5 19 21.5H22C22.83 21.5 23.5 20.83 23.5 20V11.5Z"
                fill="#FFFDF9"
                stroke="#141A29"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M22.5 5.2L23.45 7.12L25.57 7.43L24.03 8.92L24.39 11.03L22.5 10.04L20.61 11.03L20.97 8.92L19.43 7.43L21.55 7.12L22.5 5.2Z"
                fill="#F6C332"
                stroke="#141A29"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
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
          <ThemeToggle compact />
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

        <div className="eq-mobile-controls">
          <ThemeToggle compact />
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
            <ThemeToggle testId="theme-toggle-drawer" />
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
