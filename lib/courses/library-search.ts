import type { CourseRoadmapEntry } from "./progress";
import { getGameBySlug } from "@/lib/games/config";

const courseSearchPhrases: Record<number, string> = {
  1: "se présenter présentation parler de soi dire son âge introduce yourself introducing myself be have",
  2: "présent progressif présent continu present progressive action en train de",
  3: "présent simple simple present habitudes quotidiennes daily routine",
  4: "présent simple présent continu present progressive",
  5: "poser former une question en anglais mots interrogatifs question words",
  8: "dire ce qu'il y a décrire un lieu",
  11: "verbes irréguliers irregular verbs simple past preterite raconter hier",
  12: "prétérit continu prétérit progressif past progressive",
  13: "habitudes passées autrefois",
  18: "comparatif superlatif comparer comparative superlative",
  21: "participe passé past participle",
  22: "parler de ses expériences have you ever",
  23: "depuis durée point de départ depuis quand for and since",
  25: "depuis combien de temps",
  26: "prétérit ou present perfect",
  31: "premier conditionnel condition réelle",
  32: "deuxième conditionnel hypothèse imaginaire",
  35: "reported speech",
  36: "reported questions indirect questions",
  41: "troisième conditionnel hypothèse passée",
  44: "plus que parfait pluperfect",
  49: "verbes à particule",
  50: "verbes à particule",
};

// These expressions point to material actually present in the corresponding game.
const arcadeTopics = [
  { slug: "speed-verb-challenge", terms: ["verbes irréguliers", "irréguliers", "irregular verbs", "conjugaison", "prétérit", "preterite", "past simple", "simple past", "participe passé", "past participle"] },
  { slug: "echo-signal", terms: ["écoute", "écouter", "compréhension orale", "listening", "demander son chemin", "asking for directions", "annonce en gare"] },
  { slug: "spell-strike", terms: ["dictée", "épeler", "spelling", "orthographe", "écrire un mot entendu"] },
  { slug: "flash-translation", terms: ["traduction", "traduire", "translation"] },
];

const fillerWords = new Set([
  "a au aux un une des du le la les l d de en et ou and vs entre pour",
  "se s me m mon ma mes son sa ses je j veux voudrais souhaite aimerais",
  "savoir apprendre reviser revise comprendre comprends choisir choisis liste comment",
  "anglais anglaise english exercice exercices",
].join(" ").split(" "));

function words(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/œ/g, "oe").replace(/æ/g, "ae").match(/[a-z0-9]+/g) ?? [];
}

export function courseSearchTerms(search: string) {
  const all = words(search.replace(/\b(?:\d+|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|vingt|quelques)\s+(?=verbes?\b)/gi, ""));
  const meaningful = all.filter((word) => !fillerWords.has(word));
  return meaningful.length ? meaningful : all;
}

// Whole short words keep "for", "to" and "be" from matching longer, unrelated terms.
function hasTerm(haystack: string[], term: string) {
  return haystack.some((word) => word === term || (
    term.length >= 3 && (word === term + "s" || word + "s" === term)
  ));
}

export function matchesCourseSearch(entry: CourseRoadmapEntry, objective: string | undefined, terms: string[]) {
  if (!terms.length) return true;
  const searchable = words([
    entry.title, entry.summary, objective, ...entry.focusTags, ...entry.learningGoals,
    courseSearchPhrases[entry.courseId],
  ].join(" "));
  if (terms.every((term) => hasTerm(searchable, term))) return true;
  // Keep finding a phrase while its last, longer word is still being typed.
  return terms[terms.length - 1].length >= 4 &&
    (" " + searchable.join(" ")).includes(" " + terms.join(" "));
}

export function findArcadeSearchMatches(terms: string[]) {
  if (!terms.length) return [];
  return arcadeTopics.flatMap(({ slug, terms: phrases }) => {
    const game = getGameBySlug(slug);
    if (!game) return [];
    const topics = [...phrases, game.name].map(courseSearchTerms);
    const vocabulary = topics.flat();
    const matches = terms.every((term) => hasTerm(vocabulary, term)) &&
      topics.some((topic) => topic.every((term) => hasTerm(terms, term)));
    return matches ? [game] : [];
  });
}
