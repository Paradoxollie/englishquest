import { getGameBySlug } from "@/lib/games/config";
import { getCourseCompletionReward } from "@/lib/profile/economy";
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
    summary: "Mieux décrire ce qui se passé maintenant et ce qui revient souvent.",
    learningGoals: [
      "Distinguer action en cours et habitude",
      "Stabiliser les auxiliaires du présent",
      "Produire des phrases naturelles à l'oral",
    ],
    focusTags: ["Temps", "Present", "Auxiliaires"],
    recommendedGameSlugs: ["flash-translation", "speed-verb-challenge", "flashback"],
  },
  {
    test: /(question|negation|pronoms|possession|there is|it is|articles|some|any|much|many|little|few)/i,
    summary: "Rendre les phrases plus justes et plus fluides dans les détails du quotidien.",
    learningGoals: [
      "Poser des questions sans hésitation",
      "Corriger les structures qui reviennent dans les erreurs de base",
      "Mieux choisir les petits mots qui changent tout",
    ],
    focusTags: ["Précision", "Questions", "Déterminants"],
    recommendedGameSlugs: ["flash-translation", "wordfall", "flashback"],
  },
  {
    test: /(past|pass[eé]|used to|nostalgie)/i,
    summary: "Raconter le passé avec plus de clarté et de nuances.",
    learningGoals: [
      "Faire la différence entre action et contexte",
      "Raconter une habitude ou un souvenir",
      "Ancrer les formes verbales du passé",
    ],
    focusTags: ["Temps", "Passé", "Narration"],
    recommendedGameSlugs: ["flashback", "flash-translation", "speed-verb-challenge"],
  },
  {
    test: /(future|futur|will|going to|prediction|plan)/i,
    summary: "Parler d'intentions, de prédictions et de plans avec plus de contrôle.",
    learningGoals: [
      "Choisir entre intention, plan et prédiction",
      "Construire des réponses plus précises",
      "Renforcer la projection dans le temps",
    ],
    focusTags: ["Temps", "Futur", "Projection"],
    recommendedGameSlugs: ["flash-translation", "enigma-scroll", "wordfall"],
  },
  {
    test: /(can|could|must|have to|should|may|might|obligation|permission|conseil|capacite)/i,
    summary: "Mieux exprimer la possibilité, la contrainte, le conseil et la nuance.",
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
      "Mieux comparer deux idées ou deux objets",
      "Éviter les formulations floues",
      "S'exprimer avec davantage de précision",
    ],
    focusTags: ["Comparaison", "Précision", "Quantité"],
    recommendedGameSlugs: ["wordfall", "flash-translation", "space-lex"],
  },
  {
    test: /(present perfect|for vs since|how long)/i,
    summary: "Relier le passé au présent sans tomber dans les confusions classiques.",
    learningGoals: [
      "Faire la différence avec le past simple",
      "Parler d'expérience, de durée et de résultat",
      "Stabiliser les marqueurs temporels sensibles",
    ],
    focusTags: ["Temps", "Present Perfect", "Durée"],
    recommendedGameSlugs: ["flash-translation", "flashback", "speed-verb-challenge"],
  },
  {
    test: /(conditionnel|if|wish|regret|third conditional|first conditional|second conditional)/i,
    summary: "Explorer les hypothèses, les regrets et les scénarios imaginaires.",
    learningGoals: [
      "Construire des conditions claires",
      "Exprimer l'irréel sans casser la grammaire",
      "Mieux gérer les temps dans les hypothèses",
    ],
    focusTags: ["Conditionnels", "Hypothèses", "Nuance"],
    recommendedGameSlugs: ["flash-translation", "space-lex", "enigma-scroll"],
  },
  {
    test: /(passive|voix passive|discours indirect|reported|relatives|who|which|that)/i,
    summary: "Passer à des phrases plus denses et plus académiques.",
    learningGoals: [
      "Transformer la structure sans perdre le sens",
      "Rapporter une parole ou une information",
      "Relier les idées dans une seule phrase",
    ],
    focusTags: ["Structure", "Syntaxe", "B2"],
    recommendedGameSlugs: ["flash-translation", "space-lex", "wordfall"],
  },
  {
    test: /(gerondif|infinitif|preposition|phrasal verbs|connecteurs|although|despite)/i,
    summary: "Gagner en naturel sur les structures qui distinguent un bon niveau d'un niveau scolaire.",
    learningGoals: [
      "Choisir la bonne construction après un verbe ou une préposition",
      "Relier les idées avec plus de souplesse",
      "Mémoriser les tournures qui posent problème à l'oral",
    ],
    focusTags: ["Fluidité", "Idiomaticité", "Avancé"],
    recommendedGameSlugs: ["wordfall", "enigma-scroll", "flashback"],
  },
];

const courseSummaries: Record<number, string> = {
  1: "Am, is, are, have got, has got : les deux verbes qu'on utilise dans presque chaque phrase, et le piège de l'âge et de la faim.",
  2: "Be + verbe en -ing pour dire ce qui se passé en ce moment : I'm reading, she's sleeping.",
  3: "Le present simple pour les habitudes et les vérités, avec le fameux -s de la troisième personne.",
  4: "Choisir entre I do et I am doing : ce qui est habituel contre ce qui est en train de se passer.",
  5: "Poser une question avec do, does, am, is, are, et dans le bon ordre.",
  6: "Dire non sans se tromper : don't, doesn't, isn't, aren't, et où placer not.",
  7: "I, me, my, mine : les pronoms sujets, compléments et possessifs, plus le 's de possession.",
  8: "There is, there are pour dire qu'une chose existe, et ne pas les confondre avec it is.",
  9: "Some dans les phrases affirmatives, any dans les questions et les négations, et les exceptions utiles.",
  10: "A, an, the, ou rien du tout : l'article qu'il faut devant un nom.",
  11: "Le prétérit pour raconter une action finie et datée : -ed pour les réguliers, did pour les questions.",
  12: "Was doing, were doing : décrire ce qui se passait quand autre chose est arrivé.",
  13: "Used to pour une habitude ou un état du passé qui n'existe plus.",
  14: "Going to pour un projet décidé ou une prédiction qu'on voit venir.",
  15: "Can, could, be able to : savoir faire, pouvoir faire, demander la permission.",
  16: "Must et have to : l'obligation qui vient de soi et celle qui vient de l'extérieur.",
  17: "Should et ought to pour donner un conseil sans donner un ordre.",
  18: "Plus grand, aussi grand, le plus grand : comparatifs et superlatifs, courts et longs.",
  19: "Much, many, little, few, a lot of : quelle quantité devant quel nom.",
  20: "If, when, because, but, so : relier deux idées dans une phrase qui tient.",
  21: "Le present perfect quand une action passée a un résultat maintenant : I've lost my keys.",
  22: "Ever, never, already, yet : parler de ce qu'on a vécu sans dire quand.",
  23: "For pour une durée, since pour un point de départ : how long have you lived here?",
  24: "Have been doing : insister sur l'activité, pas sur le résultat.",
  25: "How long have you… ? faire le bilan d'une durée qui continue.",
  26: "Present perfect ou past simple : la différence qui compte le plus en anglais.",
  27: "Will pour une décision prise sur le moment, une promesse, une offre.",
  28: "Will ou going to : prédire avec ou sans preuve, annoncer un plan.",
  29: "May, might, maybe : dire qu'une chose est possible sans en être sûr.",
  30: "Too et enough : trop grand, assez grand, et où les placer dans la phrase.",
  31: "If + présent, will : une condition réelle et sa conséquence probable.",
  32: "If + prétérit, would : imaginer une situation qui n'est pas vraie aujourd'hui.",
  33: "La voix passive au présent et au passé : is done, was done, quand l'action compte plus que l'auteur.",
  34: "La voix passive aux formes continues et parfaites : is being done, has been done.",
  35: "Rapporter ce que quelqu'un a dit : he said that…, et le recul des temps.",
  36: "Rapporter une question : she asked if…, sans inversion ni point d'interrogation.",
  37: "Who, which, that : relier deux phrases autour d'une personne ou d'une chose.",
  38: "Quand on peut supprimer that dans une relative, et quand on ne peut pas.",
  39: "Les verbes suivis de -ing : enjoy doing, stop doing, et les plus fréquents à retenir.",
  40: "Les verbes suivis de to : want to do, decide to do, et ceux qui changent de sens.",
  41: "If + past perfect, would have : le regret et la situation qui aurait pu être différente.",
  42: "I wish et if only : souhaiter autre chose au présent, regretter le passé.",
  43: "Will be doing, will have done : ce qui sera en cours ou terminé à un moment du futur.",
  44: "Had done : le passé du passé, pour ordonner deux événements révolus.",
  45: "Must have, can't have, might have : déduire ce qui s'est passé.",
  46: "Have something done : faire faire quelque chose par quelqu'un d'autre.",
  47: "Although, despite, whereas, however : nuancer et opposer avec les bons connecteurs.",
  48: "Interested in doing, good at doing : la préposition appelle le -ing.",
  49: "Les phrasal verbs : comment ils se construisent et pourquoi il faut les apprendre tels quels.",
  50: "Les phrasal verbs les plus utiles au quotidien : get up, look after, give up, et les autres.",
};

function getRuleForCourseTitle(title: string): MetadataRule | undefined {
  return metadataRules.find((rule) => rule.test.test(title));
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function getCourseRewardProfile(courseId: number) {
  const palier = getPalierForCourse(courseId);
  return getCourseCompletionReward(palier?.id ?? 1);
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
      summary: "Renforcer un point clé du parcours.",
      learningGoals: [
        "Clarifier le point de langue",
        "Prendre un repère utile pour la suite",
      ],
      focusTags: ["Parcours"],
      recommendedGameSlugs: ["flash-translation", "wordfall"],
    };
  }

  const matchedRule = getRuleForCourseTitle(course.title);
  const defaultGoals = [
    "Comprendre la logique du point de cours",
    "Le réutiliser dans des phrases simples",
    "Vérifier rapidement la compréhension",
  ];

  const defaultGameRotation =
    palier.id <= 2
      ? ["flash-translation", "wordfall", "flashback"]
      : palier.id <= 4
        ? ["flash-translation", "space-lex", "enigma-scroll"]
        : ["wordfall", "enigma-scroll", "flashback"];

  const summary =
    courseSummaries[courseId] ??
    matchedRule?.summary ??
    (palier.id <= 2
      ? "Construire une base fiable avant d'accélérer."
      : palier.id <= 4
        ? "Ajouter de la nuance et de la structure à l'expression."
        : "Approcher les usages avancés avec plus de naturel.");

  const focusTags = unique([
    palier.level.split(" - ")[0],
    course.type === "grammar" ? "Grammaire" : "Méthodologie",
    ...(matchedRule?.focusTags ?? []),
  ]).slice(0, 4);

  const recommendedGameSlugs = unique([
    ...(matchedRule?.recommendedGameSlugs ?? defaultGameRotation),
    "grammar-rush",
    "flash-translation",
  ]).filter((slug) => Boolean(getGameBySlug(slug))).slice(0, 4);

  return {
    courseId,
    palierId: palier.id,
    levelLabel: palier.level,
    type: course.type,
    typeLabel: course.type === "grammar" ? "Grammaire" : "Méthodologie",
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
