import "server-only";
import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, boolean>();

/**
 * Retourne le chemin public si le fichier existe dans `public/`, sinon null.
 * Le résultat est mis en cache pour la durée du processus.
 */
export function resolveArt(publicPath: string | null | undefined): string | null {
  if (!publicPath) {
    return null;
  }
  const known = cache.get(publicPath);
  if (known !== undefined) {
    return known ? publicPath : null;
  }
  let exists = false;
  try {
    exists = fs.existsSync(path.join(process.cwd(), "public", publicPath));
  } catch {
    exists = false;
  }
  cache.set(publicPath, exists);
  return exists ? publicPath : null;
}
