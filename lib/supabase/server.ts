import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const isBuildTime =
      process.env.NEXT_PHASE === "phase-production-build" ||
      (process.env.NODE_ENV === "production" && !process.env.VERCEL);

    if (isBuildTime) {
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
        try {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        } catch (error) {
          console.error("Error getting cookies:", error);
          return [];
        }
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.error(`Failed to set cookie ${name}:`, error);
          }
        });
      },
    },
  });
}
