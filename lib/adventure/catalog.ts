export type Passage = {
  id: number;
  title: string;
  place: string;
  art: "quai" | "canopy" | "wind" | "tide" | "observatory";
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
];
