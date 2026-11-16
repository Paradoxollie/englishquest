import "server-only";
import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, boolean>();

/**
 * Retourne le chemin public d'un extrait MP3 s'il existe dans `public/`,
 * sinon null. Évite toute requête 404 dans la console tant qu'un pack MP3
 * n'est pas encore déposé.
 */
export function resolveAudioAsset(publicPath: string | null | undefined): string | null {
  if (!publicPath) {
    return null;
  }
  const known = cache.get(publicPath);
  if (known !== undefined) {
    return known ? publicPath : null;
  }
  let exists = false;
  try {
    exists = fs.existsSync(path.join(process.cwd(), "public", publicPath.replace(/^\/+/, "")));
  } catch {
    exists = false;
  }
  cache.set(publicPath, exists);
  return exists ? publicPath : null;
}

/** Construit un dictionnaire `{ id: url }` limité aux MP3 réellement présents sur disque. */
export function resolveAudioMap(gameFolder: "spell-strike" | "echo-signal", ids: readonly string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const id of ids) {
    const publicPath = `/audio/${gameFolder}/${id}.mp3`;
    const resolved = resolveAudioAsset(publicPath);
    if (resolved) {
      result[id] = resolved;
    }
  }
  return result;
}
