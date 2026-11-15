import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const AUTH_TIMEOUT_MS = 5000;

/**
 * Lit l'utilisateur authentifié au plus une fois par requête serveur.
 * Si aucun cookie Supabase (`sb-*`) n'est présent, retourne `null`
 * immédiatement sans appeler Supabase ; en cas de base injoignable,
 * coupe le backoff d'auth au bout de `AUTH_TIMEOUT_MS` pour ne pas
 * figer le rendu pendant 30 secondes.
 */
export const getServerUser = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const hasSupabaseCookie = cookieStore.getAll().some((cookie) => cookie.name.startsWith("sb-"));
    if (!hasSupabaseCookie) {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    let timerId: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<null>((resolve) => {
          timerId = setTimeout(() => resolve(null), AUTH_TIMEOUT_MS);
        }),
      ]);
      return result?.data?.user ?? null;
    } finally {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
    }
  } catch {
    return null;
  }
});
