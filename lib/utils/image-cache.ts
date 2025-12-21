/**
 * Utility functions for image cache management
 */

/**
 * Add cache busting parameter to image URL
 * This forces the browser/CDN to reload the image
 */
export function addCacheBusting(url: string | null | undefined): string {
  if (!url) return "";

  // If URL already has query parameters, append with &
  // Otherwise, add with ?
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
}

/**
 * Add cache busting only if the URL is from Supabase storage
 * This prevents unnecessary cache busting on external URLs
 */
export function addCacheBustingIfSupabase(url: string | null | undefined): string {
  if (!url) return "";

  // OPTIMIZATION: Do NOT add cache busting for read operations.
  // This was causing massive bandwidth usage (Cached Egress) because every render fetched a "new" image.
  // We rely on standard browser caching now.
  return url;
}

