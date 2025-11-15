import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware pour tracker les visites sur le site
 * 
 * Ce middleware enregistre automatiquement chaque visite via l'API route
 * pour permettre l'analyse des statistiques de trafic.
 * 
 * Le tracking se fait via une requête asynchrone non-bloquante.
 */
export async function middleware(request: NextRequest) {
  // Ignorer les requêtes pour les assets statiques, API routes, etc.
  const pathname = request.nextUrl.pathname;
  
  // Ne pas tracker :
  // - Les fichiers statiques (images, CSS, JS, etc.)
  // - Les API routes (sauf celle de tracking elle-même)
  // - Les fichiers Next.js internes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
  }
  
  // Enregistrer la visite via l'API route de manière asynchrone (non-bloquant)
  // On utilise l'URL complète pour que ça fonctionne sur Vercel
  const baseUrl = request.nextUrl.origin;
  
  // Fire-and-forget : on ne bloque pas la requête
  fetch(`${baseUrl}/api/track-visit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': request.headers.get('user-agent') || '',
      'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
      'x-vercel-forwarded-for': request.headers.get('x-vercel-forwarded-for') || '',
      'x-real-ip': request.headers.get('x-real-ip') || '',
      'referer': request.headers.get('referer') || '',
    },
    body: JSON.stringify({
      path: pathname,
      referrer: request.headers.get('referer') || null,
    }),
  }).catch(() => {
    // Ignorer silencieusement les erreurs de tracking
    // pour ne pas affecter l'expérience utilisateur
  });
  
  // Continuer avec la requête normale immédiatement
  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

