"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { logoutAction } from "@/app/(protected)/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CharacterFace } from "@/components/rewards/character-face";
import { guestHeaderState, type HeaderState } from "@/lib/navigation/header-state-types";

const baseNavLinks = [
  { label: "Accueil", href: "/" },
  { label: "Aventure", href: "/quest" },
  { label: "Cours", href: "/tous-les-cours" },
  { label: "Jeux", href: "/play" },
  { label: "Collection", href: "/collection" },
  { label: "Classements", href: "/leaderboard" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/tous-les-cours" && pathname.startsWith("/cours/")) return true;
  if (href === "/") {
    return pathname === "/" || pathname === "/home";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function ProfileRing({ state }: { state: HeaderState }) {
  const progress = Math.max(0, Math.min(100, Math.round(state.completionRate)));
  return (
    <span className="eq-ring" aria-hidden="true" style={{ ["--p" as string]: progress }}>
      <CharacterFace src={state.avatarUrl} size={32} className="eq-ring-portrait" />
    </span>
  );
}

export function AppHeader() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const pathname = usePathname();
  const router = useRouter();
  const [accountHeader, setAccountHeader] = useState<{ userId: string; state: HeaderState } | null>(null);
  const headerState = accountHeader && accountHeader.userId === userId ? accountHeader.state : guestHeaderState;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!userId) return;
    const account = userId;
    let controller: AbortController | null = null;
    let lastChecked = 0;

    async function loadHeaderState() {
      lastChecked = Date.now();
      controller?.abort();
      const request = new AbortController();
      controller = request;

      try {
        const response = await fetch("/api/header-state", { cache: "no-store", signal: request.signal });

        if (!response.ok) {
          throw new Error("Failed to fetch header state");
        }

        const data = (await response.json()) as HeaderState;

        if (!request.signal.aborted) {
          setAccountHeader({ userId: account, state: data });
        }
      } catch {
        if (!request.signal.aborted) {
          setAccountHeader(current => current?.userId === account ? current : {
            userId: account, state: { ...guestHeaderState, isAuthenticated: true },
          });
        }
      }
    }

    void loadHeaderState();

    const handleRefresh = () => {
      void loadHeaderState();
    };
    window.addEventListener("eq:reward", handleRefresh);
    window.addEventListener("itemEquipped", handleRefresh);
    window.addEventListener("eq:contact-notices", handleRefresh);
    const onReturn = () => {
      if (document.visibilityState === "visible" && Date.now() - lastChecked > 60_000) handleRefresh();
    };
    document.addEventListener("visibilitychange", onReturn);

    return () => {
      controller?.abort();
      window.removeEventListener("eq:reward", handleRefresh);
      window.removeEventListener("itemEquipped", handleRefresh);
      window.removeEventListener("eq:contact-notices", handleRefresh);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [userId]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutAction();
    setAccountHeader(null);
    router.refresh();
  };

  const navLinks = [
    ...baseNavLinks,
    // L'espace profs (classes, suivi, devoirs) : visible seulement des comptes prof et admin.
    // Les visiteurs trouvent la présentation sur /profs, en pied de page.
    ...(headerState.canAccessTeachers ? [{ label: "Profs", href: "/teachers" }] : []),
    ...(headerState.canAccessDashboard ? [{ label: "Dashboard", href: "/dashboard" }] : []),
  ];

  const resolvedLoading = loading || Boolean(userId && accountHeader?.userId !== userId);
  const notices = headerState.contactReplies;
  const messagesLabel = notices ? `Messages (${notices})` : "Messages";

  return (
    <header className="eq-header" data-staff={headerState.canAccessTeachers || headerState.canAccessDashboard || undefined}
      onKeyDown={(event) => {
        if (menuOpen && event.key === "Escape") {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}>
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
                {messagesLabel}
              </Link>
              <Link href="/profile" className="eq-profile-link" title="Mon profil">
                <ProfileRing state={headerState} />
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
          {user && !resolvedLoading ? (
            <Link href="/profile" className="eq-profile-shortcut" aria-label="Mon profil">
              <ProfileRing state={headerState} />
            </Link>
          ) : null}
          <ThemeToggle compact />
          <button
            ref={menuButton}
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
            {notices > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[var(--pro-primary)] px-1.5 text-xs font-bold text-white"
              aria-hidden="true" title="Réponse à consulter">{notices}</span>}
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
              onNavigate={() => setMenuOpen(false)}
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
                  {messagesLabel}
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
