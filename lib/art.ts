/**
 * Chemins des visuels du site, tels qu'ils seront servis depuis `public/art/`.
 *
 * Les fichiers sont produits à partir des sources de `public/art-src/`
 * (voir la fiche « Direction artistique »). Tant qu'un fichier n'existe pas,
 * les pages basculent sur un fond en dégradé : rien ne casse, rien de laid
 * ne s'affiche. La vérification d'existence est dans `lib/art-server.ts`.
 */
export const ART = {
  heroHome: "/art/bd/accueil.jpg",
  act: (chapterId: number) => `/art/bd/chapitre-${chapterId}.jpg`,
  game: (slug: string) => `/art/bd/jeu-${slug}.jpg`,
} as const;
