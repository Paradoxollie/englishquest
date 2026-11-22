type Panel = { hero: "Maya" | "Sam"; line: string; action: string; x: number; y: number };
const maya = (line: string, action: string, x: number, y: number): Panel => ({ hero: "Maya", line, action, x, y });
const sam = (line: string, action: string, x: number, y: number): Panel => ({ hero: "Sam", line, action, x, y });

// Coordinates follow the full, uncropped illustration at every screen size.
export const panels: Record<number, Panel[]> = {
  1: [
    maya("Le robot vient de se réveiller. Viens avec moi, on va lui dire bonjour.", "Saluer le robot", 55, 57),
    sam("La radio grésille. Écoute bien le prénom de celui qui appelle.", "Décrocher la radio", 63, 32),
    maya("Il te faut un badge pour monter à bord. Quel nom de héros va-t-on lui donner ?", "Préparer mon badge", 27, 57),
    sam("La rampe va s’ouvrir. Tu reçois les messages de l’équipage ?", "Brancher la radio de bord", 81, 29),
    maya("Voilà le registre. Maintenant que tu sais faire, c’est toi qui présentes notre nouvelle recrue.", "Signer le registre", 87, 83),
  ],
  2: [
    maya("La balise file entre les branches. Fouille dans mon sac, il nous faut de quoi ouvrir son boîtier.", "Ouvrir l’inventaire", 55, 68),
    sam("Sous le grand arbre, quelqu’un a laissé deux sacs près d’un parapluie. Quel est le nôtre ?", "Explorer l’abri", 15, 69),
    maya("La pluie a effacé l’étiquette de la carte. Tu peux la refaire ?", "Réparer l’étiquette", 69, 73),
    sam("Je vois la balise ! Je passe ma commande à la radio, à toi de récupérer le matériel.", "Intercepter le message", 87, 25),
    maya("C’est le dernier colis du pont. Écris ce qu’il contient avant qu’on décolle.", "Étiqueter le colis", 84, 63),
  ],
  3: [
    maya("Quelqu’un a rangé les outils dans la mauvaise trousse. Ouvre mon carnet, j’y ai tout noté.", "Consulter le carnet", 43, 44),
    sam("Tu entends le meunier jouer ? Son instrument vient de disparaître au fond d’un sac.", "Chercher l’ocarina", 77, 75),
    maya("Je peux te dire qui a pris la carte. Approche ta radio du moyeu !", "Capter le message", 50, 29),
    sam("Les voiles bougent à nouveau. Préviens l’équipe qui garde la clé.", "Préparer l’étiquette", 70, 60),
    maya("Le moulin nous renvoie quatre messages. Aide-moi à trier les inventaires.", "Régler la fréquence", 30, 68),
    sam("La bonne clé ouvrira le passage. Dis-nous laquelle tu as dans ta poche.", "Compléter mon inventaire", 88, 65),
  ],
  4: [
    sam("J’ai égaré ma carte au dernier arrêt. On commence par les objets trouvés du port ?", "Ouvrir le journal du port", 39, 44),
    maya("La marée monte. Dis-moi où est la clé avant que la passerelle ne disparaisse.", "Examiner la passerelle", 24, 75),
    sam("Un message de Maya ! La clé et la carte ont changé de place.", "Écouter la radio du ferry", 79, 56),
    maya("Trois messages se ressemblent. Un seul permet de fermer le sac avec la clé à l’intérieur.", "Inspecter le sac", 14, 56),
    sam("La corde est tendue. Écris-moi où regarder pour retrouver la carte depuis le bateau.", "Envoyer ma position", 88, 73),
  ],
  5: [
    maya("On y est ! Pour ouvrir le dôme, il nous faut la personne qui porte la clé.", "Consulter le registre", 29, 66),
    sam("Des étoiles au plafond… et un plan quelque part en dessous. Lis la note du gardien.", "Explorer la salle des étoiles", 76, 28),
    maya("Sam nous appelle. Garde la liste des destinataires sous les yeux pendant la transmission.", "Croiser les deux indices", 58, 38),
    sam("Le télescope est branché. Quatre signaux venus de nos escales doivent encore être alignés.", "Aligner les signaux", 80, 49),
    maya("Le faisceau bouge ! Prépare la phrase qui m’indiquera la position exacte de la clé.", "Orienter la roue", 47, 75),
    sam("Le canal est à toi, Nova. Quand ton message arrivera, les cinq mondes s’allumeront.", "Émettre le message final", 75, 64),
  ],
};
