import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Point d'arrivée des liens envoyés par Supabase (réinitialisation de mot de
 * passe, confirmation d'adresse). Échange le code contre une session, puis
 * redirige vers la page demandée.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/home";
  const next = nextParam.startsWith("/") ? nextParam : "/home";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("auth callback", error);
  }

  return NextResponse.redirect(`${origin}/auth/forgot?erreur=lien`);
}
