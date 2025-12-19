/**
 * Structure de données pour les 50 cours de grammaire et méthodologie
 * Organisés en 5 paliers de 10 cours chacun
 */

export type CourseType = "grammar" | "methodology";

export type Course = {
  id: number; // 1–50
  title: string; // Titre du cours (en anglais pour la grammaire)
  shortLabel?: string; // Label court optionnel
  type: CourseType;
};

export type Palier = {
  id: number; // 1–5
  title: string; // e.g. "Palier 1 – Bases de l'anglais"
  description: string; // Description courte en français
  courses: Course[];
};

/**
 * Données des 50 cours organisés en 5 paliers
 */
export const paliers: Palier[] = [
  {
    id: 1,
    title: "Palier 1 – Bases de l'anglais",
    description: "Les fondamentaux : être, avoir, présent simple, pronoms et articles.",
    courses: [
      { id: 1, title: "Be 1 – am / is / are", type: "grammar" },
      { id: 2, title: "Be 2 – questions & short answers", type: "grammar" },
      { id: 3, title: "Present simple – affirmative", type: "grammar" },
      { id: 4, title: "Present simple – negatives & questions", type: "grammar" },
      { id: 5, title: "Have got – talking about possessions", type: "grammar" },
      { id: 6, title: "Pronouns & possessives", type: "grammar" },
      { id: 7, title: "A / an & plurals", type: "grammar" },
      { id: 8, title: "There is / there are", type: "grammar" },
      { id: 9, title: "Can / can't – ability & permission", type: "grammar" },
      { id: 10, title: "Méthodo – Comment apprendre du vocabulaire efficacement", type: "methodology" },
    ],
  },
  {
    id: 2,
    title: "Palier 2 – Actions et descriptions",
    description: "Présent continu, adverbes, prépositions et questions.",
    courses: [
      { id: 11, title: "Present continuous – actions now", type: "grammar" },
      { id: 12, title: "Present simple vs present continuous", type: "grammar" },
      { id: 13, title: "Adverbs of frequency & word order", type: "grammar" },
      { id: 14, title: "Imperatives – giving instructions", type: "grammar" },
      { id: 15, title: "Some / any & countable / uncountable", type: "grammar" },
      { id: 16, title: "Much / many / a lot of / (a) few / (a) little", type: "grammar" },
      { id: 17, title: "Prepositions of time – at / on / in", type: "grammar" },
      { id: 18, title: "Prepositions of place – in / on / at", type: "grammar" },
      { id: 19, title: "Wh- questions in the present", type: "grammar" },
      { id: 20, title: "Méthodo – Parler de sa journée clairement", type: "methodology" },
    ],
  },
  {
    id: 3,
    title: "Palier 3 – Le passé et les comparaisons",
    description: "Passé simple, passé continu, comparatifs et superlatifs.",
    courses: [
      { id: 21, title: "Past simple – was / were", type: "grammar" },
      { id: 22, title: "Past simple – regular verbs", type: "grammar" },
      { id: 23, title: "Past simple – irregular verbs (set 1)", type: "grammar" },
      { id: 24, title: "Past simple – negatives & questions", type: "grammar" },
      { id: 25, title: "Past continuous – long vs short actions", type: "grammar" },
      { id: 26, title: "Comparatives", type: "grammar" },
      { id: 27, title: "Superlatives", type: "grammar" },
      { id: 28, title: "Adjectives vs adverbs", type: "grammar" },
      { id: 29, title: "There was / there were – describing the past", type: "grammar" },
      { id: 30, title: "Méthodo – Décrire une personne ou un lieu", type: "methodology" },
    ],
  },
  {
    id: 4,
    title: "Palier 4 – Futur et expériences",
    description: "Futur, present perfect, modaux et ordre des mots.",
    courses: [
      { id: 31, title: "Be going to – plans & intentions", type: "grammar" },
      { id: 32, title: "Will – decisions & predictions", type: "grammar" },
      { id: 33, title: "Present perfect – life experience", type: "grammar" },
      { id: 34, title: "Present perfect – for & since", type: "grammar" },
      { id: 35, title: "Present perfect vs past simple", type: "grammar" },
      { id: 36, title: "Used to – past habits", type: "grammar" },
      { id: 37, title: "Modals – must / have to / don't have to", type: "grammar" },
      { id: 38, title: "Modals – should / shouldn't / can / could", type: "grammar" },
      { id: 39, title: "Word order – making clear sentences", type: "grammar" },
      { id: 40, title: "Méthodo – Écrire un paragraphe clair", type: "methodology" },
    ],
  },
  {
    id: 5,
    title: "Palier 5 – Structures avancées",
    description: "Infinitifs, relatives, voix passive, conditionnels et argumentation.",
    courses: [
      { id: 41, title: "-ing vs to-infinitive 1 – like doing / want to do", type: "grammar" },
      { id: 42, title: "-ing vs to-infinitive 2 – verb + object + to / preposition + -ing", type: "grammar" },
      { id: 43, title: "Determiners – some / any / no / every / each / both / either / neither", type: "grammar" },
      { id: 44, title: "Relative clauses 1 – who / which / that", type: "grammar" },
      { id: 45, title: "Relative clauses 2 – object relative clauses", type: "grammar" },
      { id: 46, title: "Linking words 1 – because / so / but / although / if", type: "grammar" },
      { id: 47, title: "Passive voice 1 – present & past simple", type: "grammar" },
      { id: 48, title: "Passive voice 2 – other tenses & \"have something done\"", type: "grammar" },
      { id: 49, title: "Conditionals 0 & 1 – real situations", type: "grammar" },
      { id: 50, title: "Méthodo – Construire un argument solide", type: "methodology" },
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

