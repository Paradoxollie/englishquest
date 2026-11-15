"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowserClient();

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) {
          console.error("Session error:", error);
        }
        const nextUser = session?.user ?? null;
        lastUserIdRef.current = nextUser?.id ?? null;
        setUser(nextUser);
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      const nextUser = session?.user ?? null;
      const nextUserId = nextUser?.id ?? null;
      const prevUserId = lastUserIdRef.current;
      lastUserIdRef.current = nextUserId;

      setUser((prev) => (prev?.id === nextUserId && prev?.updated_at === nextUser?.updated_at ? prev : nextUser));
      setLoading(false);

      if (event === "SIGNED_IN" && prevUserId !== nextUserId) {
        router.refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

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

