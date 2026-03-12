import { getGameBySlug } from "@/lib/games/config";
import { getCourseById, getPalierForCourse, paliers, type CourseType } from "./data";

export type CourseMetadata = {
  courseId: number;
  palierId: number;
  levelLabel: string;
  type: CourseType;
  typeLabel: string;
  estimatedMinutes: number;
  summary: string;
  learningGoals: string[];
  focusTags: string[];
  recommendedGameSlugs: string[];
};

type MetadataRule = {
  test: RegExp;
  summary: string;
  learningGoals: string[];
  focusTags: string[];
  recommendedGameSlugs: string[];
};

const metadataRules: MetadataRule[] = [
  {
    test: /(etre et avoir|be and have|have something done)/i,
    summary: "Installer les verbes pivots et les structures qui servent partout.",
    learningGoals: [
      "Construire des phrases simples et stables",
      "Choisir rapidement la bonne forme verbale",
      "Reconstruire des automatismes de base",
    ],
    focusTags: ["Fondations", "Verbes", "Structures"],
    recommendedGameSlugs: ["speed-verb-challenge", "flash-translation", "wordfall"],
  },
  {
    test: /(present|pr[ée]sent|routine|action en direct|do vs i am doing)/i,
    summary: "Mieux decrire ce qui se passe maintenant et ce qui revient souvent.",
    learningGoals: [
      "Distinguer action en cours et habitude",
      "Stabiliser les auxiliaires du present",
      "Produire des phrases naturelles a l'oral",
    ],
    focusTags: ["Temps", "Present", "Auxiliaires"],
    recommendedGameSlugs: ["flash-translation", "speed-verb-challenge", "flashback"],
  },
  {
    test: /(question|negation|pronoms|possession|there is|it is|articles|some|any|much|many|little|few)/i,
    summary: "Rendre les phrases plus justes et plus fluides dans les details du quotidien.",
    learningGoals: [
      "Poser des questions sans hesitation",
      "Corriger les structures qui reviennent dans les erreurs de base",
      "Mieux choisir les petits mots qui changent tout",
    ],
    focusTags: ["Precision", "Questions", "Determinants"],
    recommendedGameSlugs: ["flash-translation", "wordfall", "flashback"],
  },
  {
    test: /(past|pass[eé]|used to|nostalgie)/i,
    summary: "Raconter le passe avec plus de clarte et de nuances.",
    learningGoals: [
      "Faire la difference entre action et contexte",
      "Raconter une habitude ou un souvenir",
      "Ancrer les formes verbales du passe",
    ],
    focusTags: ["Temps", "Passe", "Narration"],
    recommendedGameSlugs: ["flashback", "flash-translation", "speed-verb-challenge"],
  },
  {
    test: /(future|futur|will|going to|prediction|plan)/i,
    summary: "Parler d'intentions, de predictions et de plans avec plus de controle.",
    learningGoals: [
      "Choisir entre intention, plan et prediction",
      "Construire des reponses plus precises",
      "Renforcer la projection dans le temps",
    ],
    focusTags: ["Temps", "Futur", "Projection"],
    recommendedGameSlugs: ["flash-translation", "enigma-scroll", "wordfall"],
  },
  {
    test: /(can|could|must|have to|should|may|might|obligation|permission|conseil|capacite)/i,
    summary: "Mieux exprimer la possibilite, la contrainte, le conseil et la nuance.",
    learningGoals: [
      "Employer le bon modal selon l'intention",
      "Nuancer un avis ou une obligation",
      "Mieux comprendre les sous-entendus du locuteur",
    ],
    focusTags: ["Modaux", "Nuance", "Decision"],
    recommendedGameSlugs: ["flash-translation", "speed-verb-challenge", "flashback"],
  },
  {
    test: /(comparaisons|better|best|too|enough|quantite)/i,
    summary: "Comparer, nuancer et mesurer avec des formulations plus solides.",
    learningGoals: [
      "Mieux comparer deux idees ou deux objets",
      "Eviter les formulations floues",
      "S'exprimer avec davantage de precision",
    ],
    focusTags: ["Comparaison", "Precision", "Quantite"],
    recommendedGameSlugs: ["wordfall", "flash-translation", "space-lex"],
  },
  {
    test: /(present perfect|for vs since|how long)/i,
    summary: "Relier le passe au present sans tomber dans les confusions classiques.",
    learningGoals: [
      "Faire la difference avec le past simple",
      "Parler d'experience, de duree et de resultat",
      "Stabiliser les marqueurs temporels sensibles",
    ],
    focusTags: ["Temps", "Present Perfect", "Duree"],
    recommendedGameSlugs: ["flash-translation", "flashback", "speed-verb-challenge"],
  },
  {
    test: /(conditionnel|if|wish|regret|third conditional|first conditional|second conditional)/i,
    summary: "Explorer les hypotheses, les regrets et les scenarios imaginaires.",
    learningGoals: [
      "Construire des conditions claires",
      "Exprimer l'irreel sans casser la grammaire",
      "Mieux gerer les temps dans les hypotheses",
    ],
    focusTags: ["Conditionnels", "Hypotheses", "Nuance"],
    recommendedGameSlugs: ["flash-translation", "space-lex", "enigma-scroll"],
  },
  {
    test: /(passive|voix passive|discours indirect|reported|relatives|who|which|that)/i,
    summary: "Passer a des phrases plus denses et plus academiques.",
    learningGoals: [
      "Transformer la structure sans perdre le sens",
      "Rapporter une parole ou une information",
      "Relier les idees dans une seule phrase",
    ],
    focusTags: ["Structure", "Syntaxe", "B2"],
    recommendedGameSlugs: ["flash-translation", "space-lex", "wordfall"],
  },
  {
    test: /(gerondif|infinitif|preposition|phrasal verbs|connecteurs|although|despite)/i,
    summary: "Gagner en naturel sur les structures qui distinguent un bon niveau d'un niveau scolaire.",
    learningGoals: [
      "Choisir la bonne construction apres un verbe ou une preposition",
      "Relier les idees avec plus de souplesse",
      "Memoriser les tournures qui posent probleme a l'oral",
    ],
    focusTags: ["Fluidite", "Idiomaticite", "Avance"],
    recommendedGameSlugs: ["wordfall", "enigma-scroll", "flashback"],
  },
];

function getRuleForCourseTitle(title: string): MetadataRule | undefined {
  return metadataRules.find((rule) => rule.test.test(title));
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function getCourseRewardProfile(courseId: number) {
  const palier = getPalierForCourse(courseId);
  const palierId = palier?.id ?? 1;
  const withinPalierIndex = ((courseId - 1) % 10);

  return {
    xp: 75 + (palierId - 1) * 20 + withinPalierIndex * 6,
    gold: 7 + palierId * 2 + Math.floor(withinPalierIndex / 3),
  };
}

export function getCourseMetadata(courseId: number): CourseMetadata {
  const course = getCourseById(courseId);
  const palier = getPalierForCourse(courseId);

  if (!course || !palier) {
    return {
      courseId,
      palierId: 1,
      levelLabel: paliers[0]?.level ?? "A1",
      type: "grammar",
      typeLabel: "Grammaire",
      estimatedMinutes: 12,
      summary: "Renforcer un point cle du parcours.",
      learningGoals: [
        "Clarifier le point de langue",
        "Prendre un repere utile pour la suite",
      ],
      focusTags: ["Parcours"],
      recommendedGameSlugs: ["flash-translation", "wordfall"],
    };
  }

  const matchedRule = getRuleForCourseTitle(course.title);
  const defaultGoals = [
    "Comprendre la logique du point de cours",
    "Le reutiliser dans des phrases simples",
    "Verifier rapidement la comprehension",
  ];

  const defaultGameRotation =
    palier.id <= 2
      ? ["flash-translation", "wordfall", "flashback"]
      : palier.id <= 4
        ? ["flash-translation", "space-lex", "enigma-scroll"]
        : ["wordfall", "enigma-scroll", "flashback"];

  const summary =
    matchedRule?.summary ??
    (palier.id <= 2
      ? "Construire une base fiable avant d'accelerer."
      : palier.id <= 4
        ? "Ajouter de la nuance et de la structure a l'expression."
        : "Approcher les usages avances avec plus de naturel.");

  const focusTags = unique([
    palier.level.split(" - ")[0],
    course.type === "grammar" ? "Grammaire" : "Methodologie",
    ...(matchedRule?.focusTags ?? []),
  ]).slice(0, 4);

  const recommendedGameSlugs = unique([
    ...(matchedRule?.recommendedGameSlugs ?? defaultGameRotation),
    "flash-translation",
  ]).filter((slug) => Boolean(getGameBySlug(slug))).slice(0, 3);

  return {
    courseId,
    palierId: palier.id,
    levelLabel: palier.level,
    type: course.type,
    typeLabel: course.type === "grammar" ? "Grammaire" : "Methodologie",
    estimatedMinutes: 12 + (palier.id - 1) * 3 + (courseId % 2 === 0 ? 2 : 0),
    summary,
    learningGoals: matchedRule?.learningGoals ?? defaultGoals,
    focusTags,
    recommendedGameSlugs,
  };
}

export function getRecommendedGamesForCourse(courseId: number) {
  return getCourseMetadata(courseId).recommendedGameSlugs
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));
}
