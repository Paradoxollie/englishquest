/**
 * Structure de données pour les 50 cours de grammaire et méthodologie
 * Organisés en 5 paliers de 10 cours chacun
 */

export type CourseType = "grammar" | "methodology";

export type Course = {
  id: number; // 1–50
  title: string;
  /** Intitulé de la leçon pour la lecture et la recherche. Le catalogue de progression garde son titre de mission. */
  publicTitle?: string;
  type: CourseType;
};

export type Palier = {
  id: number; // 1–5
  title: string;
  description: string;
  level: string; // A1, A2, A2+, B1, B1+ (niveaux visés, d'après l'English Grammar Profile)
  courses: Course[];
};

/**
 * Données des 50 cours organisés en 5 paliers
 */
export const paliers: Palier[] = [
  {
    id: 1,
    title: "Niveau 1 : Les Fondations",
    description: "Comprendre la structure de base, parler de soi, de ses habitudes et de ce qui se passe maintenant.",
    level: "A1 - Débutant",
    courses: [
      { id: 1, title: "Être et Avoir (Les Fondamentaux)", publicTitle: "Être et avoir en anglais (be et have)", type: "grammar" },
      { id: 2, title: "L'Action en direct (Present Continuous)", publicTitle: "Le présent continu en anglais (be + -ing)", type: "grammar" },
      { id: 3, title: "La Routine et les Faits (Present Simple)", publicTitle: "Le présent simple en anglais", type: "grammar" },
      { id: 4, title: "Le Duel du Présent (I do vs I am doing)", publicTitle: "Présent simple ou présent continu ?", type: "grammar" },
      { id: 5, title: "L'Art de la Question (Inversion & Do/Does)", publicTitle: "Comment poser une question en anglais ?", type: "grammar" },
      { id: 6, title: "La Négation (Don't / Doesn't / Not)", publicTitle: "Former une phrase négative en anglais", type: "grammar" },
      { id: 7, title: "Les Pronoms et la Possession", publicTitle: "Pronoms et possessifs en anglais (I, me, my, mine)", type: "grammar" },
      { id: 8, title: "L'Existence (There is / There are)", publicTitle: "There is ou there are ? Dire « il y a » en anglais", type: "grammar" },
      { id: 9, title: "Quantité (Some / Any)", publicTitle: "Some ou any en anglais ?", type: "grammar" },
      { id: 10, title: "Les Articles (A / An / The / Ø)", publicTitle: "Les articles en anglais (a, an, the)", type: "grammar" },
    ],
  },
  {
    id: 2,
    title: "Niveau 2 : Raconter son histoire",
    description: "Parler du passé et commencer à envisager l'avenir.",
    level: "A2 - Élémentaire",
    courses: [
      { id: 11, title: "Le Past Simple (Prétérit)", publicTitle: "Le prétérit en anglais (past simple)", type: "grammar" },
      { id: 12, title: "Une action en cours dans le passé (Past Continuous)", publicTitle: "Le prétérit en be + -ing (past continuous)", type: "grammar" },
      { id: 13, title: "Used to / Didn't use to", publicTitle: "Used to pour parler d’une ancienne habitude", type: "grammar" },
      { id: 14, title: "Intentions et prévisions (Be going to)", publicTitle: "Be going to pour parler de ses projets", type: "grammar" },
      { id: 15, title: "La Capacité (Can / Could / Be able to)", publicTitle: "Can, could et be able to pour dire ce qu’on sait faire", type: "grammar" },
      { id: 16, title: "L'Obligation (Must / Have to)", publicTitle: "Must ou have to pour exprimer l’obligation", type: "grammar" },
      { id: 17, title: "Conseil (Should / Ought to)", publicTitle: "Donner un conseil en anglais avec should et ought to", type: "grammar" },
      { id: 18, title: "Comparaisons & Superlatifs", publicTitle: "Le comparatif et le superlatif en anglais", type: "grammar" },
      { id: 19, title: "Quantité précise (Much / Many)", publicTitle: "Much ou many en anglais ?", type: "grammar" },
      { id: 20, title: "Lier ses idées (Logical Connectors)", publicTitle: "Relier ses idées en anglais avec because, so et but", type: "grammar" },
    ],
  },
  {
    id: 3,
    title: "Niveau 3 : La Connexion Passé-Présent",
    description: "Maîtriser le Present Perfect et nuancer son discours.",
    level: "A2+ - Pré-intermédiaire",
    courses: [
      { id: 21, title: "Present Perfect (1) : Résultat Présent", publicTitle: "Former le present perfect et expliquer un résultat", type: "grammar" },
      { id: 22, title: "Present Perfect (2) : Expérience de vie", publicTitle: "Ever, never, already et yet avec le present perfect", type: "grammar" },
      { id: 23, title: "La Durée : FOR vs SINCE", publicTitle: "For ou since en anglais ?", type: "grammar" },
      { id: 24, title: "Present Perfect Continuous : L'Action", publicTitle: "Le present perfect continu (have been doing)", type: "grammar" },
      { id: 25, title: "Le Bilan : HOW LONG...", publicTitle: "Poser une question avec how long", type: "grammar" },
      { id: 26, title: "Comparaison : Past Simple vs Present Perfect", publicTitle: "Prétérit ou present perfect ?", type: "grammar" },
      { id: 27, title: "Le Futur : Décision vs Plan", publicTitle: "Will pour proposer son aide ou faire une promesse", type: "grammar" },
      { id: 28, title: "Expertise : Futur & Prédictions", publicTitle: "Will ou going to pour faire une prédiction ?", type: "grammar" },
      { id: 29, title: "Incertitude : May, Might & Maybe", publicTitle: "May, might ou maybe pour dire « peut-être »", type: "grammar" },
      { id: 30, title: "Mesure : Too & Enough", publicTitle: "Too ou enough en anglais ?", type: "grammar" },
    ],
  },
  {
    id: 4,
    title: "Niveau 4 : Structure et Style",
    description: "Faire des phrases complexes, conditionnelles et passives.",
    level: "B1 - Intermédiaire",
    courses: [
      { id: 31, title: "Le Futur Réel (First Conditional)", publicTitle: "Le premier conditionnel en anglais (if et will)", type: "grammar" },
      { id: 32, title: "L'Imaginaire (Second Conditional)", publicTitle: "Le deuxième conditionnel en anglais (if et would)", type: "grammar" },
      { id: 33, title: "La Voix Passive (1) : Is done / Was done", publicTitle: "La voix passive en anglais au présent et au passé", type: "grammar" },
      { id: 34, title: "La Voix Passive (2) : Formes continues et parfaites", publicTitle: "Le passif avec is being done et has been done", type: "grammar" },
      { id: 35, title: "Discours Indirect (1) : He said that...", publicTitle: "Le discours indirect en anglais", type: "grammar" },
      { id: 36, title: "Discours Indirect (2) : Les Questions Rapportées", publicTitle: "Rapporter une question au discours indirect", type: "grammar" },
      { id: 37, title: "Les Propositions Relatives (1) : Who / Which", publicTitle: "Who, which ou that dans une proposition relative", type: "grammar" },
      { id: 38, title: "Les Propositions Relatives (2) : L'Omission", publicTitle: "Quand peut-on omettre le pronom relatif en anglais ?", type: "grammar" },
      { id: 39, title: "Gérondif ou Infinitif (1) : Verbes + -ING", publicTitle: "Les verbes suivis de -ing en anglais", type: "grammar" },
      { id: 40, title: "Gérondif ou Infinitif (2) : Verbes + TO", publicTitle: "Les verbes suivis de l’infinitif avec to", type: "grammar" },
    ],
  },
  {
    id: 5,
    title: "Niveau 5 : Maîtrise et Subtilités",
    description: "Exprimer des regrets, utiliser des structures idiomatiques et complexes.",
    level: "B1+ - Confirmé",
    courses: [
      { id: 41, title: "Le Regret (Third Conditional)", publicTitle: "Le troisième conditionnel en anglais", type: "grammar" },
      { id: 42, title: "Les Souhaits et Regrets (I wish...)", publicTitle: "Exprimer un souhait ou un regret avec I wish et if only", type: "grammar" },
      { id: 43, title: "Le Futur Antérieur et Continu (Will be doing / have done)", publicTitle: "Le futur continu et le futur antérieur en anglais", type: "grammar" },
      { id: 44, title: "Le Passé du Passé (Past Perfect)", publicTitle: "Le past perfect (had + participe passé)", type: "grammar" },
      { id: 45, title: "Nuances de déduction passée (Must have / Can't have)", publicTitle: "Must have, might have et can’t have au passé", type: "grammar" },
      { id: 46, title: "Faire faire quelque chose (Have something done)", publicTitle: "Faire faire quelque chose avec have something done", type: "grammar" },
      { id: 47, title: "Connecteurs logiques avancés (Although, Despite...)", publicTitle: "Les connecteurs de contraste en anglais", type: "grammar" },
      { id: 48, title: "Prépositions et Gérondif (Préposition + -ing)", publicTitle: "Le verbe en -ing après une préposition", type: "grammar" },
      { id: 49, title: "Phrasal Verbs (Introduction)", publicTitle: "Comment fonctionnent les phrasal verbs ?", type: "grammar" },
      { id: 50, title: "Phrasal Verbs (Les essentiels)", publicTitle: "Les phrasal verbs de la vie quotidienne", type: "grammar" },
    ],
  },
];

/**
 * Fonction utilitaire pour obtenir un cours par son ID
 */
export function getCourseById(id: number): Course | undefined {
  for (const palier of paliers) {
    const course = palier.courses.find((c) => c.id === id);
    if (course) return course;
  }
  return undefined;
}

/**
 * Fonction utilitaire pour obtenir le palier d'un cours
 */
export function getPalierForCourse(courseId: number): Palier | undefined {
  return paliers.find((palier) => palier.courses.some((c) => c.id === courseId));
}
