"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { logoutAction } from "@/app/(protected)/actions";
import { EnvelopeIcon } from "@/components/ui/icons";
import type { HeaderState } from "@/lib/navigation/header-state";

const baseNavLinks = [
  { label: "Accueil", href: "/" },
  { label: "Jouer", href: "/play" },
  { label: "Cours", href: "/tous-les-cours" },
  { label: "Aventure", href: "/quest" },
  { label: "Professeurs", href: "/teachers" },
];

const guestHeaderState: HeaderState = {
  isAuthenticated: false,
  username: null,
  role: null,
  completionRate: 0,
  canAccessDashboard: false,
  canAccessTeachers: false,
  focusCourse: null,
  focusGame: null,
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [headerState, setHeaderState] = useState<HeaderState>(guestHeaderState);
  const [headerLoading, setHeaderLoading] = useState(false);

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
        const response = await fetch("/api/header-state", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch header state");
        }

        const data = (await response.json()) as HeaderState;

        if (!ignore) {
          setHeaderState(data);
        }
      } catch {
        if (!ignore) {
          setHeaderState({
            ...guestHeaderState,
            isAuthenticated: true,
          });
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
  }, [pathname, user]);

  const handleLogout = async () => {
    await logoutAction();
    router.refresh();
  };

  const navLinks = [
    ...baseNavLinks,
    ...(headerState.canAccessDashboard ? [{ label: "Dashboard", href: "/dashboard" }] : []),
  ];

  const resolvedLoading = loading || (Boolean(user) && headerLoading);

  return (
    <header className="comic-panel-dark p-2 md:p-6">
      <div className="relative z-10 flex flex-col gap-3 md:gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-shrink-0">
            <Link
              href="/"
              className="break-words text-lg font-bold leading-tight text-white text-outline transition-colors hover:text-cyan-300 md:text-2xl md:leading-normal"
            >
              English Quest
            </Link>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 text-outline md:mt-1 md:text-xs md:tracking-[0.3em]">
              L'anglais devient un systeme de progression
            </p>
          </div>

          <div className="flex items-center justify-end gap-1.5 md:gap-3">
            {resolvedLoading ? (
              <div className="h-8 w-24 animate-pulse comic-panel bg-slate-700/50 md:h-10 md:w-36" />
            ) : user ? (
              <>
                <Link
                  href="/messages"
                  className="comic-button relative flex items-center justify-center border-2 border-black bg-purple-600 p-2 text-white hover:bg-purple-700 md:border-4 md:p-2.5"
                  title="Mes messages"
                  aria-label="Mes messages"
                >
                  <EnvelopeIcon className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
                <Link
                  href="/profile"
                  className="comic-button whitespace-nowrap border-2 border-black bg-slate-800 px-2 py-1.5 text-xs font-bold text-white hover:bg-slate-700 md:border-4 md:px-4 md:py-2 md:text-sm"
                >
                  {headerState.username ? headerState.username : "Profil"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="comic-button whitespace-nowrap border-2 border-black bg-red-600 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-700 md:border-4 md:px-4 md:py-2 md:text-sm"
                >
                  Deconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="comic-button whitespace-nowrap border-2 border-black bg-slate-800 px-2 py-1.5 text-xs font-bold text-white hover:bg-slate-700 md:border-4 md:px-4 md:py-2 md:text-sm"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="comic-button whitespace-nowrap border-2 border-black bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 md:border-4 md:px-6 md:py-2 md:text-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <nav className="grid grid-cols-2 gap-1.5 text-xs font-bold sm:grid-cols-3 md:flex md:flex-nowrap md:gap-2 md:text-sm">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`comic-button whitespace-nowrap border-2 border-black px-2 py-1.5 text-center md:border-4 md:px-3 md:py-2 ${
                    active
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-3">
            <div className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Role
              </p>
              <p className="mt-1 truncate text-xs font-bold text-white md:text-sm">
                {headerState.role ?? "Visiteur"}
              </p>
            </div>

            <Link
              href={headerState.focusCourse?.href ?? "/quest"}
              className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2 transition-colors hover:bg-slate-800"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Focus cours
              </p>
              <p className="mt-1 truncate text-xs font-bold text-cyan-300 md:text-sm">
                {headerState.focusCourse
                  ? `Cours ${headerState.focusCourse.courseId}`
                  : "Demarrer"}
              </p>
            </Link>

            <Link
              href={headerState.focusGame?.href ?? "/play"}
              className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2 transition-colors hover:bg-slate-800"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Jeu cible
              </p>
              <p className="mt-1 truncate text-xs font-bold text-amber-300 md:text-sm">
                {headerState.focusGame ? headerState.focusGame.name : "Explorer"}
              </p>
            </Link>
          </div>
        </div>

        {headerState.isAuthenticated && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-200 md:text-xs">
            {headerState.focusCourse && (
              <Link
                href={headerState.focusCourse.href}
                className="comic-panel border-2 border-black bg-emerald-600 px-3 py-1 text-white"
              >
                Continuer: {headerState.focusCourse.title}
              </Link>
            )}
            {headerState.focusGame && (
              <Link
                href={headerState.focusGame.href}
                className="comic-panel border-2 border-black bg-indigo-600 px-3 py-1 text-white"
              >
                Pratique ciblee: {headerState.focusGame.name}
              </Link>
            )}
            <span className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-slate-200">
              Progression: {headerState.completionRate}%
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
