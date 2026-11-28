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
  { label: "Classements", href: "/leaderboard" },
  { label: "Collection", href: "/collection" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/tous-les-cours" && (pathname.startsWith("/cours/") || pathname.startsWith("/examen/") || pathname === "/test-de-niveau")) return true;
  if (href === "/play" && pathname === "/essayer") return true;
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

function HeaderMenu({ state, signedIn, loading, onLogout }: {
  state: HeaderState; signedIn: boolean; loading: boolean; onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const notices = state.contactReplies;
  const noticeLabel = notices === 1 ? "une réponse à consulter" : `${notices} réponses à consulter`;
  const links = [
    ...(state.canAccessDashboard ? [{ href: "/dashboard", label: "Tableau de bord" }] : []),
    ...(state.canAccessTeachers ? [{ href: "/teachers", label: "Espace prof" }] : []),
    ...(signedIn ? [
      { href: "/messages", label: notices ? `Messages (${notices})` : "Messages" },
      { href: "/profile", label: "Mon profil" },
    ] : []),
    ...(!signedIn && !loading ? [
      { href: "/auth/login", label: "Se connecter" },
      { href: "/auth/signup", label: "Créer un compte" },
    ] : []),
  ];

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: Event) {
      if (event.target instanceof Node && !region.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      button.current?.focus();
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="eq-menu" ref={region}>
      <button className="eq-burger" type="button" ref={button} aria-expanded={open} aria-controls="eq-site-menu"
        aria-label={open ? "Fermer le menu" : notices ? `Ouvrir le menu, ${noticeLabel}` : "Ouvrir le menu"}
        onClick={() => setOpen(!open)}>
        <span className="eq-menu-icon" aria-hidden="true">
          <span className="eq-burger-bar" /><span className="eq-burger-bar" /><span className="eq-burger-bar" />
        </span>
        <span>Menu</span>
        {notices > 0 && <span aria-hidden="true" className="eq-menu-notice">{notices}</span>}
      </button>
      <div id="eq-site-menu" className="eq-mobile-menu" hidden={!open}>
        <nav className="eq-mobile-nav" aria-label="Menu du site">
          {links.map(link => <Link key={link.href} href={link.href} className="eq-mobile-link"
            aria-current={isActivePath(pathname, link.href) ? "page" : undefined} onNavigate={() => setOpen(false)}>
            {link.label}
          </Link>)}
        </nav>
        <div className="eq-mobile-actions">
          <ThemeToggle testId="theme-toggle-drawer" />
          {signedIn && <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm" onClick={() => {
            setOpen(false);
            void onLogout();
          }}>Se déconnecter</button>}
        </div>
      </div>
    </div>
  );
}

export function AppHeader() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const pathname = usePathname();
  const router = useRouter();
  const [accountHeader, setAccountHeader] = useState<{ userId: string; state: HeaderState } | null>(null);
  const headerState = accountHeader && accountHeader.userId === userId ? accountHeader.state : guestHeaderState;

  useEffect(() => {
    if (!userId) return;
    const account = userId;
    let controller: AbortController | null = null;
    let lastChecked = 0;
    let retryTimer: number | undefined;
    let retried = false;

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
          if (!data.role && !retried) retryOnce();
        }
      } catch {
        if (!request.signal.aborted) {
          setAccountHeader(current => current?.userId === account ? current : {
            userId: account, state: { ...guestHeaderState, isAuthenticated: true },
          });
          if (!retried) retryOnce();
        }
      }
    }

    function retryOnce() {
      retried = true;
      retryTimer = window.setTimeout(loadHeaderState, 2500);
    }

    void loadHeaderState();

    const handleRefresh = () => {
      void loadHeaderState();
    };
    window.addEventListener("eq:reward", handleRefresh);
    window.addEventListener("itemEquipped", handleRefresh);
    window.addEventListener("eq:contact-notices", handleRefresh);
    window.addEventListener("online", handleRefresh);
    const onReturn = () => {
      if (document.visibilityState === "visible" && Date.now() - lastChecked > 60_000) handleRefresh();
    };
    document.addEventListener("visibilitychange", onReturn);

    return () => {
      controller?.abort();
      window.clearTimeout(retryTimer);
      window.removeEventListener("eq:reward", handleRefresh);
      window.removeEventListener("itemEquipped", handleRefresh);
      window.removeEventListener("eq:contact-notices", handleRefresh);
      window.removeEventListener("online", handleRefresh);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [userId]);

  const handleLogout = async () => {
    await logoutAction();
    setAccountHeader(null);
    router.refresh();
  };

  const resolvedLoading = loading || Boolean(userId && accountHeader?.userId !== userId);
  const notices = headerState.contactReplies;
  const messagesLabel = notices ? `Messages (${notices})` : "Messages";
  const staff = headerState.canAccessTeachers || headerState.canAccessDashboard;
  const staffHref = headerState.canAccessDashboard ? "/dashboard" : "/teachers";
  const homeHref = user ? "/home" : "/";

  return (
    <header className="eq-header">
      <div className="eq-container eq-header-row">
        <Link href={homeHref} className="eq-brand" aria-label="English Quest, accueil"
          aria-current={isActivePath(pathname, "/") ? "page" : undefined}>
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
          <span className="eq-brand-copy">
            <span className="eq-brand-text">English Quest</span>
            <span className="eq-brand-home">Accueil</span>
          </span>
        </Link>

        <nav className="eq-nav" aria-label="Navigation principale">
          {baseNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href === "/" ? homeHref : link.href}
              className={link.href === "/" ? "eq-nav-link eq-nav-home" : "eq-nav-link"}
              aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="eq-header-actions">
          {resolvedLoading ? <span className="eq-header-skeleton" aria-hidden="true" /> : user ? <>
            {staff && <Link className="eq-staff-shortcut" href={staffHref}
              aria-label={headerState.canAccessDashboard ? "Tableau de bord admin" : "Espace prof"}
              aria-current={isActivePath(pathname, staffHref) ? "page" : undefined}>
              <span className="eq-staff-short">{headerState.canAccessDashboard ? "Admin" : "Profs"}</span>
              <span className="eq-staff-full">{headerState.canAccessDashboard ? "Tableau de bord" : "Espace prof"}</span>
            </Link>}
            <Link href="/messages" className="eq-desktop-action eq-btn eq-btn-ghost eq-btn-sm">{messagesLabel}</Link>
            <Link href="/profile" className={`eq-profile-link${staff ? " eq-desktop-action" : ""}`} aria-label="Mon profil">
              <ProfileRing state={headerState} /><span className="eq-profile-name">{headerState.username ?? "Profil"}</span>
            </Link>
          </> : <>
            <Link href="/auth/login" className="eq-login-shortcut">Connexion</Link>
            <Link href="/auth/signup" className="eq-desktop-action eq-btn eq-btn-gold eq-btn-sm">Créer un compte</Link>
          </>}
          <HeaderMenu key={pathname} state={headerState} signedIn={!!user} loading={resolvedLoading} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}
