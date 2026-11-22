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
    panel("La radio de bord crépite.",
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
    panel("La pluie commence. Deux sacs attendent sous un parapluie.",
      sam("Lequel on emporte ?"), maya("J’ai laissé un mot pour qu’on retrouve le bon.")),
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
    panel("Le meunier cherche son ocarina pour réveiller les voiles.",
      sam("Je l’ai entendu ce matin."), maya("Son propriétaire a laissé un inventaire.")),
    panel("Une voix traverse les pales du moulin.",
      sam("Qui a pris la carte pour la traversée ?"), maya("Approche la radio. Mon message arrive.")),
    panel("Le meunier déplie ses plans sur le balcon.",
      maya("I have the tools.", "J’ai les outils."), sam("Et qui a la clé ? Écrivons au meunier.")),
    panel("Les ailes frémissent. Quatre signaux passent dans les engrenages.",
      sam("Listen to the wind!", "Écoute le vent !"), maya("Remets les messages dans le bon inventaire.")),
    panel("La serrure du moulin s’allume en bleu.",
      maya("Le meunier te demande ce que tu transportes."), sam("C’est à toi de lui répondre.")),
  ],
  4: [
    panel("Le vent dépose la navette sur un canal qui déborde.",
      sam("Where’s my map?", "Où est ma carte ?"), maya("Les objets trouvés du port tiennent un carnet.")),
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
      maya("We’re here!", "Nous y sommes !"), sam("Voilà le dôme qu’on cherchait depuis le quai. Ouvrons le registre.")),
    panel("Au plafond, un ciel étoilé dissimule le mécanisme.",
      sam("Do we have a map?", "Est-ce qu’on a un plan ?"), maya("Regarde, un mot du gardien.")),
    panel("Une dernière serrure sépare l’équipe du télescope.",
      maya("J’ai les étiquettes pour livrer les clés."), sam("Je t’indique par radio laquelle prendre.")),
    panel("Le télescope reçoit quatre signaux des mondes traversés.",
      sam("Je reconnais la fréquence du port."), maya("Aligne les signaux. Je tourne la roue.")),
    panel("La roue s’arrête à un cran de la bonne étoile.",
      maya("Il me faut la clé bleue."), sam("Envoie sa position exacte.")),
    panel("Le faisceau attend le dernier message de l’équipage.",
      sam("Your turn, Nova.", "À toi, Nova."), maya("Présente-toi, puis dis-moi où est la clé. On pourra rentrer.")),
  ],
};

export const logbookPanels: Record<number, Panel> = {
  1: panel("La tour attend le feu vert pour le décollage.", maya("Un dernier contrôle radio."), sam("Après ça, cap sur la forêt !")),
  2: panel("Un bourdonnement sort de la balise réparée.", sam("Elle a capté un écho."), maya("Consigne notre découverte avant de le suivre.")),
  3: panel("Les ailes tournent enfin au-dessus des nuages.", maya("Le vent ouvre une route."), sam("Finissons le carnet avant de lever l’ancre.")),
  4: panel("Une gardienne fait signe depuis le phare.", sam("Elle nous attend avec une lentille."), maya("Vérifions notre carnet avant d’accoster.")),
  5: panel("Tous les miroirs sont en place.", maya("Le port guette notre lumière."), sam("Une dernière transmission et la route se rallume.")),
};

export function storyPanel(id: number, index: number): Panel {
  return panels[id][index] ?? logbookPanels[id];
}
