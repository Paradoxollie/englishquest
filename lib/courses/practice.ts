/**
 * Jeu d'entraînement de chaque mission : Grammar Rush, le seul jeu qui pose les
 * questions des cours. Sur une mission, une question sur trois vient du cours
 * (voir lib/games/grammar-rush-server.ts). Les six autres jeux restent en
 * entraînement libre (vocabulaire, verbes, orthographe).
 *
 * Module sans dépendance : importable depuis les composants client.
 */
export const MISSION_GAME_SLUG = "grammar-rush";

/** Lien d'entraînement ciblé sur la notion d'un cours. */
export function getCoursePracticeHref(courseId: number) {
  return `/play/${MISSION_GAME_SLUG}?cours=${courseId}`;
}
