/**
 * Chemins des visuels du site, tels qu'ils seront servis depuis `public/art/`.
 *
 * Les fichiers sont produits à partir des sources de `public/art-src/`
 * (voir la fiche « Direction artistique »). Tant qu'un fichier n'existe pas,
 * les pages basculent sur un fond en dégradé : rien ne casse, rien de laid
 * ne s'affiche. La vérification d'existence est dans `lib/art-server.ts`.
 */
export const ART = {
  heroHome: "/art/hero-home.jpg",
  heroGames: "/art/hero-games.jpg",
  act: (chapterId: number) => `/art/act-${chapterId}.jpg`,
  game: (slug: string) => `/art/game-${slug}.jpg`,
  rewardLevelUp: "/art/reward-level-up.jpg",
  onboarding: "/art/onboarding-placement.jpg",
} as const;
