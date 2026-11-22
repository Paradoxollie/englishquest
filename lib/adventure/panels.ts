export type Hero = "Maya" | "Sam";
export type Speech = { speaker: Hero; line: string; lang: "fr" | "en"; french?: string };
export type Panel = { caption: string; dialogue: Speech[] };

const maya = (line: string, french?: string): Speech => ({ speaker: "Maya", line, lang: french ? "en" : "fr", french });
const sam = (line: string, french?: string): Speech => ({ speaker: "Sam", line, lang: french ? "en" : "fr", french });
const panel = (caption: string, ...dialogue: Speech[]): Panel => ({ caption, dialogue });

export const panels: Record<number, Panel[]> = {
  1: [
    panel("Quai 7, à l’aube. Les dernières balises viennent de s’éteindre.",
      maya("Moi, c’est Maya. Si on rallume l’observatoire, les navettes retrouveront leur chemin. Tu embarques ?"),
      sam("Moi, c’est Sam. Je vais chercher la boussole. À toi la radio !")),
    panel("Depuis la tempête, l’horloge du quai marque toujours 10 h 04. Dans la cabine, le voyant de la radio s’allume.",
      maya("Quelqu’un essaie de nous joindre. Écoute son prénom.")),
    panel("La passerelle reste fermée. Le robot attend un nom de code.",
      sam("Hello, Nova!", "Bonjour, Nova !"), maya("C’est ton nom de code. Le robot attend ta réponse.")),
    panel("Quatre appels arrivent de la tour de contrôle.",
      maya("Un appel par fréquence."), sam("Tu prends la radio ? Moi, je m’occupe des amarres.")),
    panel("Une dernière voyageuse attend devant la rampe.",
      sam("Son badge dit Sky."), maya("Prends sa place au micro pour l’aider à embarquer.")),
  ],
  2: [
    panel("Une rafale emporte une balise dans la forêt des cloches.",
      sam("Je la vois ! Elle est coincée dans les branches."), maya("Je vais ouvrir son boîtier. Passe-moi une clé.")),
    panel("À l’arrêt de la forêt, la pluie tambourine sur un grand parapluie orange. Deux sacs sont au sec.",
      sam("Celui de gauche ou celui de droite ?"), maya("J’ai laissé un mot sur le banc. Regarde la couleur.")),
    panel("Une goutte a effacé l’étiquette de la carte.",
      maya("My map!", "Ma carte !"), sam("J’ai des lettres sèches. On peut refaire son étiquette.")),
    panel("Sam installe la balise au-dessus du pont.",
      maya("Il lui manque du matériel."), sam("Je t’envoie ma commande par radio.")),
    panel("Le dernier colis attend au bout de la passerelle.",
      sam("Ready?", "Tout est prêt ?"), maya("Il reste à étiqueter le colis.")),
  ],
  3: [
    panel("La balise conduit la navette vers un moulin immobile.",
      maya("Sans vent, on n’atteindra jamais la ville."), sam("Ouvre le carnet. On y a noté nos outils.")),
    panel("Dans l’atelier, le meunier pose un ocarina près des engrenages. Il lui faut la personne qui l’a apporté.",
      sam("Il paraît que trois notes suffisent à réveiller le vent."), maya("Regarde dans mon inventaire qui a l’instrument.")),
    panel("Près de l’ocarina, le meunier trouve un billet. Il le tourne dans tous les sens.",
      sam("Il ne lit pas l’anglais. Sans sa carte, il ne saura pas vers où tourner les voiles."), maya("Tu peux lui indiquer à qui s’adresser ?")),
    panel("Le meunier déplie ses plans sur le balcon.",
      maya("I have the tools.", "J’ai les outils."), sam("Et qui a la clé ? Écrivons au meunier.")),
    panel("Les ailes frémissent. Quatre signaux passent dans les engrenages.",
      sam("Listen to the wind!", "Écoute le vent !"), maya("Remets les messages dans le bon inventaire.")),
    panel("La serrure du moulin s’allume en bleu.",
      maya("Le meunier te demande ce que tu transportes."), sam("C’est à toi de lui répondre.")),
  ],
  4: [
    panel("Un périscope jaune fend l’eau. Un petit sous-marin passe un câble au ferry coincé dans l’écluse.",
      sam("Where’s my map?", "Où est ma carte ?"), maya("Le pilote l’a repêchée ! Il t’a laissé un message.")),
    panel("Une clé glisse sous la passerelle.",
      maya("Je descends la chercher."), sam("Laisse-lui un message précis sur sa position.")),
    panel("Le ferry avance. Maya est restée à quai.",
      sam("Elle a retrouvé nos affaires."), maya("Reste à l’écoute, je vais te dire où elles sont.")),
    panel("Un sac ouvert balance au-dessus de l’eau.",
      sam("Watch the key!", "Attention à la clé !"), maya("Envoie-moi le message qui me permet de fermer le sac.")),
    panel("La marée atteint la dernière marche.",
      maya("Je vois le ferry, mais où est ma carte ?"), sam("Dis-lui où regarder.")),
  ],
  5: [
    panel("La lentille du phare éclaire la porte de l’observatoire.",
      maya("We’re here!", "Nous y sommes !"), sam("Voilà le dôme qu’on cherchait depuis le quai. Quelqu’un a glissé un billet sous la porte.")),
    panel("Deux étoiles brillent côte à côte. L’une glisse avec le panneau du plafond. L’autre reste dans le ciel.",
      sam("Do we have a map?", "Est-ce qu’on a un plan ?"), maya("La gardienne a laissé de quoi trouver le bon ciel.")),
    panel("Une dernière serrure sépare l’équipe du télescope.",
      maya("J’ai les étiquettes pour livrer les clés."), sam("Je t’indique par radio laquelle prendre.")),
    panel("Le télescope reçoit quatre signaux des mondes traversés.",
      sam("Je reconnais la fréquence du port."), maya("Aligne les signaux. Je tourne la roue.")),
    panel("La roue s’arrête à un cran de la bonne étoile.",
      maya("Il me faut la clé bleue."), sam("Envoie sa position exacte.")),
    panel("Le faisceau attend le dernier message de l’équipage.",
      sam("Your turn, Nova.", "À toi, Nova."), maya("Présente-toi, puis dis-moi où est la clé. On pourra rentrer.")),
  ],
  6: [
    panel("Le faisceau de l’observatoire se pose sur l’écran d’un cinéma désert. Le robot du port déroule sa bobine.", maya("Une île a voulu nous envoyer un film. Regarde, il manque la fin."), sam("Commençons par les deux noms au générique.")),
    panel("Devant une lune en carton, une silhouette chante. Quelqu’un a écrit au crayon dans la marge.", sam("I am Leo.", "Je suis Leo."), maya("C’est la première ligne. Lis la suivante avec moi.")),
    panel("Dans le projecteur, une image tremble. Le pilote porte des lunettes relevées sur le front.", maya("Voilà Leo. Si on recolle sa fiche au bon endroit, le film pourra continuer.")),
    panel("La manivelle repart. Quatre sous-titres défilent encore dans le désordre.", sam("Je fais tourner la bobine. Tu t’occupes des mots ?")),
    panel("Sous les projecteurs, Mira salue. Une enveloppe dépasse de sa poche.", maya("On tient une piste. Laisse une légende sous son image pour le robot.")),
  ],
  7: [
    panel("À la poste des nuages, un chat dort sur le seul colis qui ne bouge pas. Deux planeurs attendent le vent.", sam("On cherche la pilote du prochain vol. Seulement, tout le monde a les mêmes lunettes !"), maya("On peut lui poser la question.")),
    panel("Deux coursiers répondent au guichet. Le vent couvre leurs voix, alors ils écrivent.", maya("Read their answers.", "Lis leurs réponses.")),
    panel("Une autre voyageuse arrive. Son badge s’est retourné dans la tempête.", sam("Cette fois, on cherche la chanteuse du film. À toi de lui demander.")),
    panel("Un billet s’échappe de la sacoche rouge. Le chat l’immobilise d’un coup de patte.", maya("On dirait un mot de Jo pour Kit. Qui prend les commandes ?")),
    panel("Kit te tend son casque de pilote. Elle t’a pris pour son remplaçant.", sam("Are you the pilot?", "Es-tu le pilote ?"), maya("Réponds pour toi. On va lui éviter une sacrée surprise.")),
  ],
  8: [
    panel("La nuit tombe. Deux cerises en mosaïque brillent au pied de l’étal des lanternes.", maya("L’île a besoin de lumière. Sur ce morceau du bon, je ne lis que la taille du panier.")),
    panel("La marchande tire son crayon de derrière son oreille et attend ta commande.", sam("Avant de lui répondre, il faut demander la quantité à l’île.")),
    panel("Un grésillement, puis un seul mot traverse le marché.", maya("La radio ne capte que le nombre. Garde-le en tête.")),
    panel("Sam retourne sa moitié du bon. Deux commandes sont écrites l’une sous l’autre.", sam("Les clés restent ici. C’est le panier des lanternes qu’on emporte.")),
    panel("La marchande glisse une souche vierge dans ton carnet.", maya("Pour le retour, il nous en faudra deux autres, rouges cette fois. Tu écris le reçu ?")),
  ],
  9: [
    panel("Une bibliothèque tourne sur ses gonds. Derrière, un wagon grince sous un nuage de lucioles.", sam("Un train secret derrière des livres ? Voilà une gare où je pourrais rater mon départ."), maya("Monte ! Le premier signal vient de s’allumer.")),
    panel("Deux lampes blanches éclairent un billet coincé sous le frein.", maya("Lis jusqu’au bout. Il y a deux actions.")),
    panel("Deux leviers attendent devant le tunnel. Le rail se sépare une première fois, puis une seconde.", sam("Je garde la lanterne allumée. C’est toi qui choisis la voie.")),
    panel("Le wagon longe une rangée de livres gravés à même la pierre. Le prochain feu est rouge.", maya("Transmets la consigne au wagon qui nous suit.")),
    panel("L’air sent le sel. À gauche, les premières lucioles sortent à ciel ouvert.", sam("Which way?", "De quel côté ?"), maya("C’est la sortie. Envoie-lui la direction.")),
  ],
  10: [
    panel("Sur le phare, cinq tuyaux de cuivre attendent le vent. Une enveloppe t’est adressée.", sam("Deux signatures sur le même billet. Lis-le pour toute l’équipe.")),
    panel("Le gardien a accroché une copie du courrier à la fenêtre. Deux lanternes rouges y brillent déjà.", maya("Mira a distingué ce qu’ils ont déjà et ce qui manque.")),
    panel("Du haut du phare, tu vois la barque s’engager dans un chenal à deux embranchements.", sam("Le rail nous a conduits ici. Maintenant, aidons la barque à rentrer.")),
    panel("Les vitres du phare reprennent les couleurs des mondes traversés.", maya("Le port vérifie la liaison avec quatre petits signaux.")),
    panel("Le film tourne enfin jusqu’à sa dernière image. Il y manque juste la réponse de votre équipe.", sam("Two maps!", "Deux cartes !"), maya("Une pour chaque rive. Écris à la poste en notre nom.")),
  ],
};

export const logbookPanels: Record<number, Panel> = {
  1: panel("Derrière la vitre, la grande aiguille avance enfin d’un cran. La tour attend ton feu vert.", maya("Un dernier contrôle radio."), sam("Garde un œil sur la boussole du quai !")),
  2: panel("Un bourdonnement sort de la balise réparée.", sam("Elle a capté un écho."), maya("Consigne notre découverte avant de le suivre.")),
  3: panel("Les ailes tournent enfin au-dessus des nuages.", maya("Le vent ouvre une route."), sam("Finissons le carnet avant de lever l’ancre.")),
  4: panel("Une gardienne fait signe depuis le phare.", sam("Elle nous attend avec une lentille."), maya("Vérifions notre carnet avant d’accoster.")),
  5: panel("Tous les miroirs sont en place.", maya("Le port guette notre lumière."), sam("Une dernière transmission et la route se rallume.")),
  6: panel("La dernière image tremble encore sur l’écran.", sam("Ce petit timbre en forme d’aile… Je l’ai déjà vu quelque part.")),
  7: panel("Le chat quitte enfin le colis. Kit peut ouvrir la sacoche.", maya("Quand le carnet sera prêt, on pourra lire le courrier de l’île.")),
  8: panel("Sous le panier, une aiguille de fer se met à vibrer.", sam("Je crois qu’il y a une voie juste sous nos pieds.")),
  9: panel("Le rail s’arrête au bord de l’eau.", maya("Le phare est là. Je veux garder notre itinéraire dans le carnet.")),
  10: panel("Le dernier tuyau prend la lumière. Au loin, le robot du port a déroulé son écran.", sam("On leur envoie le film entier ?"), maya("Dès que notre carnet est prêt.")),
};

export function storyPanel(id: number, index: number): Panel {
  return panels[id][index] ?? logbookPanels[id];
}
