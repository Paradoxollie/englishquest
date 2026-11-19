/** Common equivalents for the senses used in the two translation games. */
const variants: Record<string, string[]> = {
  behaviour: ["behavior"], bookshop: ["bookstore"], film: ["movie"],
  fridge: ["refrigerator"], grey: ["gray"], holiday: ["vacation", "holidays"],
  holidays: ["vacation", "holiday"], neighbour: ["neighbor"],
  "on holiday": ["on vacation"], organise: ["organize"], practise: ["practice"],
  realise: ["realize"], rubber: ["eraser"], shop: ["store"], trousers: ["pants"],
};

// Match the sense actually displayed. For example, "present" works for
// « cadeau », while "current" can describe the adjective « présent ».
const equivalentsByPrompt: Record<string, string[]> = {
  "à vélo": ["by bike", "by bicycle", "on a bike", "on a bicycle"],
  abandonner: ["give up", "abandon"],
  acheter: ["buy", "purchase"],
  aider: ["help", "assist"],
  allumer: ["turn on", "switch on"],
  "au revoir": ["goodbye", "bye", "bye-bye"],
  bonjour: ["hello", "hi"],
  "bon marché": ["cheap", "inexpensive"],
  cadeau: ["gift", "present"],
  cartable: ["schoolbag", "school bag", "satchel"],
  célèbre: ["famous", "well-known"],
  cher: ["expensive", "costly", "pricey"],
  choisir: ["choose", "pick", "select"],
  commencer: ["start", "begin"],
  courageux: ["brave", "courageous"],
  crier: ["shout", "yell"],
  effrayé: ["afraid", "scared", "frightened"],
  élève: ["student", "pupil"],
  "emploi du temps": ["timetable", "schedule"],
  enfant: ["child", "kid"],
  "en colère": ["angry", "mad"],
  erreur: ["mistake", "error"],
  escalier: ["stairs", "staircase", "stairway"],
  éteindre: ["turn off", "switch off"],
  étrange: ["strange", "odd", "weird"],
  fermer: ["close", "shut"],
  finir: ["finish", "end"],
  gare: ["station", "train station", "railway station"],
  "grand-mère": ["grandmother", "grandma", "granny"],
  "grand-père": ["grandfather", "grandpa", "granddad", "grandad"],
  heureux: ["happy", "glad"],
  impoli: ["impolite", "rude"],
  magasin: ["shop", "store"],
  médecin: ["doctor", "physician"],
  merci: ["thanks", "thank you"],
  mère: ["mother", "mum", "mom"],
  père: ["father", "dad"],
  petit: ["small", "little"],
  presque: ["almost", "nearly"],
  prêt: ["ready", "prepared"],
  rapide: ["fast", "quick"],
  réponse: ["answer", "reply"],
  "s'occuper de": ["look after", "take care of"],
  téléphone: ["phone", "telephone"],
  vélo: ["bike", "bicycle"],
};

// Accept an English infinitive with or without "to" when the French cue is a verb.
const infinitives = new Set([
  "abandonner", "acheter", "adorer", "aider", "aimer", "aller", "allumer", "apporter", "apprendre", "arriver",
  "attendre", "attraper", "avoir", "avoir besoin", "boire", "cacher", "chanter", "choisir", "commencer",
  "comprendre", "courir", "crier", "cuisiner", "danser", "décrire", "demander", "dessiner",
  "détester", "dire", "donner", "dormir", "écouter", "écrire", "enseigner", "entendre",
  "essayer", "éteindre", "être", "étudier", "faire", "fermer", "finir", "gagner", "grimper", "inviter",
  "jouer", "lancer", "lire", "manger", "marcher", "mettre", "nager", "obtenir", "oublier", "ouvrir",
  "pardonner", "parler", "partir", "penser", "perdre", "pleurer", "porter", "prendre", "regarder", "rejoindre",
  "s'occuper de", "s'asseoir", "sauter", "savoir", "se lever", "se réveiller", "se souvenir", "sourire",
  "suivre", "travailler", "utiliser", "vendre", "venir", "visiter", "vivre", "voir", "voyager", "vouloir",
]);

export function translationAnswers(word: string, french = ""): string[] {
  const canonical = word.trim().toLowerCase();
  const alternate = variants[canonical];
  const prompt = french.trim().normalize("NFC").toLowerCase().replace(/’/g, "'");
  const byMeaning = equivalentsByPrompt[prompt];
  const accepted = new Set([word, ...(Array.isArray(alternate) ? alternate : [])]);
  if (Array.isArray(byMeaning) && byMeaning.includes(canonical)) {
    for (const answer of byMeaning) if (answer !== canonical) accepted.add(answer);
  }
  if (infinitives.has(prompt)) {
    for (const answer of [...accepted]) accepted.add("to " + answer.toLowerCase());
  }
  return [...accepted];
}
