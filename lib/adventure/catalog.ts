export type Passage = {
  id: number;
  title: string;
  place: string;
  art: "quai" | "canopy" | "wind" | "tide" | "observatory" | "cinema" | "post" | "market" | "rail" | "island";
  alt: string;
  minutes: string;
  skill: string;
  opening: string;
  ending: string;
  keepsake: string;
};

export const passages: Passage[] = [
  { id: 1, title: "Le robot du quai 7", place: "Port suspendu", art: "quai", minutes: "5 à 8 min",
    alt: "Maya examine le bras rouge d’un robot de livraison. Sam retient la navette au quai.",
    skill: "Saluer et se présenter avec un nom de héros.",
    opening: "Une tempête a effacé les routes de l’Atlas. Au port suspendu, une navette peut encore décoller.",
    ending: "Le robot ouvre le coffret de la tour. L’aiguille de la boussole pointe vers une forêt suspendue. Tu transmets le cap à Maya. La navette quitte le quai.",
    keepsake: "La boussole du port" },
  { id: 2, title: "L’écho de la canopée", place: "Forêt des cloches", art: "canopy", minutes: "6 à 10 min",
    alt: "Au-dessus d’un pont de lianes, Sam bondit vers une petite balise tandis que Maya lui indique sa trajectoire.",
    skill: "Reconnaître et nommer un objet avec sa couleur.",
    opening: "Au passage de la navette, une balise se décroche. Elle traverse une forêt où chaque fleur renvoie le son. Maya et Sam ont besoin de tes yeux et de tes oreilles.",
    ending: "La balise réparée répond par trois notes. Dans sa coque, une petite roue tourne au rythme d’un moulin, loin au-dessus des nuages.",
    keepsake: "La balise d’écho" },
  { id: 3, title: "Le secret des moulins", place: "Îles du grand vent", art: "wind", minutes: "6 à 10 min",
    alt: "Maya inspecte le moyeu d’un moulin volant. Depuis le balcon, Sam observe le cadran de l’horloge.",
    skill: "Dire ce que tu possèdes et ce qu’un équipier a dans son sac.",
    opening: "Le moulin est à l’arrêt. Maya cherche l’outil qui libérera les voiles. Sam garde les sacs de l’équipe. Qui a quoi ?",
    ending: "Les voiles se remettent en marche. Un courant d’air emporte la navette jusqu’à une ville où les rues disparaissent sous l’eau.",
    keepsake: "La roue des vents" },
  { id: 4, title: "La ville à contre-marée", place: "Cité des marées", art: "tide", minutes: "7 à 12 min",
    alt: "Maya tient l’amarre sur le quai et Sam la retient depuis un bateau, devant les écluses de la ville.",
    skill: "Comprendre où se trouve un objet et indiquer sa position.",
    opening: "Les ferries suivent d’habitude le même canal. Ce soir, la marée envahit les marches. Sam est déjà à bord. À toi d’indiquer à Maya le passage encore ouvert.",
    ending: "Le ferry atteint la rive haute. La gardienne du phare vous confie une lentille et les coordonnées d’un observatoire.",
    keepsake: "La lentille du phare" },
  { id: 5, title: "Le signal de minuit", place: "Observatoire boréal", art: "observatory", minutes: "8 à 14 min",
    alt: "Maya oriente la roue du télescope et Sam désigne une étoile à travers le dôme ouvert.",
    skill: "Croiser deux indices et écrire un court message en autonomie.",
    opening: "Au sommet, un télescope peut rallumer le chemin du retour. Pour l’activer, tu devras reconnaître la bonne personne, retrouver une clé et envoyer toi-même le dernier message.",
    ending: "Un trait de lumière relie l’observatoire, le phare, les moulins, la forêt et le port. Maya oriente la navette. Vous avez tracé ensemble le premier itinéraire de l’Atlas.",
    keepsake: "La carte des cinq mondes" },
  { id: 6, title: "Le cinéma des silhouettes", place: "Cinéma de la Lune", art: "cinema", minutes: "7 à 11 min",
    alt: "Dans un cinéma à ciel ouvert, Maya et Sam découvrent une lune de papier éclairée par un vieux projecteur.",
    skill: "Présenter quelqu’un et dire son métier.",
    opening: "Au port, le robot vous attend avec une bobine mouillée. Sur la dernière image, on devine un phare qui ne figure sur aucune carte. Qui a envoyé le film ?",
    ending: "Sur la dernière image, Mira tend une enveloppe à Leo. Un timbre en forme d’aile vous donne une adresse de départ. Direction la poste des nuages !",
    keepsake: "Le photogramme de la Lune" },
  { id: 7, title: "Le courrier des nuages", place: "Poste aérienne", art: "post", minutes: "7 à 12 min",
    alt: "Maya et Sam cherchent le bon coursier dans une poste suspendue au-dessus des nuages.",
    skill: "Poser une question à quelqu’un et comprendre sa réponse.",
    opening: "Des planeurs chargés de courrier partent dans toutes les directions. Leo a laissé l’enveloppe au guichet. Pour la récupérer, trouve la personne qui pilotera le prochain vol.",
    ending: "La pilote ouvre la sacoche. L’île vous envoie une demande de lumière. La piste qui mène au phare s’est éteinte. L’enveloppe contient un bon à échanger au marché.",
    keepsake: "Le timbre ailé" },
  { id: 8, title: "Le marché des lanternes", place: "Halles du crépuscule", art: "market", minutes: "8 à 12 min",
    alt: "Au marché de nuit, Maya et Sam passent entre des étals de lanternes suspendues.",
    skill: "Comprendre une petite quantité et écrire une commande.",
    opening: "Sous les passerelles, chaque étal éclaire un bout de rue. Le bon de l’île est déchiré en deux. Sam en a la couleur. Tu vas devoir retrouver la quantité.",
    ending: "Les lanternes quittent leur panier. Une à une, elles éclairent un ancien rail. Au bout, une bibliothèque pivote dans la paroi de la montagne.",
    keepsake: "La lanterne de poche" },
  { id: 9, title: "Le rail des lucioles", place: "Ligne souterraine", art: "rail", minutes: "8 à 13 min",
    alt: "Maya et Sam voyagent dans un petit wagon sur une voie éclairée par des lucioles.",
    skill: "Suivre deux directions dans l’ordre et guider une autre personne.",
    opening: "Derrière la bibliothèque attend un wagon postal. Le rail se divise dans le noir. Maya conduit, Sam surveille les lanternes. À toi de lire la feuille de route.",
    ending: "Le wagon ressort à l’air libre. En bas, cinq tuyaux de cuivre dépassent de la brume. Le quai du phare est enfin en vue.",
    keepsake: "Le poinçon du rail" },
  { id: 10, title: "Le phare aux cinq notes", place: "Île du retour", art: "island", minutes: "9 à 15 min",
    alt: "Maya et Sam découvrent le phare aux tuyaux de cuivre sur une île qui émerge de la brume.",
    skill: "Lire un message puis répondre au nom de ton équipe.",
    opening: "Le courrier est arrivé jusqu’au phare, mais personne au port ne sait comment revenir ici. Mira vous a laissé la dernière page de son film. À vous d’envoyer la réponse.",
    ending: "Les cinq tuyaux chantent. Une barque emporte votre réponse et, cette fois, laisse sur la carte un sillage dans les deux sens. Au cinéma du port, le robot projette enfin le film entier.",
    keepsake: "Le timbre du voyage retour" },
];

export const atlasChapters = [
  { title: "Le premier itinéraire", first: 1, last: 5 },
  { title: "Le courrier de l’île invisible", first: 6, last: 10 },
];
