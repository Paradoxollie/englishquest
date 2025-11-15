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
  
  // Check if it's a Supabase storage URL
  const isSupabaseStorage = url.includes("supabase.co/storage") || url.includes("supabase.storage");
  
  if (isSupabaseStorage) {
    return addCacheBusting(url);
  }
  
  return url;
}

