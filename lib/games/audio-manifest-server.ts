import "server-only";
import fs from "node:fs";
import path from "node:path";
import recordings from "@/public/audio/recordings.json";

const cache = new Map<string, boolean>();
const packagedClips = new Set([
  ...recordings.words.map(id => `/audio/spell-strike/${id}.mp3`),
  ...recordings.sentences.map(id => `/audio/spell-strike/${id}-sentence.mp3`),
  ...Object.keys(recordings.dialogues).map(id => `/audio/echo-signal/${id}.mp3`),
]);

export const dialogueLineStarts: Record<string, number[]> = recordings.dialogues;

/**
 * Retourne le chemin public d'un extrait MP3 s'il existe dans `public/`,
 * sinon null. Évite toute requête 404 dans la console tant qu'un pack MP3
 * n'est pas encore déposé.
 */
export function resolveAudioAsset(publicPath: string | null | undefined): string | null {
  if (!publicPath) {
    return null;
  }
  // Static hosting can serve public assets independently of the server's filesystem.
  if (packagedClips.has(publicPath)) return `${publicPath}?v=${recordings.revision}`;
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
