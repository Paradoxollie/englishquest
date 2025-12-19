"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowserClient();

    // Vérifier la session initiale avec un délai court pour laisser les cookies se synchroniser
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (isMounted) {
          if (error) {
            console.error("Session error:", error);
          }
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Vérifier immédiatement
    checkSession();
    
    // Re-vérifier après un court délai pour laisser les cookies se synchroniser
    const timeoutId = setTimeout(() => {
      checkSession();
    }, 100);

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Rafraîchir la page si on est sur une page protégée et qu'on vient de se connecter
          if (event === "SIGNED_IN" && pathname?.startsWith("/")) {
            router.refresh();
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

