"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/(protected)/actions";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EnvelopeIcon } from "@/components/ui/icons";

const baseNavLinks = [
  { label: "Accueil", href: "/" },
  { label: "Jouer", href: "/play" },
  { label: "Cours", href: "/tous-les-cours" },
  { label: "Aventure", href: "/quest" },
  { label: "Professeurs", href: "/teachers" },
];

export function AppHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        setIsAdmin(profile?.role === "admin");
      } catch (error) {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    await logoutAction();
    router.refresh();
  };

  // Construire la liste des liens de navigation
  const navLinks = [
    ...baseNavLinks,
    ...(isAdmin ? [{ label: "Dashboard", href: "/dashboard" }] : []),
  ];

  return (
    <header className="comic-panel-dark p-2 md:p-6">
      <div className="relative z-10 flex flex-col gap-2 md:gap-6 md:flex-row md:items-center md:justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 min-w-0">
          <Link href="/" className="text-lg md:text-2xl font-bold tracking-tight text-white transition-colors hover:text-cyan-300 text-outline leading-tight md:leading-normal break-words">
            English Quest
          </Link>
          <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-cyan-400 text-outline leading-tight md:leading-normal">
            L'anglais devient un jeu
          </p>
        </div>
        
        {/* Navigation - Grille sur mobile, ligne sur desktop */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 md:gap-2 text-xs md:text-sm font-bold md:flex md:flex-nowrap md:flex-1 md:justify-center md:mx-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="comic-button bg-slate-800 text-white px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm hover:bg-slate-700 whitespace-nowrap text-center border-2 md:border-4 border-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Actions utilisateur */}
        <div className="flex items-center justify-end gap-1.5 md:gap-3 flex-shrink-0 flex-wrap">
          {loading ? (
            <div className="h-8 md:h-10 w-24 md:w-32 animate-pulse comic-panel bg-slate-700/50" />
          ) : user ? (
            <>
              <Link
                href="/messages"
                className="comic-button bg-purple-600 text-white p-2 md:p-2.5 hover:bg-purple-700 relative flex items-center justify-center border-2 md:border-4 border-black"
                title="Mes messages"
                aria-label="Mes messages"
              >
                <EnvelopeIcon className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <Link
                href="/profile"
                className="comic-button bg-slate-800 text-white px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold hover:bg-slate-700 border-2 md:border-4 border-black whitespace-nowrap"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="comic-button bg-red-600 text-white px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold hover:bg-red-700 border-2 md:border-4 border-black whitespace-nowrap"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="comic-button bg-slate-800 text-white px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold hover:bg-slate-700 border-2 md:border-4 border-black whitespace-nowrap"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="comic-button bg-emerald-600 text-white px-3 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-bold hover:bg-emerald-700 border-2 md:border-4 border-black whitespace-nowrap"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}






