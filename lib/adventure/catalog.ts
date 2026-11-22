export type Passage = {
  id: number;
  title: string;
  place: string;
  art: string;
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
    opening: "Un robot attend au quai. Il ouvre la navette aux membres de l’équipe. Maya va te montrer comment le saluer et te présenter en anglais.",
    ending: "Le petit robot embarque. Il ouvre enfin son colis : à l’intérieur, une boussole dont l’aiguille pointe droit vers une forêt suspendue.",
    keepsake: "La boussole du port" },
  { id: 2, title: "L’écho de la canopée", place: "Forêt des cloches", art: "canopy", minutes: "6 à 10 min",
    alt: "Au-dessus d’un pont de lianes, Sam bondit vers une petite balise tandis que Maya lui indique sa trajectoire.",
    skill: "Reconnaître et nommer un objet avec sa couleur.",
    opening: "Au passage de la navette, une balise se décroche. Elle traverse une forêt où chaque fleur renvoie le son. Maya et Sam ont besoin de tes yeux et de tes oreilles.",
    ending: "Sam rattrape la balise avant qu’elle ne tombe. Dans la coque, une petite roue tourne au rythme d’un moulin très loin au-dessus des nuages.",
    keepsake: "La balise d’écho" },
  { id: 3, title: "Le secret des moulins", place: "Îles du grand vent", art: "wind", minutes: "6 à 10 min",
    alt: "Maya inspecte le moyeu d’un moulin volant. Depuis le balcon, Sam observe le cadran de l’horloge.",
    skill: "Dire ce que j’ai et ce qu’un autre personnage possède.",
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

export function passageArt(passage: Passage) {
  return `/art/passage/${passage.art}.webp`;
}

export const culturalClues: Record<number, { after: number; object: string; source: string; note: string }> = {
  1: { after: 1, object: "Le tampon du billet", source: "Retour vers le futur", note: "Le petit tampon 10:04 sur le billet du quai fait un clin d’œil à l’horloge de Hill Valley. Le robot, lui, voulait simplement qu’on lui dise bonjour." },
  2: { after: 2, object: "Le parapluie à l’arrêt", source: "Mon voisin Totoro", note: "Un arrêt sous un grand arbre, un parapluie et l’attente sous la pluie. Ces trois détails rappellent une rencontre du film de Hayao Miyazaki." },
  3: { after: 2, object: "L’ocarina du meunier", source: "The Legend of Zelda: Ocarina of Time", note: "Un moulin qui garde un secret musical rappelle le village Cocorico. Dans nos îles, le meunier a glissé son ocarina dans un sac bleu." },
  4: { after: 1, object: "Le sous-marin jaune", source: "Yellow Submarine", note: "Le titre de la chanson des Beatles se cache dans l’en-tête du carnet des objets trouvés. Yellow veut dire « jaune » et submarine, « sous-marin »." },
  5: { after: 2, object: "Le ciel au plafond", source: "Harry Potter", note: "À Poudlard, le plafond de la Grande Salle reflète le ciel. Dans notre observatoire, les étoiles sont peintes au plafond. Pour voir les vraies, Maya et Sam doivent ouvrir le dôme." },
};
