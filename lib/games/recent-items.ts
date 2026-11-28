// Contenu vu dans cet onglet. Aucune identité, réponse ou donnée de score.
type Game = "grammar-rush" | "flash-translation" | "flashback" | "wordfall" | "enigma-scroll" | "space-lex";
const limit = 96;

export function recentGameItems(game: Game): string[] {
  if (typeof window === "undefined") return [];
  try {
    const list: unknown = JSON.parse(window.sessionStorage.getItem("eq-recent-" + game) ?? "[]");
    return Array.isArray(list) ? list.filter((item): item is string => typeof item === "string").slice(-limit) : [];
  } catch { return []; }
}

export function rememberGameItem(game: Game, item: string) {
  if (typeof window === "undefined" || !item) return;
  const recent = recentGameItems(game);
  if (recent.at(-1) === item) return;
  const next = [...recent.filter(previous => previous !== item), item].slice(-limit);
  try { window.sessionStorage.setItem("eq-recent-" + game, JSON.stringify(next)); } catch { /* Le jeu fonctionne sans stockage. */ }
}

export function preferFresh<T>(items: T[], recent: readonly string[], key: (item: T) => string): T[] {
  if (recent.length === 0) return items;
  const seen = new Set(recent);
  const fresh = items.filter(item => !seen.has(key(item)));
  if (fresh.length) return fresh;
  const oldest = recent.find(id => items.some(item => key(item) === id));
  return oldest === undefined ? items : items.filter(item => key(item) === oldest);
}
