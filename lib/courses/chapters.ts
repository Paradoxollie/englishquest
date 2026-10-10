import { paliers } from "@/lib/courses/data";

/**
 * Les cinq chapitres de l'aventure. Un chapitre = un palier de dix cours.
 *
 * `artSrc` pointe vers l'image de fond du chapitre sur la carte. Le fichier
 * peut ne pas exister encore : la page vérifie et bascule sur un dégradé.
 */
export type Chapter = {
  id: number;
  name: string;
  level: string;
  tagline: string;
  /** Couleur d'accent du chapitre (chips, anneau du nœud courant). */
  accent: string;
  /** Deux couleurs du dégradé de secours. */
  gradient: [string, string];
  artSrc: string;
  courseIds: number[];
};

const chapterDefinitions: Omit<Chapter, "courseIds" | "level">[] = [
  {
    id: 1,
    name: "Fondations",
    tagline: "Parler de soi, du présent et de ses habitudes.",
    accent: "#3ec6e8",
    gradient: ["#0f2a3f", "#0e1526"],
    artSrc: "/art/act-1.jpg",
  },
  {
    id: 2,
    name: "Élan",
    tagline: "Raconter le passé et se projeter dans l'avenir.",
    accent: "#5bd39a",
    gradient: ["#0f3326", "#0e1526"],
    artSrc: "/art/act-2.jpg",
  },
  {
    id: 3,
    name: "Connexion",
    tagline: "Relier les idées, nuancer, comparer.",
    accent: "#8b8cf6",
    gradient: ["#1f1f4a", "#0e1526"],
    artSrc: "/art/act-3.jpg",
  },
  {
    id: 4,
    name: "Tactique",
    tagline: "Les structures qui font la différence à l'écrit comme à l'oral.",
    accent: "#f2b53a",
    gradient: ["#3d2a0c", "#0e1526"],
    artSrc: "/art/act-4.jpg",
  },
  {
    id: 5,
    name: "Maîtrise",
    tagline: "Les finesses de la langue, jusqu'au niveau avancé.",
    accent: "#ff6b6b",
    gradient: ["#421a1f", "#0e1526"],
    artSrc: "/art/act-5.jpg",
  },
];

export const chapters: Chapter[] = chapterDefinitions.map((definition) => {
  const palier = paliers.find((item) => item.id === definition.id);
  return {
    ...definition,
    level: palier?.level ?? "",
    courseIds: palier?.courses.map((course) => course.id) ?? [],
  };
});

export function getChapterForCourse(courseId: number): Chapter {
  return chapters.find((chapter) => chapter.courseIds.includes(courseId)) ?? chapters[0];
}

export function getChapter(id: number): Chapter {
  return chapters.find((chapter) => chapter.id === id) ?? chapters[0];
}

/** Nom court d'un cours pour la carte : la partie entre parenthèses si elle existe. */
export function getCourseShortName(title: string) {
  const match = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const main = match ? match[1].trim() : title.trim();
  const inner = match ? match[2].trim() : null;
  // La parenthèse porte en général le point de grammaire en anglais
  // ("Present Simple"). Quand elle commence par un article français
  // ("Les Fondamentaux"), le titre principal est plus parlant.
  const useInner = inner && !/^(les?|la|l'|un|une|des|du)\s/i.test(inner) && !/^l'/i.test(inner);
  const chosen = useInner ? inner : main;
  return chosen.length > 30 ? `${chosen.slice(0, 28).trim()}…` : chosen;
}
