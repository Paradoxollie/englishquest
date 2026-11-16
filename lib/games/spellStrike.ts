/**
 * Spell Strike - Moteur pur (orthographe et dictée anglaise).
 *
 * 10 manches par partie : on écoute le mot (ou sa phrase d'exemple),
 * on lit l'indice de contexte et on écrit l'orthographe exacte.
 */

import { pickByLevel, type GameLevel } from "./levels";
import type { Difficulty } from "@/lib/profile/leveling";

export type SpellDifficulty = 1 | 2 | 3;

export const SPELL_STRIKE_ROUNDS = 10;

export type SpellEntry = {
  id: string;
  word: string;
  accept?: string[];
  french: string;
  sentence: string;
  sentenceSpoken: string;
  phonetic: string;
  hint: string;
  level: GameLevel;
};

export type SpellDiffCell = {
  expected: string;
  given: string;
  status: "match" | "wrong" | "missing";
};

export type SpellRoundResult = {
  entry: SpellEntry;
  given: string;
  correct: boolean;
  usedHint: boolean;
  reactionMs: number;
  points: number;
  diff: SpellDiffCell[];
};

const DIFFICULTY_CONFIG: Record<
  SpellDifficulty,
  {
    label: string;
    subtitle: string;
    dbDifficulty: Difficulty;
    basePoints: number;
    maxSpeedBonus: number;
    streakStep: number;
    maxStreakSteps: number;
    allowHint: boolean;
    speedWindowMs: number;
  }
> = {
  1: {
    label: "Facile",
    subtitle: "Indices disponibles · rythme posé",
    dbDifficulty: "easy",
    basePoints: 100,
    maxSpeedBonus: 40,
    streakStep: 15,
    maxStreakSteps: 4,
    allowHint: true,
    speedWindowMs: 14_000,
  },
  2: {
    label: "Moyen",
    subtitle: "Indice possible · bonus vitesse",
    dbDifficulty: "medium",
    basePoints: 130,
    maxSpeedBonus: 50,
    streakStep: 20,
    maxStreakSteps: 4,
    allowHint: true,
    speedWindowMs: 11_000,
  },
  3: {
    label: "Difficile",
    subtitle: "Zéro indice · score maximal",
    dbDifficulty: "hard",
    basePoints: 170,
    maxSpeedBonus: 60,
    streakStep: 25,
    maxStreakSteps: 4,
    allowHint: false,
    speedWindowMs: 9_000,
  },
};

export function getSpellDifficultyConfig(difficulty: SpellDifficulty) {
  return DIFFICULTY_CONFIG[difficulty];
}

function entry(
  level: GameLevel,
  word: string,
  french: string,
  sentence: string,
  phonetic: string,
  hint: string,
  accept?: string[]
): SpellEntry {
  const id = word.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id,
    word,
    accept,
    french,
    sentence,
    sentenceSpoken: sentence.replace("____", word),
    phonetic,
    hint,
    level,
  };
}

/**
 * 150 mots d'anglais ciblant les pièges d'orthographe fréquents pour les
 * francophones (30 mots par niveau CECRL, de 1 = A1 à 5 = B1+).
 */
export const SPELL_STRIKE_WORDS: readonly SpellEntry[] = [
  // Niveau 1 (A1 - 30 mots)
  entry(1, "friend", "ami", "Maya is my best ____ at school.", "/frend/", "Pense au i avant le e : fri-end."),
  entry(1, "school", "école", "Sam walks to ____ every morning.", "/skuːl/", "Commence par sch, avec un double o."),
  entry(1, "orange", "orange", "I would like some ____ juice, please.", "/ˈɒrɪndʒ/", "Identique au français à l'écrit."),
  entry(1, "teacher", "professeur", "Our English ____ speaks clearly.", "/ˈtiːtʃər/", "Son long 'i' écrit ea, terminé en -er."),
  entry(1, "apple", "pomme", "She eats a red ____ after lunch.", "/ˈæpl/", "Double p et e final muet."),
  entry(1, "window", "fenêtre", "Please open the ____, it is warm.", "/ˈwɪndəʊ/", "Se termine par -ow, comme snow."),
  entry(1, "yellow", "jaune", "The school bus is bright ____.", "/ˈjeləʊ/", "Double l au milieu, fin en -ow."),
  entry(1, "morning", "matin", "Good ____, everyone!", "/ˈmɔːnɪŋ/", "Se termine par -ing, sans e."),
  entry(1, "brother", "frère", "My younger ____ plays football.", "/ˈbrʌðər/", "Avec th au milieu et -er à la fin."),
  entry(1, "bicycle", "vélo", "He rides his ____ to the park.", "/ˈbaɪsɪkl/", "Deux syllabes : bi- puis cycle."),
  entry(1, "cheese", "fromage", "I put grated ____ on the pasta.", "/tʃiːz/", "Double e avant le s et e final."),
  entry(1, "please", "s'il te plaît", "Pass me the dictionary, ____.", "/pliːz/", "Avec ea au centre et s final sonore + e."),
  entry(1, "because", "parce que", "We stayed inside ____ it rained.", "/bɪˈkɒz/", "Fin en -cause, comme le mot 'cause'."),
  entry(1, "listen", "écouter", "____ carefully to the first word.", "/ˈlɪsn/", "Un t muet au milieu : lis-ten."),
  entry(1, "write", "écrire", "Please ____ your name at the top.", "/raɪt/", "Commence par un w muet avant le r."),
  entry(1, "bottle", "bouteille", "Take a ____ of water in your bag.", "/ˈbɒtl/", "Double t puis -le final."),
  entry(1, "summer", "été", "We visit London every ____.", "/ˈsʌmər/", "Double m après le u."),
  entry(1, "dinner", "dîner", "____ is ready on the kitchen table.", "/ˈdɪnər/", "Double n (un seul en français, deux en anglais)."),
  entry(1, "happy", "heureux", "You look very ____ today.", "/ˈhæpi/", "Un h aspiré, double p et y final."),
  entry(1, "people", "gens", "Many ____ travel by train here.", "/ˈpiːpl/", "S'écrit eo au début puis -ple."),
  entry(1, "purple", "violet", "She chose a ____ notebook.", "/ˈpɜːpl/", "Contient ur au début et -ple à la fin."),
  entry(1, "little", "petit", "Wait a ____ moment, please.", "/ˈlɪtl/", "Double t suivi de -le."),
  entry(1, "sister", "sœur", "My older ____ lives in Bristol.", "/ˈsɪstər/", "Très régulier : sis-ter."),
  entry(1, "family", "famille", "My whole ____ came to the match.", "/ˈfæmɪli/", "Un seul l et un y final."),
  entry(1, "animal", "animal", "What is your favourite wild ____?", "/ˈænɪml/", "Même orthographe qu'en français."),
  entry(1, "pencil", "crayon", "I need a sharp ____ to draw.", "/ˈpensl/", "Un c doux avant -il, pas de s."),
  entry(1, "Monday", "lundi", "Our science club meets on ____.", "/ˈmʌndeɪ/", "Commence par Mon- + day."),
  entry(1, "guitar", "guitare", "He practises the ____ after class.", "/ɡɪˈtɑːr/", "Garde le u muet après g, sans e final."),
  entry(1, "bread", "pain", "We bought fresh ____ at the bakery.", "/bred/", "Le son court /e/ s'écrit ea."),
  entry(1, "cloud", "nuage", "There is not a single ____ in the sky.", "/klaʊd/", "S'écrit ou, comme loud."),

  // Niveau 2 (A2 - 30 mots)
  entry(2, "always", "toujours", "Maya ____ checks her answers twice.", "/ˈɔːlweɪz/", "Un seul l au début (al-, jamais all-) et s final."),
  entry(2, "already", "déjà", "Sam has ____ finished level two.", "/ɔːlˈredi/", "Un seul l dans al-, puis ready."),
  entry(2, "beautiful", "magnifique", "London looks ____ at sunset.", "/ˈbjuːtɪfl/", "Commence par beau- suivi de -tiful."),
  entry(2, "between", "entre", "Sit ____ Tom and Claire.", "/bɪˈtwiːn/", "Un double e pour le son /iː/."),
  entry(2, "country", "pays", "Which English-speaking ____ will you visit?", "/ˈkʌntri/", "Le son /ʌ/ s'écrit ou : coun-try."),
  entry(2, "different", "différent", "These two versions look quite ____.", "/ˈdɪfrənt/", "Double f et un seul r, -ent à la fin."),
  entry(2, "evening", "soirée", "Let us revise together this ____.", "/ˈiːvnɪŋ/", "N'oublie pas le premier e : eve-ning."),
  entry(2, "favourite", "préféré", "What is your ____ comic book?", "/ˈfeɪvərɪt/", "Graphie britannique avec ou avant -rite.", ["favorite"]),
  entry(2, "foreign", "étranger", "Learning a ____ language opens doors.", "/ˈfɒrən/", "G muet juste avant le n final : -eign."),
  entry(2, "hospital", "hôpital", "My aunt works as a nurse at the ____.", "/ˈhɒspɪtl/", "H au début et s sonore, pas d'accent."),
  entry(2, "island", "île", "Great Britain is a large ____.", "/ˈaɪlənd/", "Le s après i est totalement muet : is-land."),
  entry(2, "kitchen", "cuisine", "There is tea waiting in the ____.", "/ˈkɪtʃən/", "Contient tch au centre : ki-tch-en."),
  entry(2, "language", "langue", "English is a global ____.", "/ˈlæŋɡwɪdʒ/", "Attention : se termine par -uage (lang-uage), avec un e final muet."),
  entry(2, "minute", "minute", "The train leaves in one ____.", "/ˈmɪnɪt/", "Identique au français à l'écrit."),
  entry(2, "mountain", "montagne", "They climbed the highest ____ in Wales.", "/ˈmaʊntɪn/", "Commence par mou-, finit en -tain."),
  entry(2, "neighbour", "voisin", "Our friendly ____ watered our plants.", "/ˈneɪbər/", "Contient eigh puis our (ou or).", ["neighbor"]),
  entry(2, "question", "question", "Raise your hand before asking a ____.", "/ˈkwestʃən/", "Exactement comme en français."),
  entry(2, "remember", "se souvenir", "I cannot ____ his password!", "/rɪˈmembər/", "Deux m non collés : re-mem-ber."),
  entry(2, "Saturday", "samedi", "We have no lessons on ____.", "/ˈsætədeɪ/", "Pense au u après Sat- : Satur-day."),
  entry(2, "surprise", "surprise", "What a pleasant ____ for her birthday!", "/səˈpraɪz/", "Deux r (sur-prise), finit par s."),
  entry(2, "together", "ensemble", "Let us solve this mission ____.", "/təˈɡeðər/", "Trois syllabes : to-geth-er."),
  entry(2, "tomorrow", "demain", "We have a spelling test ____.", "/təˈmɒrəʊ/", "Un seul m mais double r : to-mor-row."),
  entry(2, "umbrella", "parapluie", "Always carry an ____ in Manchester.", "/ʌmˈbrelə/", "Un m, puis double l à la fin."),
  entry(2, "usually", "d'habitude", "I ____ read for twenty minutes at night.", "/ˈjuːʒuəli/", "Commence par usual + -ly (double l au total)."),
  entry(2, "weather", "météo", "Check the ____ forecast before leaving.", "/ˈweðər/", "Avec ea comme bread, puis -ther."),
  entry(2, "Wednesday", "mercredi", "The drama club meets every ____.", "/ˈwenzdeɪ/", "Le premier d et le deuxième e ne s'entendent pas : Wed-nes-day."),
  entry(2, "yesterday", "hier", "We visited the museum ____.", "/ˈjestədeɪ/", "Yester + day."),
  entry(2, "breakfast", "petit-déjeuner", "Eggs and toast make a classic ____.", "/ˈbrekfəst/", "Mot composé : break + fast."),
  entry(2, "chocolate", "chocolat", "Would you like some hot ____?", "/ˈtʃɒklət/", "Un o muet au milieu + e final."),
  entry(2, "daughter", "fille (parenté)", "Their ____ speaks three languages.", "/ˈdɔːtər/", "Contient augh muet : d-augh-ter."),

  // Niveau 3 (A2+ - 30 mots)
  entry(3, "accident", "accident", "Fortunately, nobody was hurt in the ____.", "/ˈæksɪdənt/", "Double c comme en français : ac-ci-dent."),
  entry(3, "actually", "en fait", "I ____ enjoyed that grammar exercise!", "/ˈæktʃuəli/", "Actual + ly = double l à la fin (faux ami de 'actuellement')."),
  entry(3, "address", "adresse", "Please write your email ____ clearly.", "/əˈdres/", "Double d ET double s en anglais !"),
  entry(3, "advantage", "avantage", "Speaking English is a huge ____.", "/ədˈvɑːntɪdʒ/", "Prend un d devant vantage : ad-vantage."),
  entry(3, "attention", "attention", "Pay close ____ to the radio announcement.", "/əˈtenʃn/", "Identique au français à l'écrit."),
  entry(3, "believe", "croire", "I cannot ____ you solved it so fast!", "/bɪˈliːv/", "Règle 'i before e' : be-lie-ve."),
  entry(3, "calendar", "calendrier", "Mark the exam date on your ____.", "/ˈkælɪndər/", "Attention : fin en -dar (pas -der)."),
  entry(3, "character", "personnage", "Maya is my favourite comic ____.", "/ˈkærəktər/", "Son /k/ écrit ch au début : char-ac-ter."),
  entry(3, "decision", "décision", "Take your time before making a ____.", "/dɪˈsɪʒn/", "Un seul c, un seul s, fin en -sion."),
  entry(3, "describe", "décrire", "Can you ____ the hero in three words?", "/dɪˈskraɪb/", "Un s devant c : de-scribe."),
  entry(3, "disappear", "disparaître", "The thief seemed to ____ in the fog.", "/ˌdɪsəˈpɪər/", "Un seul s dans dis-, double p dans appear."),
  entry(3, "education", "éducation", "Free ____ helps every student succeed.", "/ˌedʒuˈkeɪʃn/", "Comme en français sans accent."),
  entry(3, "enough", "assez", "Do we have ____ time for one more round?", "/ɪˈnʌf/", "Le son /f/ s'écrit gh : e-nough."),
  entry(3, "especially", "surtout", "I love word games, ____ Enigma Scroll.", "/ɪˈspeʃəli/", "Commence par e-, un seul s, double l avant y."),
  entry(3, "exercise", "exercice", "Daily practice is great mental ____.", "/ˈeksəsaɪz/", "Attention : un c suivi d'un s en anglais !"),
  entry(3, "explain", "expliquer", "Could you ____ this rule one more time?", "/ɪkˈspleɪn/", "Contient ai au milieu : ex-plain."),
  entry(3, "famous", "célèbre", "Sherlock Holmes is a ____ detective.", "/ˈfeɪməs/", "Fame perd son e pour prendre -ous."),
  entry(3, "February", "février", "My cousin was born in ____.", "/ˈfebruəri/", "N'oublie pas le premier r muet : Feb-ru-ary."),
  entry(3, "knowledge", "connaissance", "Reading builds your vocabulary and ____.", "/ˈnɒlɪdʒ/", "K muet au début, w muet, d avant g."),
  entry(3, "library", "bibliothèque", "Stay quiet inside the school ____.", "/ˈlaɪbrəri/", "Deux r : li-bra-ry."),
  entry(3, "medicine", "médicament", "Take your ____ with a glass of water.", "/ˈmedsn/", "Finit en -cine (et non -cin)."),
  entry(3, "necessary", "nécessaire", "A helmet is ____ when cycling.", "/ˈnesəsəri/", "Astuce 'un col, deux manches' : 1 c, 2 s."),
  entry(3, "opinion", "avis", "Everyone gave an honest ____ in class.", "/əˈpɪnjən/", "Comme en français."),
  entry(3, "possible", "possible", "Everything is ____ with steady effort.", "/ˈpɒsəbl/", "Double s et -ible final."),
  entry(3, "promise", "promettre", "I ____ to return the book tomorrow.", "/ˈprɒmɪs/", "Un seul s et un seul m : pro-mise."),
  entry(3, "receive", "recevoir", "Did you ____ my invitation?", "/rɪˈsiːv/", "Après c, e avant i : re-cei-ve."),
  entry(3, "scissors", "ciseaux", "Use ____ to cut out the clues.", "/ˈsɪzəz/", "Commence par sc-, puis double s au milieu."),
  entry(3, "separate", "séparer", "Keep the two word lists ____.", "/ˈsepərət/", "Il y a 'a rat' au milieu : sep-a-rate."),
  entry(3, "straight", "tout droit", "Walk ____ ahead past the station.", "/streɪt/", "Contient aigh au centre : str-aigh-t."),
  entry(3, "through", "à travers", "We walked ____ Hyde Park after class.", "/θruː/", "Terminaison -ough muette : thr-ough."),

  // Niveau 4 (B1 - 30 mots)
  entry(4, "achieve", "réussir / atteindre", "Work step by step to ____ your goal.", "/əˈtʃiːv/", "Pas d'e muet après ch : ach-ie-ve."),
  entry(4, "appearance", "apparence", "Judge the facts, not the outer ____.", "/əˈpɪərəns/", "Double p, ea au milieu, fin en -ance."),
  entry(4, "argument", "dispute / argument", "She presented a clear ____ in the debate.", "/ˈɑːɡjumənt/", "Le e de argue disparaît avant -ment !"),
  entry(4, "available", "disponible", "Tickets are still ____ at the counter.", "/əˈveɪləbl/", "Un seul l, ai au début : a-vail-able."),
  entry(4, "beginning", "début", "Check the ____ of the recording again.", "/bɪˈɡɪnɪŋ/", "Double n devant -ing, un seul g."),
  entry(4, "business", "entreprise / affaires", "She runs a small local ____.", "/ˈbɪznəs/", "Busi- (pas busy) + ness : un i caché au milieu !"),
  entry(4, "carefully", "soigneusement", "Listen ____ to the speaker's phone number.", "/ˈkeəfəli/", "Care + ful (1 l) + ly = double l au total."),
  entry(4, "challenge", "défi", "Are you ready for the final ____?", "/ˈtʃælɪndʒ/", "Double l, fin en -enge (comme en anglais, différent du fr parfois)."),
  entry(4, "colleague", "collègue", "My ____ sent the files before noon.", "/ˈkɒliːɡ/", "Double l, puis ea et -gue final muet."),
  entry(4, "comfortable", "confortable", "Sit down and make yourself ____.", "/ˈkʌmftəbl/", "En anglais c'est com-f-ortable (m devant f, jamais n !)."),
  entry(4, "definitely", "certainement", "We will ____ visit Oxford next spring.", "/ˈdefɪnətli/", "Il y a 'finite' dedans : de-finite-ly (pas de a)."),
  entry(4, "embarrass", "gêner", "Do not let small mistakes ____ you.", "/ɪmˈbærəs/", "Double r et double s : em-bar-rass."),
  entry(4, "environment", "environnement", "Clean energy helps protect the ____.", "/ɪnˈvaɪrənmənt/", "Garde le n avant m : en-viron-ment."),
  entry(4, "experience", "expérience", "Volunteering gave her valuable ____.", "/ɪkˈspɪəriəns/", "Ex + peri + ence."),
  entry(4, "government", "gouvernement", "The ____ announced a new rail plan.", "/ˈɡʌvənmənt/", "Commence par go- et garde le n de govern avant -ment."),
  entry(4, "immediate", "immédiat", "The alert asked for an ____ reply.", "/ɪˈmiːdiət/", "Double m, un seul d, fin en -ate."),
  entry(4, "independent", "indépendant", "She became financially ____ after university.", "/ˌɪndɪˈpendənt/", "Trois e après ind- : in-de-pen-dent (jamais de a)."),
  entry(4, "journalist", "journaliste", "The ____ interviewed three witnesses.", "/ˈdʒɜːnəlɪst/", "Sans e final en anglais : journal + ist."),
  entry(4, "opportunity", "occasion", "Do not miss this ____ to practise.", "/ˌɒpəˈtjuːnəti/", "Double p au début, un seul t au milieu."),
  entry(4, "particular", "particulier", "Is there any ____ reason for the delay?", "/pəˈtɪkjələr/", "Se termine en -ar (et non -er)."),
  entry(4, "persuade", "persuader", "Sam tried to ____ Maya to wait.", "/pəˈsweɪd/", "Son /sw/ écrit su : per-suade."),
  entry(4, "privilege", "privilège", "It was a ____ to meet the author.", "/ˈprɪvəlɪdʒ/", "Deux i puis deux e, sans d ni accent : priv-i-lege."),
  entry(4, "pronounce", "prononcer", "How do you ____ this silent letter?", "/prəˈnaʊns/", "Contient ou au milieu."),
  entry(4, "recommend", "recommander", "Which London museum would you ____?", "/ˌrekəˈmend/", "Un seul c au milieu, mais double m : re-c-omm-end."),
  entry(4, "reference", "référence", "Keep this grammar sheet for future ____.", "/ˈrefrəns/", "Un seul f, un seul r au milieu : re-fer-ence."),
  entry(4, "responsible", "responsable", "Every pilot is ____ for safety.", "/rɪˈspɒnsəbl/", "Se termine en -ible en anglais (et non -able)."),
  entry(4, "restaurant", "restaurant", "We booked a table at an Italian ____.", "/ˈrestrɒnt/", "Garde le au au milieu : rest-au-rant."),
  entry(4, "schedule", "emploi du temps", "Check your train ____ before Monday.", "/ˈʃedjuːl/", "Commence par sch-, finit en -ule."),
  entry(4, "significant", "important / notable", "There was a ____ drop in errors.", "/sɪɡˈnɪfɪkənt/", "Fin en -ant, un seul n au milieu."),
  entry(4, "successful", "couronné de succès", "Their rescue mission was completely ____.", "/səkˈsesfl/", "Double c, double s, et un seul l à -ful."),

  // Niveau 5 (B1+ - 30 mots)
  entry(5, "accommodate", "héberger / accueillir", "This youth hostel can ____ sixty students.", "/əˈkɒmədeɪt/", "Deux c et deux m : ac-com-mo-date."),
  entry(5, "acknowledgement", "reconnaissance / accusé", "We received quick ____ of our report.", "/əkˈnɒlɪdʒmənt/", "Ac + knowledge + ment.", ["acknowledgment"]),
  entry(5, "atmosphere", "atmosphère", "The hall had a warm, friendly ____.", "/ˈætməsfɪər/", "Son /f/ écrit ph en anglais : atmo-sphere."),
  entry(5, "conscience", "conscience", "He had a guilty ____ after hiding the note.", "/ˈkɒnʃəns/", "Con + science."),
  entry(5, "convenient", "pratique", "Tuesday afternoon is very ____ for me.", "/kənˈviːniənt/", "Se termine en -ient (et non -iant)."),
  entry(5, "disappoint", "décevoir", "Heavy rain did not ____ the hikers.", "/ˌdɪsəˈpɔɪnt/", "Un seul s dans dis-, double p dans appoint."),
  entry(5, "enthusiastic", "enthousiaste", "The class was ____ about the game.", "/ɪnˌθjuːziˈæstɪk/", "Garde th et u (pas ou) : en-thu-siastic."),
  entry(5, "existence", "existence", "Scientists debated the ____ of the island.", "/ɪɡˈzɪstəns/", "Trois e : ex-ist-ence (jamais de a)."),
  entry(5, "extraordinary", "extraordinaire", "Maya showed ____ courage during the storm.", "/ɪkˈstrɔːdnri/", "Extra + ordinary collés ensemble."),
  entry(5, "fascinating", "fascinant", "The museum guide told a ____ story.", "/ˈfæsɪneɪtɪŋ/", "Garde le sc comme en français : fas-c-inating."),
  entry(5, "fluorescent", "fluorescent", "The alarm glowed under ____ lights.", "/flʊəˈresnt/", "Flu + o + r + e + sc + ent."),
  entry(5, "guaranteed", "garanti", "Every repaired device is ____ for two years.", "/ˌɡærənˈtiːd/", "Commence par gu-, puis double e avant d."),
  entry(5, "harassment", "harcèlement", "The school strictly bans any form of ____.", "/ˈhærəsmənt/", "Un seul r mais double s : har-ass-ment."),
  entry(5, "indispensable", "indispensable", "A clear map is ____ on a mountain trek.", "/ˌɪndɪˈspensəbl/", "Finit bien en -able comme en français."),
  entry(5, "maintenance", "entretien", "The line is closed for track ____.", "/ˈmeɪntənəns/", "Main + ten + ance (e au milieu, pas ai)."),
  entry(5, "millennium", "millénaire", "People celebrated the new ____ in 2000.", "/mɪˈleniəm/", "Double l et double n : mil-len-nium."),
  entry(5, "mischievous", "espiègle", "The ____ puppy hid Sam's running shoes.", "/ˈmɪstʃɪvəs/", "I devant e après ch, et fin en -vous sans i."),
  entry(5, "noticeable", "remarquable", "There was a ____ improvement in his accent.", "/ˈnəʊtɪsəbl/", "Notice garde son e devant -able."),
  entry(5, "occurrence", "événement / occurrence", "Snow in June is a rare ____ in London.", "/əˈkʌrəns/", "Double c, double r, fin en -ence."),
  entry(5, "parliament", "parlement", "Big Ben stands beside the Houses of ____.", "/ˈpɑːləmənt/", "Un i muet se cache dans par-lia-ment."),
  entry(5, "perseverance", "persévérance", "With ____, even hard puzzles get clear.", "/ˌpɜːsɪˈvɪərəns/", "Deux e au début, fin en -ance."),
  entry(5, "phenomenon", "phénomène", "The northern lights are a natural ____.", "/fɪˈnɒmɪnən/", "Ph au début, fin en -on au singulier."),
  entry(5, "possession", "possession", "Keeping calm in crisis is his best ____.", "/pəˈzeʃn/", "Quatre s en tout : pos-ses-sion."),
  entry(5, "questionnaire", "questionnaire", "Please fill out this short ____.", "/ˌkwestʃəˈneər/", "Double n avant -aire, identique au français."),
  entry(5, "rhythm", "rythme", "Listen to the natural ____ of the sentence.", "/ˈrɪðəm/", "Deux h et y comme seule voyelle : r-h-y-t-h-m."),
  entry(5, "sacrifice", "sacrifice", "Great heroes sometimes make a big ____.", "/ˈsækrɪfaɪs/", "S'écrit exactement comme en français."),
  entry(5, "superintendent", "surintendant / directeur", "The building ____ opened the gate early.", "/ˌsuːpərɪnˈtendənt/", "Super + in + tend + ent (et non -ant)."),
  entry(5, "temperature", "température", "The ____ dropped below freezing last night.", "/ˈtemprətʃər/", "Comme en français sans accent : tem-per-a-ture."),
  entry(5, "unbelievable", "incroyable", "Finishing ten levels in one week is ____!", "/ˌʌnbɪˈliːvəbl/", "Un + believ (ie) + able."),
  entry(5, "vacuum", "vide / aspirateur", "Sound cannot travel through a total ____.", "/ˈvækjuːm/", "Un seul c, mais double u : vac-uu-m."),
];

export function normalizeSpellInput(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[‘’ʼ`´]/g, "'")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function isSpellAnswerCorrect(target: SpellEntry, rawInput: string): boolean {
  const given = normalizeSpellInput(rawInput);
  if (!given) return false;
  if (normalizeSpellInput(target.word) === given) return true;
  return Boolean(target.accept?.some((alt) => normalizeSpellInput(alt) === given));
}

export function buildSpellingDiff(expectedWord: string, rawInput: string): SpellDiffCell[] {
  const expected = expectedWord.toLowerCase();
  const given = normalizeSpellInput(rawInput);
  const length = expected.length;
  const cells: SpellDiffCell[] = [];
  for (let i = 0; i < length; i += 1) {
    const expChar = expected[i] ?? "";
    const givChar = given[i] ?? "";
    cells.push({
      expected: expChar,
      given: givChar,
      status: !givChar ? "missing" : expChar === givChar ? "match" : "wrong",
    });
  }
  return cells;
}

export function pickSpellRounds(options: {
  level?: GameLevel;
  totalRounds?: number;
  rng?: () => number;
} = {}): SpellEntry[] {
  const level = options.level ?? 1;
  const totalRounds = options.totalRounds ?? SPELL_STRIKE_ROUNDS;
  const rng = options.rng ?? Math.random;
  return pickByLevel(SPELL_STRIKE_WORDS, level, totalRounds, rng);
}

export function computeSpellRoundPoints({
  difficulty,
  correct,
  usedHint,
  reactionMs,
  newStreak,
}: {
  difficulty: SpellDifficulty;
  correct: boolean;
  usedHint: boolean;
  reactionMs: number;
  newStreak: number;
}): number {
  if (!correct) return 0;
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const hintCost = usedHint ? 40 : 0;
  const clampedReaction = Math.max(400, reactionMs);
  const speedRatio = usedHint ? 0 : Math.max(0, Math.min(1, 1 - clampedReaction / cfg.speedWindowMs));
  const speedBonus = Math.round(cfg.maxSpeedBonus * speedRatio);
  const streakBonus = Math.min(cfg.maxStreakSteps, Math.max(0, newStreak - 1)) * cfg.streakStep;
  return Math.max(40, cfg.basePoints - hintCost + speedBonus + streakBonus);
}

export function maxSpellStrikeScore(difficulty: SpellDifficulty, correctCount: number): number {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  let total = 0;
  for (let streak = 1; streak <= correctCount; streak += 1) {
    const streakBonus = Math.min(cfg.maxStreakSteps, streak - 1) * cfg.streakStep;
    total += cfg.basePoints + cfg.maxSpeedBonus + streakBonus;
  }
  return total;
}

export function spellDifficultyToDb(difficulty: SpellDifficulty): Difficulty {
  return DIFFICULTY_CONFIG[difficulty].dbDifficulty;
}
