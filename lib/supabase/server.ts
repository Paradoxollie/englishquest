// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client that syncs auth cookies with Next.js.
 * Use this in server actions and route handlers.
 * 
 * Note: In Next.js 16, cookies() is async, so this function is async too.
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, Next.js may try to collect page data even for dynamic pages
    // In this case, we throw a more specific error that can be caught during build
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NODE_ENV === 'production' && !process.env.VERCEL;
    
    if (isBuildTime) {
      // During build, we can't use Supabase, but we should still allow the build to continue
      // by throwing an error that Next.js can handle gracefully
      throw new Error(
        "Supabase environment variables are not available during build. " +
        "This is expected for dynamic pages. The page will be rendered at request time."
      );
    }
    
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Next.js 16 cookies() retourne un objet avec getAll()
        try {
          const allCookies = cookieStore.getAll();
          const mappedCookies = allCookies.map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
          // Log pour debug (à retirer en production)
          if (mappedCookies.length > 0) {
            console.log("Cookies disponibles:", mappedCookies.map((c) => c.name));
          }
          return mappedCookies;
        } catch (error) {
          // Si getAll() échoue, retourne un tableau vide
          // Les cookies seront définis lors du setAll()
          console.error("Error getting cookies:", error);
          return [];
        }
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            // Utilise les options fournies par @supabase/ssr qui sait comment configurer les cookies
            cookieStore.set(name, value, options);
          } catch (error) {
            // Ignore les erreurs de cookies dans certains contextes (ex: middleware)
            console.error(`Failed to set cookie ${name}:`, error);
          }
        });
      },
    },
  });
}
