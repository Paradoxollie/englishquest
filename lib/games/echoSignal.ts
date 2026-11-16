/**
 * Echo Signal - Moteur pur (compréhension orale en anglais).
 *
 * Chaque partie enchaîne 4 transmissions audio anglaises (8 questions au total),
 * sélectionnées au niveau CECRL du joueur (70 % à son niveau, 30 % au niveau inférieur).
 * Chaque situation est prête pour un MP3 dédié (/audio/echo-signal/<id>.mp3)
 * et bascule sinon automatiquement sur un enchaînement vocal multi-voix.
 */

import type { DialogueAudioLine } from "./audio";
import { pickByLevel, type GameLevel } from "./levels";
import type { Difficulty } from "@/lib/profile/leveling";

export type EchoDifficulty = 1 | 2 | 3;

export const ECHO_SIGNAL_CLIPS_PER_RUN = 4;
export const ECHO_SIGNAL_QUESTIONS_PER_CLIP = 2;
export const ECHO_SIGNAL_TOTAL_QUESTIONS = ECHO_SIGNAL_CLIPS_PER_RUN * ECHO_SIGNAL_QUESTIONS_PER_CLIP;

export type EchoQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type EchoScenario = {
  id: string;
  level: GameLevel;
  category: string;
  title: string;
  context: string;
  lines: DialogueAudioLine[];
  questions: [EchoQuestion, EchoQuestion];
};

const DIFFICULTY_CONFIG: Record<
  EchoDifficulty,
  {
    label: string;
    subtitle: string;
    dbDifficulty: Difficulty;
    maxPlays: number;
    allowSlowSpeed: boolean;
    basePoints: number;
    streakStep: number;
    maxStreakSteps: number;
    firstListenBonus: number;
  }
> = {
  1: {
    label: "Facile",
    subtitle: "3 écoutes · option vitesse lente 0,85x",
    dbDifficulty: "easy",
    maxPlays: 3,
    allowSlowSpeed: true,
    basePoints: 100,
    streakStep: 20,
    maxStreakSteps: 4,
    firstListenBonus: 20,
  },
  2: {
    label: "Moyen",
    subtitle: "2 écoutes · bonus si compris dès la 1re écoute",
    dbDifficulty: "medium",
    maxPlays: 2,
    allowSlowSpeed: false,
    basePoints: 130,
    streakStep: 25,
    maxStreakSteps: 4,
    firstListenBonus: 30,
  },
  3: {
    label: "Difficile",
    subtitle: "1 écoute pour le bonus · 1 secours max",
    dbDifficulty: "hard",
    maxPlays: 2,
    allowSlowSpeed: false,
    basePoints: 170,
    streakStep: 30,
    maxStreakSteps: 4,
    firstListenBonus: 40,
  },
};

export function getEchoDifficultyConfig(difficulty: EchoDifficulty) {
  return DIFFICULTY_CONFIG[difficulty];
}

export function echoDifficultyToDb(difficulty: EchoDifficulty): Difficulty {
  return DIFFICULTY_CONFIG[difficulty].dbDifficulty;
}

/**
 * 40 situations audio progressives (8 par niveau CECRL de 1 = A1 à 5 = B1+).
 */
export const ECHO_SIGNAL_SCENARIOS: readonly EchoScenario[] = [
  // ===================== NIVEAU 1 (A1) =====================
  {
    id: "l1-kings-cross-train",
    level: 1,
    category: "Gare & horaires",
    title: "Départ pour Brighton",
    context: "Annonce officielle en gare de Londres.",
    lines: [
      {
        speaker: "Annonce",
        voiceProfile: "female_uk",
        text: "Attention please. The ten fifteen train to Brighton will leave from platform four, not platform two.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "À quelle heure part le train pour Brighton ?",
        options: ["10 h 15", "10 h 50", "11 h 15", "4 h 10"],
        correctIndex: 0,
        explanation: "« The ten fifteen train » signifie le train de 10 h 15.",
      },
      {
        id: "q2",
        prompt: "De quel quai part-il finalement ?",
        options: ["Quai 1", "Quai 2", "Quai 4", "Quai 5"],
        correctIndex: 2,
        explanation: "L'annonce précise : « platform four, not platform two » (quai 4, pas quai 2).",
      },
    ],
  },
  {
    id: "l1-cafe-order",
    level: 1,
    category: "Café & prix",
    title: "Pause au café",
    context: "Sam commande à manger et à boire au comptoir.",
    lines: [
      { speaker: "Sam", voiceProfile: "male_uk", text: "Hello! Can I have one cheese sandwich and a small orange juice, please?" },
      { speaker: "Vendeuse", voiceProfile: "female_uk", text: "Sure. That is six pounds fifty altogether. Take a seat by the window." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qu'est-ce que Sam commande à boire ?",
        options: ["Un thé chaud", "Un petit jus d'orange", "Une grande bouteille d'eau", "Un chocolat chaud"],
        correctIndex: 1,
        explanation: "Sam demande « a small orange juice » (un petit jus d'orange).",
      },
      {
        id: "q2",
        prompt: "Combien doit-il payer au total ?",
        options: ["5,50 £", "6,15 £", "6,50 £", "7,50 £"],
        correctIndex: 2,
        explanation: "La vendeuse répond : « six pounds fifty altogether » (6,50 £ au total).",
      },
    ],
  },
  {
    id: "l1-maya-homework-call",
    level: 1,
    category: "Téléphone & RDV",
    title: "Message de Maya",
    context: "Maya laisse un message vocal à Sam après les cours.",
    lines: [
      {
        speaker: "Maya",
        voiceProfile: "female_uk",
        text: "Hi Sam, it is Maya. Let us meet at the library on Tuesday at four o'clock. Do not forget your red notebook!",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Où et quand doivent-ils se retrouver ?",
        options: ["Au parc mardi à 14 h", "À la bibliothèque mardi à 16 h", "Au collège jeudi à 16 h", "À la bibliothèque vendredi à 15 h"],
        correctIndex: 1,
        explanation: "« at the library on Tuesday at four o'clock » = à la bibliothèque mardi à 16 h.",
      },
      {
        id: "q2",
        prompt: "Quel objet Sam ne doit-il pas oublier ?",
        options: ["Son dictionnaire vert", "Ses lunettes", "Son cahier rouge", "Son parapluie bleu"],
        correctIndex: 2,
        explanation: "Maya lui rappelle : « Do not forget your red notebook! »",
      },
    ],
  },
  {
    id: "l1-school-club",
    level: 1,
    category: "Collège & club",
    title: "Club d'échecs",
    context: "Un professeur présente le nouveau club de l'école.",
    lines: [
      {
        speaker: "Professeur",
        voiceProfile: "male_uk",
        text: "Welcome to the chess club! We meet in room twelve every Wednesday after school. Beginners are always welcome.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Dans quelle salle se réunit le club ?",
        options: ["Salle 2", "Salle 10", "Salle 12", "Salle 20"],
        correctIndex: 2,
        explanation: "« in room twelve » signifie dans la salle 12.",
      },
      {
        id: "q2",
        prompt: "Quel jour a lieu le club ?",
        options: ["Tous les lundis", "Tous les mercredis", "Tous les jeudis", "Tous les samedis"],
        correctIndex: 1,
        explanation: "« every Wednesday after school » = chaque mercredi après l'école.",
      },
    ],
  },
  {
    id: "l1-museum-ticket",
    level: 1,
    category: "Musée & visites",
    title: "Entrée au musée",
    context: "Un visiteur demande les horaires et le tarif à l'accueil.",
    lines: [
      { speaker: "Sam", voiceProfile: "male_uk", text: "Excuse me, what time does the museum close today?" },
      { speaker: "Guide", voiceProfile: "female_uk", text: "We close at six p.m. And tickets for students are free today!" },
    ],
    questions: [
      {
        id: "q1",
        prompt: "À quelle heure ferme le musée aujourd'hui ?",
        options: ["16 h", "17 h", "18 h", "19 h"],
        correctIndex: 2,
        explanation: "« We close at six p.m. » correspond à 18 h.",
      },
      {
        id: "q2",
        prompt: "Combien coûte le billet pour les élèves aujourd'hui ?",
        options: ["C'est gratuit", "3 livres", "6 livres", "10 livres"],
        correctIndex: 0,
        explanation: "La guide indique : « tickets for students are free today » (gratuit).",
      },
    ],
  },
  {
    id: "l1-weekend-weather",
    level: 1,
    category: "Météo",
    title: "Bulletin météo du samedi",
    context: "Court bulletin radio du matin.",
    lines: [
      {
        speaker: "Météo",
        voiceProfile: "female_us",
        text: "Good morning! Today in York, it will be sunny and warm this morning, with light rain later tonight.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quel temps fait-il ce matin à York ?",
        options: ["Orageux et froid", "Neigeux", "Ensoleillé et doux", "Brouillard épais"],
        correctIndex: 2,
        explanation: "« sunny and warm this morning » = ensoleillé et doux ce matin.",
      },
      {
        id: "q2",
        prompt: "Qu'annonce-t-on pour ce soir ?",
        options: ["Un ciel étoilé", "Une pluie légère", "Du vent violent", "Une canicule"],
        correctIndex: 1,
        explanation: "« with light rain later tonight » = une pluie légère plus tard ce soir.",
      },
    ],
  },
  {
    id: "l1-lost-bag",
    level: 1,
    category: "Objet trouvé",
    title: "Sac oublié dans le bus",
    context: "Sam décrit son sac au bureau des objets trouvés.",
    lines: [
      { speaker: "Agent", voiceProfile: "male_uk", text: "What does your school bag look like?" },
      { speaker: "Sam", voiceProfile: "male_us", text: "It is dark blue with a yellow star on the front pocket. My keys are inside." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "De quelle couleur est le sac de Sam ?",
        options: ["Noir avec une bande blanche", "Bleu foncé avec une étoile jaune", "Rouge avec une poche grise", "Vert avec une étoile bleue"],
        correctIndex: 1,
        explanation: "Sam précise : « dark blue with a yellow star ».",
      },
      {
        id: "q2",
        prompt: "Que contient ce sac ?",
        options: ["Son appareil photo", "Ses clés", "Son repas", "Son manteau"],
        correctIndex: 1,
        explanation: "« My keys are inside » = mes clés sont à l'intérieur.",
      },
    ],
  },
  {
    id: "l1-directions-park",
    level: 1,
    category: "Orientation",
    title: "Trouver la librairie",
    context: "Maya demande son chemin dans la rue.",
    lines: [
      { speaker: "Maya", voiceProfile: "female_uk", text: "Excuse me, how do I get to the bookshop?" },
      { speaker: "Passant", voiceProfile: "male_uk", text: "Go straight ahead for two minutes, then turn left opposite the post office." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Que cherche Maya ?",
        options: ["La poste", "La librairie", "La gare", "La pharmacie"],
        correctIndex: 1,
        explanation: "« how do I get to the bookshop? » = comment aller à la librairie ?",
      },
      {
        id: "q2",
        prompt: "Quel trajet doit-elle suivre ?",
        options: ["Tout droit puis à gauche en face de la poste", "Tout droit puis à droite devant le parc", "Demi-tour après le pont", "Prendre le premier bus à droite"],
        correctIndex: 0,
        explanation: "« Go straight ahead... then turn left opposite the post office. »",
      },
    ],
  },

  // ===================== NIVEAU 2 (A2) =====================
  {
    id: "l2-cinema-booking",
    level: 2,
    category: "Sortie cinéma",
    title: "Réserver deux places",
    context: "Dialogue au guichet du cinéma.",
    lines: [
      { speaker: "Maya", voiceProfile: "female_uk", text: "Hi! Are there any seats left for the seven thirty film?" },
      { speaker: "Guichet", voiceProfile: "male_uk", text: "Only two seats in row C, near the front. Or you can wait for the nine o'clock show." },
      { speaker: "Maya", voiceProfile: "female_uk", text: "We will take row C, please. Nine o'clock is too late for us." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quelle séance Maya choisit-elle finalement ?",
        options: ["Celle de 19 h 30", "Celle de 20 h 30", "Celle de 21 h", "Aucune séance ce soir"],
        correctIndex: 0,
        explanation: "Elle préfère « row C » pour 19 h 30 (« seven thirty ») car 21 h est trop tard.",
      },
      {
        id: "q2",
        prompt: "Où se trouvent les deux places restantes ?",
        options: ["Tout au fond de la salle", "Au rang C, près de l'écran", "Au balcon", "Séparées de trois rangs"],
        correctIndex: 1,
        explanation: "Le guichet indique : « two seats in row C, near the front ».",
      },
    ],
  },
  {
    id: "l2-school-trip",
    level: 2,
    category: "Collège & sorties",
    title: "Excursion à Oxford",
    context: "Consigne matinale de l'enseignant avant le départ du car.",
    lines: [
      {
        speaker: "Professeur",
        voiceProfile: "female_uk",
        text: "Please listen carefully. Our coach leaves at eight forty-five sharp. Bring a packed lunch, because the museum café is closed for repairs this week.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "À quelle heure précise part le car ?",
        options: ["8 h 15", "8 h 30", "8 h 45", "9 h 15"],
        correctIndex: 2,
        explanation: "« eight forty-five sharp » signifie à 8 h 45 précises.",
      },
      {
        id: "q2",
        prompt: "Pourquoi faut-il apporter un pique-nique ?",
        options: ["Il n'y a pas de pause déjeuner", "Le café du musée est fermé pour travaux", "Les prix du musée sont trop élevés", "Le trajet dure toute la journée"],
        correctIndex: 1,
        explanation: "« the museum café is closed for repairs this week ».",
      },
    ],
  },
  {
    id: "l2-airport-gate",
    level: 2,
    category: "Voyage",
    title: "Changement de porte",
    context: "Annonce dans le terminal d'un aéroport.",
    lines: [
      {
        speaker: "Annonce",
        voiceProfile: "female_us",
        text: "Passengers on flight B A four two six to Edinburgh: boarding is delayed by twenty minutes. Please proceed to gate eighteen.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quelle est la situation du vol pour Édimbourg ?",
        options: ["Il est annulé", "Il embarque avec 20 minutes de retard", "Il part 20 minutes plus tôt", "Il est déjà complet"],
        correctIndex: 1,
        explanation: "« boarding is delayed by twenty minutes » = l'embarquement a 20 minutes de retard.",
      },
      {
        id: "q2",
        prompt: "Vers quelle porte doivent se diriger les passagers ?",
        options: ["Porte 8", "Porte 14", "Porte 18", "Porte 26"],
        correctIndex: 2,
        explanation: "« proceed to gate eighteen » = rendez-vous porte 18.",
      },
    ],
  },
  {
    id: "l2-cooking-recipe",
    level: 2,
    category: "Vie quotidienne",
    title: "Recette de pancakes",
    context: "Sam explique à Maya comment préparer la pâte.",
    lines: [
      { speaker: "Maya", voiceProfile: "female_uk", text: "Should I put the sugar in before the milk?" },
      { speaker: "Sam", voiceProfile: "male_uk", text: "No, mix the flour and eggs first, then slowly pour in the milk while stirring." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Que faut-il mélanger en tout premier ?",
        options: ["Le lait et le sucre", "La farine et les œufs", "Le beurre et le sel", "La farine et le lait"],
        correctIndex: 1,
        explanation: "Sam dit : « mix the flour and eggs first » (d'abord la farine et les œufs).",
      },
      {
        id: "q2",
        prompt: "Comment faut-il ajouter le lait ?",
        options: ["D'un seul coup en arrêtant de remuer", "Tout doucement tout en remuant", "Après la cuisson", "Froid avec du chocolat"],
        correctIndex: 1,
        explanation: "« slowly pour in the milk while stirring » = verser lentement tout en mélangeant.",
      },
    ],
  },
  {
    id: "l2-dentist-reschedule",
    level: 2,
    category: "Téléphone & RDV",
    title: "Décaler un rendez-vous",
    context: "Message du cabinet médical sur répondeur.",
    lines: [
      {
        speaker: "Secrétaire",
        voiceProfile: "female_uk",
        text: "Hello, this is Green Street Clinic. Doctor Patel has an urgent meeting on Thursday morning, so could we move your appointment to Friday at eleven fifteen?",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Pourquoi le rendez-vous de jeudi matin est-il déplacé ?",
        options: ["La clinique est fermée jeudi", "Le docteur a une réunion urgente", "Le patient a annulé", "Il y a une panne d'électricité"],
        correctIndex: 1,
        explanation: "« Doctor Patel has an urgent meeting on Thursday morning ».",
      },
      {
        id: "q2",
        prompt: "Quel nouveau créneau est proposé ?",
        options: ["Jeudi à 15 h", "Vendredi à 11 h 15", "Vendredi à 15 h 11", "Samedi matin"],
        correctIndex: 1,
        explanation: "« Friday at eleven fifteen » = vendredi à 11 h 15.",
      },
    ],
  },
  {
    id: "l2-sport-rain",
    level: 2,
    category: "Sport & loisirs",
    title: "Entraînement déplacé",
    context: "L'entraîneur prévient son équipe avant le match.",
    lines: [
      {
        speaker: "Coach",
        voiceProfile: "male_us",
        text: "Because the outdoor pitch is completely flooded, today's basketball practice is moved to the main sports hall. Wear clean indoor trainers!",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Pourquoi ne jouent-ils pas dehors ?",
        options: ["Il fait trop chaud", "Le terrain extérieur est inondé", "Le gymnase est en travaux", "Il n'y a pas d'éclairage"],
        correctIndex: 1,
        explanation: "« the outdoor pitch is completely flooded » = le terrain extérieur est complètement inondé.",
      },
      {
        id: "q2",
        prompt: "Quelle consigne l'entraîneur donne-t-il sur la tenue ?",
        options: ["Apporter un maillot rouge", "Porter des baskets d'intérieur propres", "Mettre des crampons", "Venir avec une serviette bleue"],
        correctIndex: 1,
        explanation: "« Wear clean indoor trainers » = portez des baskets d'intérieur propres.",
      },
    ],
  },
  {
    id: "l2-shoe-shop",
    level: 2,
    category: "Magasin",
    title: "Échanger une taille",
    context: "Conversation dans une boutique de vêtements.",
    lines: [
      { speaker: "Client", voiceProfile: "male_uk", text: "I bought this jacket yesterday, but the sleeves are a bit too short. Do you have a medium?" },
      { speaker: "Vendeur", voiceProfile: "female_uk", text: "Let me check. Yes, we have one medium left in navy blue, though black is sold out." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quel problème le client a-t-il avec sa veste ?",
        options: ["La fermeture est cassée", "Les manches sont trop courtes", "La couleur ne lui plaît pas", "Elle est trop grande"],
        correctIndex: 1,
        explanation: "« the sleeves are a bit too short » = les manches sont un peu trop courtes.",
      },
      {
        id: "q2",
        prompt: "Quelle taille M reste-t-il en rayon ?",
        options: ["En noir uniquement", "En bleu marine uniquement", "Dans les deux couleurs", "Aucune taille M en stock"],
        correctIndex: 1,
        explanation: "Le vendeur explique que la taille M reste en bleu marine (« navy blue »), mais que le noir est épuisé.",
      },
    ],
  },
  {
    id: "l2-radio-festival",
    level: 2,
    category: "Annonce radio",
    title: "Marché d'automne",
    context: "Spot radio local du week-end.",
    lines: [
      {
        speaker: "Animateur",
        voiceProfile: "male_uk",
        text: "Come down to Market Square this Sunday between ten and four! Expect local food stalls, live jazz music, and free face painting for children.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quand se tient l'événement sur Market Square ?",
        options: ["Samedi toute la journée", "Dimanche de 10 h à 16 h", "Dimanche soir à partir de 16 h", "Tout le week-end"],
        correctIndex: 1,
        explanation: "« this Sunday between ten and four » = ce dimanche entre 10 h et 16 h.",
      },
      {
        id: "q2",
        prompt: "Quelle animation est annoncée comme gratuite ?",
        options: ["Les stands de nourriture", "La location de vélos", "Le maquillage pour enfants", "Les billets de concert"],
        correctIndex: 2,
        explanation: "« free face painting for children » = maquillage gratuit pour les enfants.",
      },
    ],
  },

  // ===================== NIVEAU 3 (A2+) =====================
  {
    id: "l3-tube-maintenance",
    level: 3,
    category: "Transports Londres",
    title: "Incident sur la ligne centrale",
    context: "Information voyageurs dans le métro londonien.",
    lines: [
      {
        speaker: "Station",
        voiceProfile: "female_uk",
        text: "Service update: there is no Central Line service between Liverpool Street and Holborn due to signal maintenance. Please use the Circle Line or local bus twenty-five.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Pourquoi la ligne est-elle interrompue entre ces deux stations ?",
        options: ["Grève des conducteurs", "Maintenance des signaux", "Manifestation en surface", "Conditions météo"],
        correctIndex: 1,
        explanation: "« due to signal maintenance » = en raison d'une maintenance de signalisation.",
      },
      {
        id: "q2",
        prompt: "Quelle alternative est recommandée ?",
        options: ["Attendre 45 minutes sur le quai", "La Circle Line ou le bus 25", "Prendre un taxi officiel", "Marcher jusqu'à Victoria Station"],
        correctIndex: 1,
        explanation: "« Please use the Circle Line or local bus twenty-five. »",
      },
    ],
  },
  {
    id: "l3-library-deadline",
    level: 3,
    category: "Collège & règles",
    title: "Règlement du concours d'écriture",
    context: "Maya résume les conditions à Sam.",
    lines: [
      { speaker: "Sam", voiceProfile: "male_uk", text: "How long can our short story be for the school contest?" },
      { speaker: "Maya", voiceProfile: "female_uk", text: "Between five hundred and eight hundred words. And we must email it as a PDF before Friday midnight, not hand it in on paper." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quelle longueur doit faire la nouvelle ?",
        options: ["Moins de 300 mots", "Entre 500 et 800 mots", "Exactement 1 000 mots", "Aucune limite"],
        correctIndex: 1,
        explanation: "« Between five hundred and eight hundred words. »",
      },
      {
        id: "q2",
        prompt: "Comment faut-il rendre le texte ?",
        options: ["Imprimé sur papier au secrétariat", "Par e-mail en PDF avant vendredi minuit", "Enregistrement audio sur clé USB", "Sur papier lundi matin"],
        correctIndex: 1,
        explanation: "Maya précise : « email it as a PDF before Friday midnight, not hand it in on paper ».",
      },
    ],
  },
  {
    id: "l3-lost-parcel",
    level: 3,
    category: "Téléphone & suivi",
    title: "Livraison manquée",
    context: "Appel au service de livraison pour un colis.",
    lines: [
      {
        speaker: "Livreur",
        voiceProfile: "male_us",
        text: "Hello, I tried delivering your parcel at two p.m., but nobody answered. I left it safely with your next-door neighbour at number forty-two, not behind the bins.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Où se trouve finalement le colis ?",
        options: ["Derrière les poubelles", "Au dépôt postal du quartier", "Chez le voisin du numéro 42", "Dans la boîte aux lettres"],
        correctIndex: 2,
        explanation: "« with your next-door neighbour at number forty-two, not behind the bins ».",
      },
      {
        id: "q2",
        prompt: "À quelle heure le livreur est-il passé ?",
        options: ["À midi", "À 14 h", "À 16 h", "À 18 h"],
        correctIndex: 1,
        explanation: "« at two p.m. » = à 14 h.",
      },
    ],
  },
  {
    id: "l3-hotel-booking",
    level: 3,
    category: "Hôtel & voyage",
    title: "Réservation d'auberge",
    context: "Accueil téléphonique d'une auberge de jeunesse.",
    lines: [
      { speaker: "Voyageur", voiceProfile: "male_uk", text: "Does our room rate include breakfast and luggage storage after check-out?" },
      { speaker: "Réception", voiceProfile: "female_uk", text: "Luggage storage is completely free after check-out, though breakfast costs an extra seven pounds per person." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qu'est-ce qui est inclus sans frais supplémentaires ?",
        options: ["Le petit-déjeuner complet", "La consigne à bagages après le départ", "Les deux services", "Ni l'un ni l'autre"],
        correctIndex: 1,
        explanation: "La consigne est gratuite (« luggage storage is completely free »).",
      },
      {
        id: "q2",
        prompt: "Quel supplément coûte le petit-déjeuner ?",
        options: ["5 livres", "7 livres par personne", "10 livres par chambre", "Il est interdit en dehors du week-end"],
        correctIndex: 1,
        explanation: "« breakfast costs an extra seven pounds per person ».",
      },
    ],
  },
  {
    id: "l3-science-project",
    level: 3,
    category: "Travail d'équipe",
    title: "Partage des tâches",
    context: "Deux élèves organisent leur exposé de sciences.",
    lines: [
      { speaker: "Sam", voiceProfile: "male_uk", text: "I already drew the diagrams for solar power, so could you prepare the slides on wind turbines?" },
      { speaker: "Maya", voiceProfile: "female_uk", text: "Deal! I will finish them tonight and send you the link so we can rehearse tomorrow before lunch." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "De quelle partie Maya s'occupe-t-elle ?",
        options: ["Des schémas sur le solaire", "Des diapositives sur les éoliennes", "De l'impression des affiches", "De la conclusion orale uniquement"],
        correctIndex: 1,
        explanation: "Sam demande : « prepare the slides on wind turbines », et Maya accepte.",
      },
      {
        id: "q2",
        prompt: "Quand prévoient-ils de répéter ?",
        options: ["Ce soir à 20 h", "Demain avant le déjeuner", "Vendredi après les cours", "Juste avant d'entrer en classe"],
        correctIndex: 1,
        explanation: "« rehearse tomorrow before lunch » = répéter demain avant le déjeuner.",
      },
    ],
  },
  {
    id: "l3-pharmacy-advice",
    level: 3,
    category: "Santé & conseil",
    title: "Conseil à la pharmacie",
    context: "Un pharmacien explique comment utiliser des pastilles.",
    lines: [
      {
        speaker: "Pharmacien",
        voiceProfile: "female_uk",
        text: "Take one tablet after meals, up to three times a day, and drink plenty of water. Avoid driving if you feel sleepy.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "À quel moment faut-il prendre ce médicament ?",
        options: ["À jeun le matin uniquement", "Après les repas, jusqu'à 3 fois par jour", "Toutes les deux heures sans boire", "Juste avant de conduire"],
        correctIndex: 1,
        explanation: "« one tablet after meals, up to three times a day ».",
      },
      {
        id: "q2",
        prompt: "Quelle précaution le pharmacien mentionne-t-il ?",
        options: ["Ne pas sortir au soleil", "Éviter de conduire en cas de somnolence", "Ne pas manger de produits laitiers", "Conserver au congélateur"],
        correctIndex: 1,
        explanation: "« Avoid driving if you feel sleepy ».",
      },
    ],
  },
  {
    id: "l3-bike-repair",
    level: 3,
    category: "Réparation",
    title: "Devis pour un vélo",
    context: "Appel de l'atelier de réparation vélos.",
    lines: [
      {
        speaker: "Mécanicien",
        voiceProfile: "male_uk",
        text: "Hi Sam, your bike brakes are fixed, though the back tyre had a nail in it and needed replacing. Your bike will be ready for collection after three thirty.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qu'a-t-il fallu remplacer en plus des freins ?",
        options: ["La chaîne", "Le pneu arrière", "La selle", "La roue avant"],
        correctIndex: 1,
        explanation: "« the back tyre had a nail in it and needed replacing » = le pneu arrière avait un clou.",
      },
      {
        id: "q2",
        prompt: "À partir de quelle heure Sam peut-il récupérer son vélo ?",
        options: ["Dès maintenant", "Après 15 h 30", "Demain à 9 h", "Avant midi"],
        correctIndex: 1,
        explanation: "« ready for collection after three thirty » = prêt après 15 h 30.",
      },
    ],
  },
  {
    id: "l3-podcast-intro",
    level: 3,
    category: "Radio & culture",
    title: "Émission sur l'écologie",
    context: "Introduction d'un podcast étudiant.",
    lines: [
      {
        speaker: "Présentatrice",
        voiceProfile: "female_us",
        text: "Welcome back to Youth Voices! In today's episode, we visit a zero-waste canteen in Bristol that cut food waste by half in six months.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quel est le sujet de l'épisode du jour ?",
        options: ["Les pistes cyclables à Londres", "Une cantine zéro déchet à Bristol", "Le recyclage des manuels scolaires", "Un potager au sommet d'un immeuble"],
        correctIndex: 1,
        explanation: "« we visit a zero-waste canteen in Bristol ».",
      },
      {
        id: "q2",
        prompt: "Quel résultat cette cantine a-t-elle obtenu en six mois ?",
        options: ["Doubler le nombre de repas", "Réduire le gaspillage alimentaire de moitié", "Passer au tout bio sans hausse de prix", "Supprimer tous les emballages en verre"],
        correctIndex: 1,
        explanation: "« cut food waste by half in six months » = réduit le gaspillage de moitié.",
      },
    ],
  },

  // ===================== NIVEAU 4 (B1) =====================
  {
    id: "l4-interview-feedback",
    level: 4,
    category: "Stage & emploi",
    title: "Bilan après un entretien",
    context: "Maya discute de son entretien pour un job d'été.",
    lines: [
      { speaker: "Sam", voiceProfile: "male_uk", text: "How did your interview at the bookshop go?" },
      { speaker: "Maya", voiceProfile: "female_uk", text: "I was nervous at first, especially about working on Saturdays, yet they seemed impressed that I speak both French and English." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qu'est-ce qui inquiétait Maya au début de l'entretien ?",
        options: ["Le trajet en train", "Le fait de devoir travailler le samedi", "Le salaire proposé", "L'usage de la caisse enregistreuse"],
        correctIndex: 1,
        explanation: "« nervous at first, especially about working on Saturdays ».",
      },
      {
        id: "q2",
        prompt: "Quel point fort a particulièrement plu aux recruteurs ?",
        options: ["Son expérience de trois ans", "Le fait qu'elle parle français et anglais", "Sa disponibilité le dimanche", "Son permis de conduire"],
        correctIndex: 1,
        explanation: "« impressed that I speak both French and English ».",
      },
    ],
  },
  {
    id: "l4-volunteer-briefing",
    level: 4,
    category: "Bénévolat",
    title: "Nettoyage de la plage",
    context: "Briefing d'une association environnementale.",
    lines: [
      {
        speaker: "Responsable",
        voiceProfile: "male_uk",
        text: "Thank you all for turning up despite the chilly wind. Please keep glass bottles in the blue crates rather than the black bags so our recycling truck can process them safely.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quel temps fait-il pendant cette action bénévole ?",
        options: ["Une chaleur étouffante", "Un vent frais", "Une pluie battante", "Un calme plat"],
        correctIndex: 1,
        explanation: "« despite the chilly wind » = malgré le vent frais.",
      },
      {
        id: "q2",
        prompt: "Où faut-il placer les bouteilles en verre ?",
        options: ["Dans les sacs noirs", "Dans les caisses bleues", "Directement dans le camion", "Au pied des poubelles"],
        correctIndex: 1,
        explanation: "« keep glass bottles in the blue crates rather than the black bags ».",
      },
    ],
  },
  {
    id: "l4-exchange-programme",
    level: 4,
    category: "Échange scolaire",
    title: "Correspondant à Manchester",
    context: "Un élève raconte son séjour en famille d'accueil.",
    lines: [
      {
        speaker: "Élève",
        voiceProfile: "male_us",
        text: "On my first day in Manchester, the northern accent caught me completely off guard, even though I had watched British films for months. By the third day, however, everything started clicking.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qu'est-ce qui a surpris l'élève le premier jour ?",
        options: ["La taille de son lycée", "L'accent du nord de l'Angleterre", "L'heure du dîner", "Le froid dans la maison"],
        correctIndex: 1,
        explanation: "« the northern accent caught me completely off guard » = l'accent du Nord l'a pris de court.",
      },
      {
        id: "q2",
        prompt: "Comment la situation a-t-elle évolué ensuite ?",
        options: ["Il a demandé à changer de famille", "Dès le troisième jour, il comprenait bien mieux", "Il n'a jamais réussi à s'habituer", "Son hôte s'est mis à parler français"],
        correctIndex: 1,
        explanation: "« By the third day, however, everything started clicking » = dès le 3e jour, le déclic s'est fait.",
      },
    ],
  },
  {
    id: "l4-tech-announcement",
    level: 4,
    category: "Annonce radio",
    title: "Réseau Wi-Fi du campus",
    context: "Annonce technique sur la radio universitaire.",
    lines: [
      {
        speaker: "Technicien",
        voiceProfile: "female_uk",
        text: "Please note that library computers will restart automatically at ten p.m. tonight to install a security patch. Make sure you back up any unsaved essays beforehand.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Pourquoi les ordinateurs vont-ils redémarrer ce soir ?",
        options: ["Pour une coupure de courant prévue", "Pour installer un correctif de sécurité", "Pour nettoyer la salle", "Parce que le bâtiment ferme à 20 h"],
        correctIndex: 1,
        explanation: "« to install a security patch » = pour installer un correctif de sécurité.",
      },
      {
        id: "q2",
        prompt: "Que doivent faire les étudiants avant 22 h ?",
        options: ["Éteindre les écrans", "Sauvegarder leurs textes non enregistrés", "Rendre leurs cartes d'accès", "Changer leur mot de passe"],
        correctIndex: 1,
        explanation: "« back up any unsaved essays beforehand » = sauvegarder vos devoirs avant.",
      },
    ],
  },
  {
    id: "l4-theatre-review",
    level: 4,
    category: "Culture & critique",
    title: "Avis après la pièce",
    context: "Deux amis sortent d'un théâtre du West End.",
    lines: [
      { speaker: "Maya", voiceProfile: "female_uk", text: "What did you make of the second half?" },
      { speaker: "Sam", voiceProfile: "male_uk", text: "Honestly, the lighting and costumes were brilliant, though the plot dragged slightly before the final twist." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qu'est-ce que Sam a particulièrement apprécié ?",
        options: ["La longueur des dialogues", "Les lumières et les costumes", "Le prix des billets", "L'entracte"],
        correctIndex: 1,
        explanation: "« the lighting and costumes were brilliant ».",
      },
      {
        id: "q2",
        prompt: "Quelle critique nuancée fait-il ?",
        options: ["La fin était prévisible", "L'intrigue traînait un peu avant le rebondissement final", "Les acteurs parlaient trop bas", "Le décor manquait de réalisme"],
        correctIndex: 1,
        explanation: "« the plot dragged slightly before the final twist » = l'intrigue a traîné légèrement avant la chute.",
      },
    ],
  },
  {
    id: "l4-ferry-delay",
    level: 4,
    category: "Voyage & météo",
    title: "Traversée de la Manche",
    context: "Bulletin au port de Douvres.",
    lines: [
      {
        speaker: "Port",
        voiceProfile: "male_uk",
        text: "Due to rough seas in the Channel, the four o'clock crossing to Calais has been cancelled. All foot passengers are automatically transferred to the six fifteen vessel.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quelle est la cause de l'annulation de la traversée de 16 h ?",
        options: ["Une panne mécanique du ferry", "Une mer agitée dans la Manche", "Un contrôle douanier renforcé", "Une marée trop basse"],
        correctIndex: 1,
        explanation: "« Due to rough seas in the Channel » = à cause d'une mer agitée dans la Manche.",
      },
      {
        id: "q2",
        prompt: "Que doivent faire les passagers sans véhicule ?",
        options: ["Acheter un nouveau billet", "Ils sont transférés automatiquement sur le bateau de 18 h 15", "Prendre le tunnel à leurs frais", "Revenir le lendemain matin"],
        correctIndex: 1,
        explanation: "« automatically transferred to the six fifteen vessel ».",
      },
    ],
  },
  {
    id: "l4-book-club",
    level: 4,
    category: "Culture & lecture",
    title: "Club de lecture",
    context: "Choix du prochain roman du mois.",
    lines: [
      { speaker: "Sam", voiceProfile: "male_uk", text: "Should we pick the sci-fi novel or the historical mystery for November?" },
      { speaker: "Maya", voiceProfile: "female_uk", text: "Let's go with the mystery. Several members found last month's sci-fi book a bit heavy going, and this one is half the length." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Pourquoi Maya préfère-t-elle le roman policier historique ?",
        options: ["Il vient d'être adapté en film", "Le livre de science-fiction du mois dernier a semblé lourd et celui-ci est deux fois plus court", "L'auteur vient dans leur lycée", "Personne n'aime la science-fiction"],
        correctIndex: 1,
        explanation: "« found last month's sci-fi book a bit heavy going, and this one is half the length ».",
      },
      {
        id: "q2",
        prompt: "Pour quel mois choisissent-ils cette lecture ?",
        options: ["Octobre", "Novembre", "Décembre", "Janvier"],
        correctIndex: 1,
        explanation: "« for November ».",
      },
    ],
  },
  {
    id: "l4-music-lesson",
    level: 4,
    category: "Loisirs",
    title: "Changement d'horaire de guitare",
    context: "Message vocal d'un professeur de musique.",
    lines: [
      {
        speaker: "Professeur",
        voiceProfile: "female_us",
        text: "Hi, I have to attend a rehearsal on Monday afternoon, so could we switch your lesson to Wednesday at five, just for next week? Let me know if that clashes with your swimming training.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Ce changement d'horaire est-il définitif ?",
        options: ["Oui, pour toute l'année", "Non, juste pour la semaine prochaine", "Oui, jusqu'aux vacances", "Le cours est annulé sans report"],
        correctIndex: 1,
        explanation: "« just for next week » = seulement pour la semaine prochaine.",
      },
      {
        id: "q2",
        prompt: "Avec quelle autre activité cela risque-t-il de se chevaucher ?",
        options: ["L'entraînement de natation", "Le match de tennis", "Le cours de théâtre", "La chorale"],
        correctIndex: 0,
        explanation: "« if that clashes with your swimming training ».",
      },
    ],
  },

  // ===================== NIVEAU 5 (B1+) =====================
  {
    id: "l5-podcast-debate",
    level: 5,
    category: "Débat société",
    title: "Les téléphones au lycée",
    context: "Extrait d'un débat sur une radio scolaire.",
    lines: [
      {
        speaker: "Journaliste",
        voiceProfile: "female_uk",
        text: "While banning phones during breaks boosted face-to-face chat in our pilot school, teachers pointed out that older pupils still need controlled access for digital research in class.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quel effet positif l'interdiction pendant les pauses a-t-elle eu ?",
        options: ["Moins de pannes Wi-Fi", "Davantage d'échanges en face à face entre élèves", "Des notes d'anglais doublées", "Des pauses plus courtes"],
        correctIndex: 1,
        explanation: "« boosted face-to-face chat » = a stimulé les discussions directes.",
      },
      {
        id: "q2",
        prompt: "Quelle nuance les enseignants soulignent-ils ?",
        options: ["L'interdiction totale doit s'étendre à la maison", "Les plus grands ont encore besoin d'un accès encadré en cours pour des recherches", "Les téléphones doivent rester allumés aux examens", "Aucun élève ne respecte la règle"],
        correctIndex: 1,
        explanation: "« older pupils still need controlled access for digital research in class ».",
      },
    ],
  },
  {
    id: "l5-news-urban-trees",
    level: 5,
    category: "Actualité",
    title: "Îlots de fraîcheur urbains",
    context: "Reportage radio bref sur l'urbanisme à Leeds.",
    lines: [
      {
        speaker: "Reporter",
        voiceProfile: "male_uk",
        text: "Rather than paving over disused car parks, the city council turned three sites into pocket parks, cutting street temperatures by up to three degrees during last summer's heatwave.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qu'a fait la mairie des trois parkings désaffectés ?",
        options: ["Elle les a réasphaltés", "Elle les a transformés en petits parcs urbains", "Elle y a construit des tours de bureaux", "Elle les a revendus à une gare"],
        correctIndex: 1,
        explanation: "« turned three sites into pocket parks » = transformés en parcs de poche.",
      },
      {
        id: "q2",
        prompt: "Quel impact mesurable a été observé pendant la canicule ?",
        options: ["Jusqu'à 3 degrés de moins dans les rues voisines", "Une baisse de 30 % du trafic automobile", "Une hausse du prix des billets de bus", "Aucun effet la première année"],
        correctIndex: 0,
        explanation: "« cutting street temperatures by up to three degrees ».",
      },
    ],
  },
  {
    id: "l5-startup-pitch",
    level: 5,
    category: "Innovation",
    title: "Réparer plutôt que jeter",
    context: "Interview du fondateur d'un atelier associatif.",
    lines: [
      {
        speaker: "Fondateur",
        voiceProfile: "female_us",
        text: "When we launched our repair café, we assumed only retired engineers would volunteer. In fact, teenagers have been our keenest learners, eager to swap disposable habits for hands-on skills.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "À quoi s'attendait l'équipe au lancement du projet ?",
        options: ["À ce que seuls des ingénieurs à la retraite soient bénévoles", "À attirer uniquement des commerçants", "À devoir fermer au bout d'un mois", "À recevoir une subvention européenne"],
        correctIndex: 0,
        explanation: "« we assumed only retired engineers would volunteer ».",
      },
      {
        id: "q2",
        prompt: "Quelle surprise réelle ont-ils constatée ?",
        options: ["Les adolescents sont les plus enthousiastes pour apprendre à réparer", "Personne n'apportait d'appareils électroniques", "Les ateliers coûtent trop cher aux habitants", "Les pièces détachées sont interdites"],
        correctIndex: 0,
        explanation: "« teenagers have been our keenest learners » = les ados ont été les apprentis les plus motivés.",
      },
    ],
  },
  {
    id: "l5-exam-strategy",
    level: 5,
    category: "Méthode & oral",
    title: "Gérer le trac à l'oral",
    context: "Un examinateur donne un conseil pratique avant un examen d'anglais.",
    lines: [
      {
        speaker: "Examinateur",
        voiceProfile: "male_uk",
        text: "Students often rush their answers because silence feels awkward. Pausing for two seconds to structure a clear contrast actually shows far stronger fluency than speaking at top speed.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Pourquoi les candidats parlent-ils souvent trop vite selon l'examinateur ?",
        options: ["Pour impressionner avec leur vocabulaire", "Parce que le silence les met mal à l'aise", "Par manque de temps réglementaire", "À cause d'une mauvaise écoute"],
        correctIndex: 1,
        explanation: "« rush their answers because silence feels awkward ».",
      },
      {
        id: "q2",
        prompt: "Que vaut-il mieux faire à la place ?",
        options: ["Répéter la question mot à mot", "Marquer une pause de deux secondes pour structurer une idée claire", "Changer de sujet dès qu'on hésite", "Mémoriser un texte entier par cœur"],
        correctIndex: 1,
        explanation: "« Pausing for two seconds to structure a clear contrast shows far stronger fluency ».",
      },
    ],
  },
  {
    id: "l5-rail-policy",
    level: 5,
    category: "Économie & transport",
    title: "Billets de train flexibles",
    context: "Chronique consommation à la BBC.",
    lines: [
      {
        speaker: "Chroniqueur",
        voiceProfile: "female_uk",
        text: "Although off-peak tickets look remarkably cheap on paper, commuters travelling before nine thirty still end up paying nearly double unless they book an advance single weeks ahead.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Qui continue de payer près du double malgré les tarifs « heures creuses » ?",
        options: ["Les touristes étrangers", "Les voyageurs quotidiens qui partent avant 9 h 30", "Les étudiants en fin de journée", "Les voyageurs du dimanche soir"],
        correctIndex: 1,
        explanation: "« commuters travelling before nine thirty still end up paying nearly double ».",
      },
      {
        id: "q2",
        prompt: "Comment ces voyageurs peuvent-ils tout de même réduire la facture ?",
        options: ["En réservant un aller simple à l'avance plusieurs semaines avant", "En payant en espèces au contrôleur", "En voyageant sans réservation", "En changeant de gare à l'arrivée"],
        correctIndex: 0,
        explanation: "« unless they book an advance single weeks ahead ».",
      },
    ],
  },
  {
    id: "l5-museum-audio",
    level: 5,
    category: "Histoire & patrimoine",
    title: "Enigma à Bletchley Park",
    context: "Extrait d'un audioguide historique.",
    lines: [
      {
        speaker: "Guide",
        voiceProfile: "male_uk",
        text: "Contrary to popular myth, breaking intercepted codes was rarely a sudden flash of genius. It relied on painstaking teamwork, cross-checking thousands of weather broadcasts day after day.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quel mythe l'audioguide remet-il en question ?",
        options: ["Que les ordinateurs n'existaient pas à l'époque", "Que le décodage reposait surtout sur un coup de génie soudain et solitaire", "Que les messages étaient en français", "Que la météo n'avait aucune importance"],
        correctIndex: 1,
        explanation: "« Contrary to popular myth, breaking intercepted codes was rarely a sudden flash of genius. »",
      },
      {
        id: "q2",
        prompt: "Qu'est-ce qui a réellement permis de réussir ?",
        options: ["Un travail d'équipe minutieux comparant des milliers de bulletins météo", "Des espions sur le terrain uniquement", "Une erreur d'impression du manuel", "Un hasard complet"],
        correctIndex: 0,
        explanation: "« painstaking teamwork, cross-checking thousands of weather broadcasts ».",
      },
    ],
  },
  {
    id: "l5-sleep-study",
    level: 5,
    category: "Sciences",
    title: "Mémoire et sommeil",
    context: "Résumé d'une étude universitaire à la radio.",
    lines: [
      {
        speaker: "Chercheuse",
        voiceProfile: "female_us",
        text: "Participants who reviewed new vocabulary for just ten minutes right before sleeping recalled significantly more words the next morning than those who revised for twice as long at noon.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Quel groupe a retenu nettement plus de mots le lendemain matin ?",
        options: ["Ceux qui ont révisé deux fois plus longtemps à midi", "Ceux qui ont révisé dix minutes juste avant de dormir", "Ceux qui ont relu leurs fiches en marchant", "Il n'y avait aucune différence"],
        correctIndex: 1,
        explanation: "« reviewed new vocabulary for just ten minutes right before sleeping recalled significantly more words ».",
      },
      {
        id: "q2",
        prompt: "Combien de temps le groupe du midi avait-il révisé ?",
        options: ["Cinq minutes", "Dix minutes", "Deux fois plus longtemps (20 minutes)", "Une heure complète"],
        correctIndex: 2,
        explanation: "« twice as long at noon » = deux fois plus longtemps à midi.",
      },
    ],
  },
  {
    id: "l5-dialogue-misunderstanding",
    level: 5,
    category: "Nuances & quiproquo",
    title: "Changement de salle imprévu",
    context: "Conversation rapide entre Maya et Sam devant le bâtiment B.",
    lines: [
      { speaker: "Sam", voiceProfile: "male_uk", text: "Wait, weren't we supposed to present in room two-oh-four? Nobody's here!" },
      { speaker: "Maya", voiceProfile: "female_uk", text: "Check the notice on the door: the projector broke down an hour ago, so they moved us downstairs to the language lab instead." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Pourquoi la salle 204 est-elle vide ?",
        options: ["La présentation a été annulée", "Le projecteur est tombé en panne il y a une heure", "Ils sont en avance d'une heure", "Le cours se déroule dehors"],
        correctIndex: 1,
        explanation: "« the projector broke down an hour ago » = le projecteur est tombé en panne.",
      },
      {
        id: "q2",
        prompt: "Où doivent-ils se rendre maintenant ?",
        options: ["Au laboratoire de langues au rez-de-chaussée", "Dans l'amphithéâtre du 3e étage", "Au secrétariat", "En salle 205 juste à côté"],
        correctIndex: 0,
        explanation: "« downstairs to the language lab » = en bas, au laboratoire de langues.",
      },
    ],
  },
];

export function pickEchoSignalMissions(options: {
  level?: GameLevel;
  count?: number;
  rng?: () => number;
} = {}): EchoScenario[] {
  const level = options.level ?? 1;
  const count = options.count ?? ECHO_SIGNAL_CLIPS_PER_RUN;
  const rng = options.rng ?? Math.random;
  return pickByLevel(ECHO_SIGNAL_SCENARIOS, level, count, rng);
}

export function computeEchoQuestionPoints({
  difficulty,
  correct,
  playsUsed,
  newStreak,
  silentMode,
}: {
  difficulty: EchoDifficulty;
  correct: boolean;
  playsUsed: number;
  newStreak: number;
  silentMode: boolean;
}): number {
  if (!correct) return 0;
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const streakBonus = Math.min(cfg.maxStreakSteps, Math.max(0, newStreak - 1)) * cfg.streakStep;
  const listenBonus = !silentMode && playsUsed <= 1 ? cfg.firstListenBonus : 0;
  const silentMultiplier = silentMode ? 0.65 : 1;
  return Math.round((cfg.basePoints + streakBonus + listenBonus) * silentMultiplier);
}

export function maxEchoSignalScore(difficulty: EchoDifficulty, correctAnswers: number): number {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  let total = 0;
  for (let streak = 1; streak <= correctAnswers; streak += 1) {
    const streakBonus = Math.min(cfg.maxStreakSteps, streak - 1) * cfg.streakStep;
    total += cfg.basePoints + streakBonus + cfg.firstListenBonus;
  }
  return total;
}
