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
  status: "match" | "wrong" | "missing" | "extra";
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
    /** Nombre de lettres affiché (cases vides) avant la réponse. */
    showLetterCount: boolean;
    /** Sens en français affiché (quand il ne révèle pas le mot). */
    showMeaning: boolean;
  }
> = {
  1: {
    label: "Facile",
    subtitle: "Sens, nombre de lettres et indice",
    dbDifficulty: "easy",
    basePoints: 100,
    maxSpeedBonus: 40,
    streakStep: 15,
    maxStreakSteps: 4,
    allowHint: true,
    speedWindowMs: 14_000,
    showLetterCount: true,
    showMeaning: true,
  },
  2: {
    label: "Moyen",
    subtitle: "Sens et indice, sans nombre de lettres",
    dbDifficulty: "medium",
    basePoints: 130,
    maxSpeedBonus: 50,
    streakStep: 20,
    maxStreakSteps: 4,
    allowHint: true,
    speedWindowMs: 11_000,
    showLetterCount: false,
    showMeaning: true,
  },
  3: {
    label: "Difficile",
    subtitle: "À l'oreille seulement · score maximal",
    dbDifficulty: "hard",
    basePoints: 170,
    maxSpeedBonus: 60,
    streakStep: 25,
    maxStreakSteps: 4,
    allowHint: false,
    speedWindowMs: 9_000,
    showLetterCount: false,
    showMeaning: false,
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
 * francophones (30 mots par niveau, de 1 = A1 à 5 = B1+).
 *
 * Règles de rédaction (vérifiées par les tests) :
 * - l'indice donne une règle d'orthographe sans jamais écrire le mot ;
 * - le sens en français n'est affiché que s'il ne révèle pas le mot
 *   (voir shouldShowSpellMeaning) ;
 * - phonétique de référence en anglais américain.
 */
export const SPELL_STRIKE_WORDS: readonly SpellEntry[] = [
  // Niveau 1 (A1)
  entry(1, "friend", "ami", "Maya is my best ____ at school.", "/frɛnd/", "Le son /ɛ/ s'écrit ie : i avant e."),
  entry(1, "school", "école", "Sam walks to ____ every morning.", "/skuːl/", "Le son /sk/ prend un h muet, et le son /uː/ s'écrit avec deux o."),
  entry(1, "orange", "orange", "I would like some ____ juice, please.", "/ˈɔrɪndʒ/", "Six lettres, un seul r, et un e muet à la fin."),
  entry(1, "teacher", "professeur", "Our English ____ speaks clearly.", "/ˈtiːtʃɚ/", "Le son /iː/ s'écrit ea ; la fin se prononce /ɚ/ mais s'écrit -er."),
  entry(1, "apple", "pomme", "She eats a red ____ after lunch.", "/ˈæpəl/", "Double p, et un e muet à la fin."),
  entry(1, "window", "fenêtre", "Please open the ____, it's warm.", "/ˈwɪndoʊ/", "Se termine par -ow, comme snow."),
  entry(1, "yellow", "jaune", "The school bus is bright ____.", "/ˈjɛloʊ/", "Double l au milieu, fin en -ow."),
  entry(1, "morning", "matin", "Good ____, everyone!", "/ˈmɔrnɪŋ/", "Le groupe or correspond ici à /ɔr/. Termine par -ing."),
  entry(1, "brother", "frère", "My younger ____ plays football.", "/ˈbrʌðɚ/", "Le son /ʌ/ s'écrit o ; th au milieu, -er à la fin."),
  entry(1, "bicycle", "vélo", "He rides his ____ to the park.", "/ˈbaɪsɪkəl/", "Trois syllabes : le son /aɪ/ s'écrit i, et un y se cache au milieu."),
  entry(1, "cheese", "fromage", "I put grated ____ on the pasta.", "/tʃiːz/", "Double e, puis s et un e muet à la fin."),
  entry(1, "please", "s'il te plaît", "Pass me the dictionary, ____.", "/pliːz/", "Le son /iː/ s'écrit ea, et le mot finit par un e muet."),
  entry(1, "because", "parce que", "We stayed inside ____ it rained.", "/bɪˈkʌz/", "Dans l’accent de la dictée, /ʌ/ s’écrit au, et le mot finit par un e muet."),
  entry(1, "listen", "écouter", "____ carefully to the first word.", "/ˈlɪsən/", "Un t muet se cache au milieu."),
  entry(1, "write", "écrire", "Please ____ your name at the top.", "/raɪt/", "Commence par un w muet et finit par un e muet."),
  entry(1, "bottle", "bouteille", "Take a ____ of water in your bag.", "/ˈbɑtəl/", "Double t, puis -le (et non -el)."),
  entry(1, "summer", "été", "We visit London every ____.", "/ˈsʌmɚ/", "Double m après le u."),
  entry(1, "dinner", "dîner", "____ is ready on the kitchen table.", "/ˈdɪnɚ/", "Double n en anglais (un seul en français)."),
  entry(1, "happy", "heureux", "You look very ____ today.", "/ˈhæpi/", "Double p, et un y à la fin."),
  entry(1, "people", "gens", "Many ____ travel by train here.", "/ˈpiːpəl/", "Le son /iː/ s'écrit eo, et le mot finit par -ple."),
  entry(1, "purple", "violet", "She chose a ____ notebook.", "/ˈpɝpəl/", "Le son /ɝ/ s'écrit ur, et le mot finit par -ple."),
  entry(1, "little", "petit", "My ____ brother is six years old.", "/ˈlɪtəl/", "Double t, puis -le."),
  entry(1, "sister", "sœur", "My older ____ lives in Bristol.", "/ˈsɪstɚ/", "Deux syllabes régulières ; la fin s'écrit -er."),
  entry(1, "family", "famille", "My whole ____ came to the match.", "/ˈfæməli/", "Un seul m, un seul l, et un y à la fin."),
  entry(1, "animal", "animal", "What is your favourite wild ____?", "/ˈænɪməl/", "Six lettres ; finit par -al."),
  entry(1, "pencil", "crayon", "I need a sharp ____ to draw.", "/ˈpɛnsəl/", "Le son /s/ s'écrit c ; fin en -il."),
  entry(1, "Monday", "lundi", "Our science club meets on ____.", "/ˈmʌndeɪ/", "Majuscule obligatoire pour les jours ; le son /ʌ/ s'écrit o, fin en -day."),
  entry(1, "guitar", "guitare", "He practises the ____ after class.", "/ɡɪˈtɑr/", "Un u muet après le g, et pas de e final."),
  entry(1, "bread", "pain", "We bought fresh ____ at the bakery.", "/brɛd/", "Le son court /e/ s'écrit ea."),
  entry(1, "cloud", "nuage", "There isn't a single ____ in the sky.", "/klaʊd/", "Le son /aʊ/ s'écrit ou, comme dans loud."),

  // Niveau 2 (A2)
  entry(2, "always", "toujours", "Maya ____ checks her answers twice.", "/ˈɔlweɪz/", "Un seul l au début, et un s à la fin."),
  entry(2, "already", "déjà", "Sam has ____ finished level two.", "/ɔlˈrɛdi/", "Un seul l au début ; le son /ɛ/ s'écrit ea ; y à la fin."),
  entry(2, "beautiful", "magnifique", "London looks ____ at sunset.", "/ˈbjuːtəfəl/", "Le début s'écrit comme le mot français « beau » ; -ful prend un seul l."),
  entry(2, "between", "entre", "Sit ____ Tom and Claire.", "/bɪˈtwiːn/", "Le son /iː/ s'écrit avec un double e."),
  entry(2, "country", "pays", "Which English-speaking ____ will you visit?", "/ˈkʌntri/", "Le son /ʌ/ s'écrit ou ; y à la fin."),
  entry(2, "different", "différent", "These two versions look quite ____.", "/ˈdɪfrənt/", "Double f, un seul r, fin en -ent."),
  entry(2, "evening", "soirée", "What are you doing this ____?", "/ˈiːvnɪŋ/", "Un e se cache au milieu et ne s'entend presque pas."),
  entry(2, "favourite", "préféré", "What is your ____ comic book?", "/ˈfeɪvrɪt/", "Les deux graphies sont admises. Aux États-Unis on écrit -or-, au Royaume-Uni -our-. Termine par -ite.", ["favorite"]),
  entry(2, "foreign", "étranger", "Learning a ____ language opens doors.", "/ˈfɔrən/", "Un g muet juste avant le n final, après ei."),
  entry(2, "hospital", "hôpital", "My aunt works as a nurse at the ____.", "/ˈhɑspɪtəl/", "Le s se prononce ; pas d'accent ; fin en -al."),
  entry(2, "island", "île", "Great Britain is a large ____.", "/ˈaɪlənd/", "Un s muet se cache après le i du début."),
  entry(2, "kitchen", "cuisine", "There's tea waiting in the ____.", "/ˈkɪtʃən/", "Le son /tʃ/ s'écrit tch au milieu."),
  entry(2, "language", "langue", "English is a global ____.", "/ˈlæŋɡwɪdʒ/", "Après le son /ŋ/, on écrit -uage, avec un e muet final."),
  entry(2, "minute", "minute", "The train leaves in one ____.", "/ˈmɪnɪt/", "Six lettres ; finit par un e muet."),
  entry(2, "mountain", "montagne", "They climbed the highest ____ in Wales.", "/ˈmaʊntən/", "Le son /aʊ/ s'écrit ou ; fin en -tain."),
  entry(2, "neighbour", "voisin", "Our friendly ____ watered our plants.", "/ˈneɪbɚ/", "Le son /eɪ/ s’écrit eigh. Pour la fin, -or et -our sont tous deux admis.", ["neighbor"]),
  entry(2, "question", "question", "Raise your hand before asking a ____.", "/ˈkwɛstʃən/", "Huit lettres ; le son /tʃ/ s'écrit ti."),
  entry(2, "remember", "se souvenir", "I can't ____ his password!", "/rɪˈmɛmbɚ/", "Trois syllabes, chacune avec un seul m."),
  entry(2, "Saturday", "samedi", "We have no lessons on ____.", "/ˈsætɚdeɪ/", "Majuscule obligatoire ; la syllabe du milieu s’écrit -ur-."),
  entry(2, "surprise", "surprise", "What a pleasant ____ for her birthday!", "/sɚˈpraɪz/", "Deux r, et le mot finit par -se."),
  entry(2, "together", "ensemble", "Let's solve this mystery ____.", "/təˈɡɛðɚ/", "Trois syllabes ; le son /ð/ s'écrit th."),
  entry(2, "tomorrow", "demain", "We have a spelling test ____.", "/təˈmɑroʊ/", "Un seul m, mais un double r."),
  entry(2, "umbrella", "parapluie", "Always carry an ____ in Manchester.", "/ʌmˈbrɛlə/", "Un seul m, puis un double l."),
  entry(2, "usually", "d'habitude", "I ____ read for twenty minutes at night.", "/ˈjuːʒuəli/", "Le son /ʒ/ s'écrit s ; fin en -ally avec un double l."),
  entry(2, "weather", "météo", "Check the ____ forecast before leaving.", "/ˈwɛðɚ/", "Le son /ɛ/ s'écrit ea, comme dans bread ; puis th."),
  entry(2, "Wednesday", "mercredi", "The drama club meets every ____.", "/ˈwɛnzdeɪ/", "Majuscule obligatoire ; deux lettres muettes : un d et un e."),
  entry(2, "yesterday", "hier", "We visited the museum ____.", "/ˈjɛstɚdeɪ/", "Mot composé ; la deuxième partie veut dire « jour »."),
  entry(2, "breakfast", "petit-déjeuner", "Eggs and toast make a classic ____.", "/ˈbrɛkfəst/", "Mot composé de deux verbes : « casser » et « jeûner »."),
  entry(2, "chocolate", "chocolat", "Would you like some hot ____?", "/ˈtʃɑklət/", "Un o muet au milieu, et un e muet à la fin."),
  entry(2, "daughter", "fille (enfant)", "Their ____ speaks three languages.", "/ˈdɔtɚ/", "Le groupe au est suivi de gh, qui reste muet."),

  // Niveau 3 (A2+)
  entry(3, "accident", "accident", "Fortunately, nobody was hurt in the ____.", "/ˈæksɪdənt/", "Double c ; fin en -ent."),
  entry(3, "actually", "en fait", "I ____ enjoyed that grammar exercise!", "/ˈæktʃuəli/", "Fin en -ally avec un double l. Faux ami : ce n'est pas « actuellement »."),
  entry(3, "address", "adresse", "Please write your email ____ clearly.", "/əˈdrɛs/", "Double d et double s en anglais."),
  entry(3, "advantage", "avantage", "Speaking English is a huge ____.", "/ədˈvæntɪdʒ/", "Un d de plus qu'en français, juste après le a du début."),
  entry(3, "attention", "attention", "Pay close ____ to the radio announcement.", "/əˈtɛnʃən/", "Double t au début ; fin en -tion."),
  entry(3, "believe", "croire", "I can't ____ you solved it so fast!", "/bɪˈliːv/", "i avant e, et un e muet à la fin."),
  entry(3, "calendar", "calendrier", "Mark the exam date on your ____.", "/ˈkæləndɚ/", "Fin en -ar (et non -er)."),
  entry(3, "character", "personnage", "Maya is my favourite comic ____.", "/ˈkærɪktɚ/", "Le son /k/ s'écrit ch au début ; fin en -er."),
  entry(3, "decision", "décision", "Take your time before making a ____.", "/dɪˈsɪʒən/", "Un seul c, un seul s ; fin en -sion."),
  entry(3, "describe", "décrire", "Can you ____ the hero in three words?", "/dɪˈskraɪb/", "Un s devant le c ; e muet à la fin."),
  entry(3, "disappear", "disparaître", "The thief seemed to ____ in the fog.", "/ˌdɪsəˈpɪr/", "Un seul s, mais un double p."),
  entry(3, "education", "éducation", "Free ____ helps every student succeed.", "/ˌɛdʒuˈkeɪʃən/", "Le son /dʒ/ s'écrit d ; fin en -tion."),
  entry(3, "enough", "assez", "Do we have ____ time for one more round?", "/ɪˈnʌf/", "Le son /f/ s'écrit gh, après ou."),
  entry(3, "especially", "surtout", "I love word games, ____ Enigma Scroll.", "/ɪˈspɛʃəli/", "Commence par e-, un seul s, double l avant le y."),
  entry(3, "exercise", "exercice", "Daily practice is great mental ____.", "/ˈɛksɚsaɪz/", "Le son /s/ s'écrit c ; le mot finit par -ise."),
  entry(3, "explain", "expliquer", "Could you ____ this rule one more time?", "/ɪkˈspleɪn/", "Le son /eɪ/ s'écrit ai."),
  entry(3, "famous", "célèbre", "Sherlock Holmes is a ____ detective.", "/ˈfeɪməs/", "Le e de fame disparaît devant -ous."),
  entry(3, "February", "février", "My cousin was born in ____.", "/ˈfɛbruˌɛri/", "Majuscule obligatoire pour les mois ; n'oublie pas le r juste après le b."),
  entry(3, "knowledge", "connaissance", "Reading builds your vocabulary and ____.", "/ˈnɑlɪdʒ/", "Un k muet au début, un w muet, et un d avant le g."),
  entry(3, "library", "bibliothèque", "Stay quiet inside the school ____.", "/ˈlaɪˌbrɛri/", "Deux r : un dans chaque moitié du mot. Faux ami : ce n'est pas une librairie."),
  entry(3, "medicine", "médicament", "Take your ____ with a glass of water.", "/ˈmɛdəsən/", "Fin en -ine (et non -in)."),
  entry(3, "necessary", "nécessaire", "A helmet is ____ when cycling.", "/ˈnɛsəˌsɛri/", "Astuce : un col (1 c), deux manches (2 s)."),
  entry(3, "opinion", "avis", "Everyone gave an honest ____ in class.", "/əˈpɪnjən/", "Trois syllabes : un seul p, deux n."),
  entry(3, "possible", "possible", "Everything is ____ with steady effort.", "/ˈpɑsəbəl/", "Double s ; fin en -ible."),
  entry(3, "promise", "promettre", "I ____ to return the book tomorrow.", "/ˈprɑmɪs/", "Un seul m et un seul s ; e muet final."),
  entry(3, "receive", "recevoir", "Did you ____ my invitation?", "/rɪˈsiːv/", "Après c, e avant i ; e muet final."),
  entry(3, "scissors", "ciseaux", "Use ____ to cut out the clues.", "/ˈsɪzɚz/", "Le son /s/ du début s'écrit sc ; double s au milieu."),
  entry(3, "separate", "séparé(e)s, distinct(e)s", "Please keep the two lists ____.", "/ˈsɛprət/", "Astuce anglaise : il y a « a rat » dans le mot."),
  entry(3, "straight", "tout droit", "Walk ____ ahead past the station.", "/streɪt/", "Le son /eɪ/ s'écrit aigh."),
  entry(3, "through", "à travers", "We walked ____ Hyde Park after class.", "/θruː/", "Le son /uː/ s'écrit ou, suivi d'un gh muet."),

  // Niveau 4 (B1)
  entry(4, "achieve", "atteindre, réussir", "Work step by step to ____ your goal.", "/əˈtʃiːv/", "i avant e après ch, et un e muet à la fin."),
  entry(4, "appearance", "apparence", "Don't judge people by their ____.", "/əˈpɪrəns/", "Double p. Le groupe -ear- précède la terminaison -ance."),
  entry(4, "argument", "dispute, débat", "She presented a clear ____ in the debate.", "/ˈɑrɡjəmənt/", "Le e du verbe argue disparaît devant -ment."),
  entry(4, "available", "disponible", "Tickets are still ____ at the counter.", "/əˈveɪləbəl/", "Le son /eɪ/ s'écrit ai ; jamais de double l."),
  entry(4, "beginning", "début", "Check the ____ of the recording again.", "/bɪˈɡɪnɪŋ/", "Le n est doublé devant -ing."),
  entry(4, "business", "entreprise, affaires", "She runs a small local ____.", "/ˈbɪznəs/", "Un i muet après le u ; fin en -ness."),
  entry(4, "carefully", "soigneusement", "Listen ____ to the speaker's phone number.", "/ˈkɛrfəli/", "-ful prend un seul l, puis -ly : un double l au total."),
  entry(4, "challenge", "défi", "Are you ready for the final ____?", "/ˈtʃælɪndʒ/", "Double l ; fin en -enge."),
  entry(4, "colleague", "collègue", "My ____ sent the files before noon.", "/ˈkɑliːɡ/", "Double l ; le son /iː/ s'écrit ea ; fin en -gue."),
  entry(4, "comfortable", "confortable", "Sit down and make yourself ____.", "/ˈkʌmftəbəl/", "m devant f (et non n) ; fin en -able."),
  entry(4, "definitely", "certainement", "We'll ____ visit Oxford next spring.", "/ˈdɛfənətli/", "Aucun a : le mot « finite » est caché dedans."),
  entry(4, "embarrass", "gêner", "Don't let small mistakes ____ you.", "/ɪmˈbærəs/", "Double r et double s."),
  entry(4, "environment", "environnement", "Clean energy helps protect the ____.", "/ɪnˈvaɪrənmənt/", "Un n avant -ment ; un seul n au milieu."),
  entry(4, "experience", "expérience", "Volunteering gave her valuable ____.", "/ɪkˈspɪriəns/", "Pas d'accent ; fin en -ence."),
  entry(4, "government", "gouvernement", "The ____ announced a new rail plan.", "/ˈɡʌvɚnmənt/", "Pas de u après le premier o ; garde le n avant -ment."),
  entry(4, "immediate", "immédiat", "The alert asked for an ____ reply.", "/ɪˈmiːdiət/", "Double m, un seul d, fin en -ate."),
  entry(4, "independent", "indépendant", "She became financially ____ after university.", "/ˌɪndɪˈpɛndənt/", "Aucun a : la fin s'écrit -ent."),
  entry(4, "journalist", "journaliste", "The ____ interviewed three witnesses.", "/ˈdʒɝnəlɪst/", "Pas de e final en anglais."),
  entry(4, "opportunity", "occasion", "Don't miss this ____ to practise.", "/ˌɑpɚˈtuːnəti/", "Double p au début, un seul t au milieu."),
  entry(4, "particular", "particulier", "Is there any ____ reason for the delay?", "/pɚˈtɪkjəlɚ/", "Fin en -ar (et non -er)."),
  entry(4, "persuade", "persuader", "Sam tried to ____ Maya to wait.", "/pɚˈsweɪd/", "Le son /sw/ s'écrit su ; e muet final."),
  entry(4, "privilege", "privilège", "It was a ____ to meet the author.", "/ˈprɪvəlɪdʒ/", "Deux i puis deux e, sans d ni accent."),
  entry(4, "pronounce", "prononcer", "How do you ____ this word?", "/prəˈnaʊns/", "Le son /aʊ/ s'écrit ou ; e muet final."),
  entry(4, "recommend", "recommander", "Which London museum would you ____?", "/ˌrɛkəˈmɛnd/", "Un seul c, mais un double m."),
  entry(4, "reference", "référence", "Keep this grammar sheet for future ____.", "/ˈrɛfrəns/", "Un seul f et un seul r au milieu ; fin en -ence."),
  entry(4, "responsible", "responsable", "Every pilot is ____ for safety.", "/rɪˈspɑnsəbəl/", "Fin en -ible en anglais (et non -able)."),
  entry(4, "restaurant", "restaurant", "We booked a table at an Italian ____.", "/ˈrɛstrɑnt/", "Repère le groupe -au- juste avant le deuxième r, puis la terminaison -ant."),
  entry(4, "schedule", "horaires", "Check your train ____ before Monday.", "/ˈskɛdʒuːl/", "Dans la voix américaine, le mot commence par /sk/, écrit sch. Il se termine par -ule."),
  entry(4, "significant", "important, notable", "There was a ____ drop in errors.", "/sɪɡˈnɪfɪkənt/", "Un seul n au milieu ; fin en -ant."),
  entry(4, "successful", "réussi", "Their rescue mission was completely ____.", "/səkˈsɛsfəl/", "Double c, double s, et un seul l à la fin."),

  // Niveau 5 (B1+)
  entry(5, "accommodate", "héberger, accueillir", "This youth hostel can ____ sixty students.", "/əˈkɑməˌdeɪt/", "Double c et double m."),
  entry(5, "acknowledgement", "accusé de réception", "We received an ____ of our application.", "/əkˈnɑlɪdʒmənt/", "Un k muet après le a du début ; fin en -ment.", ["acknowledgment"]),
  entry(5, "atmosphere", "atmosphère", "The hall had a warm, friendly ____.", "/ˈætməsˌfɪr/", "Le son /f/ s'écrit ph."),
  entry(5, "conscience", "conscience", "He had a guilty ____ after hiding the note.", "/ˈkɑnʃəns/", "Le son /ʃ/ s'écrit sc."),
  entry(5, "convenient", "pratique", "Tuesday afternoon is very ____ for me.", "/kənˈviːniənt/", "Fin en -ient (et non -iant)."),
  entry(5, "disappoint", "décevoir", "Heavy rain didn't ____ the hikers.", "/ˌdɪsəˈpɔɪnt/", "Un seul s, mais un double p."),
  entry(5, "enthusiastic", "enthousiaste", "The class was ____ about the game.", "/ɪnˌθuːziˈæstɪk/", "Le groupe thu se prononce /θuː/ dans cette voix américaine."),
  entry(5, "existence", "existence", "Scientists debated the ____ of the island.", "/ɪɡˈzɪstəns/", "Aucun a : trois e."),
  entry(5, "extraordinary", "extraordinaire", "Maya showed ____ courage during the storm.", "/ɪkˈstrɔrdəˌnɛri/", "Fin en -ary (et non -aire)."),
  entry(5, "fascinating", "fascinant", "The museum guide told a ____ story.", "/ˈfæsəˌneɪtɪŋ/", "sc au milieu, comme en français."),
  entry(5, "fluorescent", "fluorescent", "The classroom has bright ____ lights.", "/flʊˈrɛsənt/", "La première syllabe s’écrit fluo-, puis on retrouve -rescent."),
  entry(5, "guaranteed", "garanti", "Every repaired device is ____ for two years.", "/ˌɡærənˈtiːd/", "Un u muet après le g ; double e avant le d."),
  entry(5, "harassment", "harcèlement", "The school strictly bans any form of ____.", "/həˈræsmənt/", "Un seul r, mais un double s."),
  entry(5, "indispensable", "indispensable", "A clear map is ____ on a mountain trek.", "/ˌɪndɪˈspɛnsəbəl/", "Fin en -able."),
  entry(5, "maintenance", "entretien", "The line is closed for track ____.", "/ˈmeɪntənəns/", "Un e au milieu (et non ai comme dans le verbe maintain)."),
  entry(5, "millennium", "millénaire", "People celebrated the new ____ in 2000.", "/mɪˈlɛniəm/", "Double l et double n."),
  entry(5, "mischievous", "espiègle", "The ____ puppy hid Sam's running shoes.", "/ˈmɪstʃɪvəs/", "Pas de i avant -ous : la fin s'écrit -vous."),
  entry(5, "noticeable", "visible, perceptible", "There was a ____ improvement in his accent.", "/ˈnoʊtɪsəbəl/", "Le verbe notice garde son e devant -able."),
  entry(5, "occurrence", "fait, événement", "Snow in June is a rare ____ in London.", "/əˈkɝəns/", "Double c et double r ; fin en -ence."),
  entry(5, "parliament", "parlement", "Big Ben stands beside the Houses of ____.", "/ˈpɑrləmənt/", "Un i muet se cache après parl-."),
  entry(5, "perseverance", "persévérance", "With ____, even hard puzzles get easier.", "/ˌpɝsəˈvɪrəns/", "Pas d'accent ; fin en -ance."),
  entry(5, "phenomenon", "phénomène", "The northern lights are a natural ____.", "/fəˈnɑmənɑn/", "Le son /f/ s'écrit ph ; fin en -on au singulier."),
  entry(5, "possession", "possession", "This old watch is my most precious ____.", "/pəˈzɛʃən/", "Quatre s en tout."),
  entry(5, "questionnaire", "questionnaire", "Please fill out this short ____.", "/ˌkwɛstʃəˈnɛr/", "Double n avant -aire."),
  entry(5, "rhythm", "rythme", "Listen to the natural ____ of the sentence.", "/ˈrɪðəm/", "Le y est la seule voyelle ; il y a deux h."),
  entry(5, "sacrifice", "sacrifice", "Great heroes sometimes make a big ____.", "/ˈsækrəˌfaɪs/", "Le son /aɪ/ de la fin s'écrit i…e."),
  entry(5, "receipt", "reçu, ticket de caisse", "Keep the ____ in case you need to return the shoes.", "/rɪˈsiːt/", "Un p muet avant le t ; e avant i après c."),
  entry(5, "temperature", "température", "The ____ dropped below freezing last night.", "/ˈtɛmprətʃɚ/", "Pas d'accent ; le a du milieu ne s'entend presque pas."),
  entry(5, "unbelievable", "incroyable", "Finishing ten levels in one week is ____!", "/ˌʌnbɪˈliːvəbəl/", "i avant e ; le e de believe disparaît devant -able."),
  entry(5, "vacuum", "aspirateur, vide", "Sound cannot travel through a total ____.", "/ˈvækjuːm/", "Un seul c, mais un double u."),
];

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Le sens en français n'est affiché que s'il ne donne pas la réponse :
 * caché quand il contient le mot anglais (accents mis à part), par exemple
 * « orange », « éducation » ou « restaurant ».
 */
export function shouldShowSpellMeaning(target: SpellEntry): boolean {
  const meaning = stripAccents(target.french);
  const word = stripAccents(target.word);
  return !meaning.split(/[^a-z]+/).includes(word) && !meaning.includes(word);
}

export function normalizeSpellInput(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[‘’ʼ`´]/g, "'")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export type SpellAnswerIssue = "ok" | "capital" | "wrong";

/**
 * Juste, faux, ou juste à la majuscule près (jours, mois : Monday, February).
 * La majuscule manquante compte comme une erreur, mais le retour la nomme.
 */
export function spellAnswerIssue(target: SpellEntry, rawInput: string): SpellAnswerIssue {
  const given = normalizeSpellInput(rawInput);
  if (!given) return "wrong";
  const accepted = [target.word, ...(target.accept ?? [])];
  const match = accepted.find((candidate) => normalizeSpellInput(candidate) === given);
  if (!match) return "wrong";
  const needsCapital = /^[A-Z]/.test(target.word);
  if (needsCapital && !/^[A-Z]/.test(rawInput.trim())) return "capital";
  return "ok";
}

export function isSpellAnswerCorrect(target: SpellEntry, rawInput: string): boolean {
  return spellAnswerIssue(target, rawInput) === "ok";
}

/**
 * Compare la réponse au mot lettre par lettre en alignant les deux (distance
 * d'édition) : une lettre oubliée ou en trop ne décale plus toute la fin.
 * Statuts : match (juste), wrong (remplacée), missing (oubliée), extra (en trop).
 */
export function buildSpellingDiff(expectedWord: string, rawInput: string): SpellDiffCell[] {
  const expected = expectedWord.toLowerCase();
  const given = normalizeSpellInput(rawInput);
  const n = expected.length;
  const m = given.length;
  const cost: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const same = expected[i - 1] === given[j - 1] ? 0 : 1;
      cost[i][j] = Math.min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + same);
    }
  }
  const cells: SpellDiffCell[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + (expected[i - 1] === given[j - 1] ? 0 : 1)) {
      const same = expected[i - 1] === given[j - 1];
      cells.push({ expected: expected[i - 1], given: given[j - 1], status: same ? "match" : "wrong" });
      i -= 1;
      j -= 1;
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      cells.push({ expected: expected[i - 1], given: "", status: "missing" });
      i -= 1;
    } else {
      cells.push({ expected: "", given: given[j - 1], status: "extra" });
      j -= 1;
    }
  }
  return cells.reverse();
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
