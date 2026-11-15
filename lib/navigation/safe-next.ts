/**
 * Chemin de retour après connexion ou inscription (`?next=/rejoindre?code=ABC234`).
 * Seuls les chemins internes passent : pas d'autre domaine, pas de « //site »,
 * pas de barre oblique inverse, pas de caractères de contrôle.
 */
const MAX_NEXT_LENGTH = 300;
const ORIGIN = "https://englishquest.invalid";

export function getSafeNextPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (candidate.length === 0 || candidate.length > MAX_NEXT_LENGTH) return null;
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return null;
  if (Array.from(candidate).some((character) => character.charCodeAt(0) < 0x20 || character.charCodeAt(0) === 0x7f)) {
    return null;
  }

  try {
    const url = new URL(candidate, ORIGIN);
    if (url.origin !== ORIGIN) return null;
    // Revenir sur une page d'authentification ferait tourner en rond.
    if (url.pathname.startsWith("/auth/")) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

/** Ajoute `?next=` à une adresse d'authentification quand un retour est prévu. */
export function withNextParam(href: string, next: string | null): string {
  if (!next) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}next=${encodeURIComponent(next)}`;
}
