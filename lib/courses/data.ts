/**
 * Structure de données pour les 50 cours de grammaire et méthodologie
 * Organisés en 5 paliers de 10 cours chacun
 */

export type CourseType = "grammar" | "methodology";

export type Course = {
  id: number; // 1–50
  title: string;
  type: CourseType;
};

export type Palier = {
  id: number; // 1–5
  title: string;
  description: string;
  level: string; // A1, A2, B1, B2, C1
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
      { id: 1, title: "Être et Avoir (La base absolue)", type: "grammar" },
      { id: 2, title: "L'Action en direct (Present Continuous)", type: "grammar" },
      { id: 3, title: "La Routine et les Faits (Present Simple)", type: "grammar" },
      { id: 4, title: "Le Duel du Présent (I do vs I am doing)", type: "grammar" },
      { id: 5, title: "Poser des questions (Do/Does/Am/Is/Are)", type: "grammar" },
      { id: 6, title: "La Négation : Dire non correctement", type: "grammar" },
      { id: 7, title: "Les Pronoms et la possession", type: "grammar" },
      { id: 8, title: "Il y a / C'est (There is vs It is)", type: "grammar" },
      { id: 9, title: "Quantité simple (Some et Any)", type: "grammar" },
      { id: 10, title: "Les Articles (A/An et The)", type: "grammar" },
    ],
  },
  {
    id: 2,
    title: "Niveau 2 : Raconter son histoire",
    description: "Parler du passé et commencer à envisager l'avenir.",
    level: "A2 - Élémentaire",
    courses: [
      { id: 11, title: "Le Passé Simple (Past Simple)", type: "grammar" },
      { id: 12, title: "Le Décor du Passé (Past Continuous)", type: "grammar" },
      { id: 13, title: "Nostalgie et Habitudes passées (Used to)", type: "grammar" },
      { id: 14, title: "Le Futur proche (Plans & Going to)", type: "grammar" },
      { id: 15, title: "Capacité et Permission (Can, Could, Be able to)", type: "grammar" },
      { id: 16, title: "Obligation et Nécessité (Must vs Have to)", type: "grammar" },
      { id: 17, title: "Le Conseil (Should)", type: "grammar" },
      { id: 18, title: "Comparaisons (Plus grand, le meilleur)", type: "grammar" },
      { id: 19, title: "Quantité précise (Much, Many, Little, Few)", type: "grammar" },
      { id: 20, title: "Lier ses idées (If et When - Intro)", type: "grammar" },
    ],
  },
  {
    id: 3,
    title: "Niveau 3 : La Connexion Passé-Présent",
    description: "Maîtriser le Present Perfect et nuancer son discours.",
    level: "B1 - Intermédiaire",
    courses: [
      { id: 21, title: "Le Concept du Present Perfect (1) : Résultat présent", type: "grammar" },
      { id: 22, title: "Le Concept du Present Perfect (2) : Expérience de vie", type: "grammar" },
      { id: 23, title: "La Durée (For vs Since)", type: "grammar" },
      { id: 24, title: "L'insistance sur l'action (Present Perfect Continuous)", type: "grammar" },
      { id: 25, title: "Le Bilan (How long have you...?)", type: "grammar" },
      { id: 26, title: "Le Grand Duel : Present Perfect vs Past Simple", type: "grammar" },
      { id: 27, title: "Le Futur Spontané (Will)", type: "grammar" },
      { id: 28, title: "Futur : Prédiction vs Plan (Will vs Going to)", type: "grammar" },
      { id: 29, title: "Probabilité et Incertitude (May et Might)", type: "grammar" },
      { id: 30, title: "Trop ou Pas assez (Too et Enough)", type: "grammar" },
    ],
  },
  {
    id: 4,
    title: "Niveau 4 : Structure et Style",
    description: "Faire des phrases complexes, conditionnelles et passives.",
    level: "B2 - Intermédiaire Supérieur",
    courses: [
      { id: 31, title: "Conditionnel Réel (First Conditional)", type: "grammar" },
      { id: 32, title: "Conditionnel Imaginaire (Second Conditional)", type: "grammar" },
      { id: 33, title: "La Voix Passive (1) : Is done / Was done", type: "grammar" },
      { id: 34, title: "La Voix Passive (2) : Formes continues et parfaites", type: "grammar" },
      { id: 35, title: "Discours Indirect (1) : He said that...", type: "grammar" },
      { id: 36, title: "Discours Indirect (2) : Les questions rapportées", type: "grammar" },
      { id: 37, title: "Les Propositions Relatives (1) : Who, That, Which", type: "grammar" },
      { id: 38, title: "Les Propositions Relatives (2) : Omission de 'that'", type: "grammar" },
      { id: 39, title: "Gérondif ou Infinitif (1) : Verbes + -ING", type: "grammar" },
      { id: 40, title: "Gérondif ou Infinitif (2) : Verbes + TO", type: "grammar" },
    ],
  },
  {
    id: 5,
    title: "Niveau 5 : Maîtrise et Subtilités",
    description: "Exprimer des regrets, utiliser des structures idiomatiques et complexes.",
    level: "C1 - Avancé",
    courses: [
      { id: 41, title: "Le Regret (Third Conditional)", type: "grammar" },
      { id: 42, title: "Les Souhaits et Regrets (I wish...)", type: "grammar" },
      { id: 43, title: "Le Futur Antérieur et Continu (Will be doing / have done)", type: "grammar" },
      { id: 44, title: "Le Passé du Passé (Past Perfect)", type: "grammar" },
      { id: 45, title: "Nuances de déduction passée (Must have / Can't have)", type: "grammar" },
      { id: 46, title: "Faire faire quelque chose (Have something done)", type: "grammar" },
      { id: 47, title: "Connecteurs logiques avancés (Although, Despite...)", type: "grammar" },
      { id: 48, title: "Prépositions et Gérondif (Preposition + -ing)", type: "grammar" },
      { id: 49, title: "Phrasal Verbs (Introduction)", type: "grammar" },
      { id: 50, title: "Phrasal Verbs (Les essentiels)", type: "grammar" },
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
