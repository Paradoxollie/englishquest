import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// Ne pas mettre en cache cette route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Crée un hash anonyme de l'IP pour identifier les visiteurs uniques
 * sans stocker l'IP réelle (privacy-friendly)
 */
function hashIP(ip: string): string {
  // Utiliser un salt pour plus de sécurité
  const salt = process.env.VISITOR_HASH_SALT || 'englishquest-salt-2024';
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
    .substring(0, 32); // Limiter à 32 caractères
}

/**
 * Extrait l'IP réelle du visiteur depuis les headers
 */
function getClientIP(request: NextRequest): string {
  // Vercel utilise x-forwarded-for ou x-vercel-forwarded-for
  const forwardedFor = request.headers.get('x-forwarded-for');
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
  
  if (forwardedFor) {
    // Prendre la première IP (l'IP réelle du client)
    return forwardedFor.split(',')[0].trim();
  }
  
  if (vercelForwarded) {
    return vercelForwarded.split(',')[0].trim();
  }
  
  // Fallback sur x-real-ip ou l'IP de la requête
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Vérifie si le User-Agent est un bot/crawler
 */
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /baiduspider/i, /yandexbot/i, /sogou/i, /exabot/i,
    /facebot/i, /ia_archiver/i, /facebookexternalhit/i,
    /twitterbot/i, /rogerbot/i, /linkedinbot/i,
    /embedly/i, /quora/i, /pinterest/i, /slackbot/i,
    /redditbot/i, /applebot/i, /whatsapp/i, /flipboard/i,
    /tumblr/i, /bitlybot/i, /skypeuripreview/i,
    /nuzzel/i, /discordbot/i, /qwantify/i, /pinterestbot/i,
    /bitrix/i, /xing-contenttabreceiver/i, /chrome-lighthouse/i,
    /google-inspectiontool/i, /ahrefsbot/i, /semrushbot/i,
    /mj12bot/i, /dotbot/i, /megaindex/i, /blexbot/i,
    /petalbot/i, /applebot/i, /bingpreview/i,
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = createSupabaseAdminClient();
    
    // Extraire les données de la requête
    const body = await request.json().catch(() => ({}));
    const path = body.path || request.nextUrl.pathname || '/';
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || body.referrer || null;
    
    // FILTRE 1: Ignorer les bots et crawlers
    if (isBot(userAgent)) {
      return NextResponse.json({ success: true, skipped: 'bot' });
    }
    
    // FILTRE 2: Ignorer les prefetch requests de Next.js
    const isPrefetch = request.headers.get('x-middleware-prefetch') === '1' ||
                       request.headers.get('purpose') === 'prefetch' ||
                       request.headers.get('x-purpose') === 'prefetch';
    
    if (isPrefetch) {
      return NextResponse.json({ success: true, skipped: 'prefetch' });
    }
    
    // Obtenir l'IP et créer un hash
    const clientIP = getClientIP(request);
    
    // FILTRE 3: Ignorer les IPs invalides ou locales
    if (!clientIP || clientIP === 'unknown' || clientIP.startsWith('127.') || clientIP.startsWith('::1')) {
      return NextResponse.json({ success: true, skipped: 'invalid-ip' });
    }
    
    const visitorHash = hashIP(clientIP);
    
    // Obtenir l'ID utilisateur si connecté (depuis le header ou le body)
    const userId = body.userId || null;
    
    // Date de visite (normalisée à minuit UTC)
    const visitDate = new Date().toISOString().split('T')[0];
    
    // FILTRE 4: Déduplication - Vérifier si une visite similaire existe déjà dans les 30 dernières secondes
    // (pour éviter de compter plusieurs fois le même chargement de page)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { data: recentVisit } = await adminClient
      .from('site_visits')
      .select('id')
      .eq('visitor_hash', visitorHash)
      .eq('path', path)
      .gte('visited_at', thirtySecondsAgo)
      .limit(1)
      .maybeSingle();
    
    // Si une visite similaire existe déjà dans les 30 dernières secondes, on ignore
    if (recentVisit) {
      return NextResponse.json({ success: true, skipped: 'duplicate' });
    }
    
    // Enregistrer la visite dans la base de données
    const { error } = await adminClient
      .from('site_visits')
      .insert({
        visitor_hash: visitorHash,
        user_agent: userAgent,
        path: path,
        visit_date: visitDate,
        user_id: userId || null,
        referrer: referrer,
        visited_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Error tracking visit:', error);
      // Ne pas faire échouer la requête si le tracking échoue
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track-visit route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Permettre aussi GET pour faciliter les tests
export async function GET(request: NextRequest) {
  return POST(request);
}

