import type { StaticImageData } from "next/image";
import type { Passage } from "@/lib/adventure/catalog";
import type { BoardPicture } from "@/lib/adventure/activities";
import quai from "@/public/art/passage/quai.webp";
import canopy from "@/public/art/passage/canopy.webp";
import wind from "@/public/art/passage/wind.webp";
import tide from "@/public/art/passage/tide.webp";
import observatory from "@/public/art/passage/observatory.webp";
import radio from "@/public/art/passage/quai-radio.webp";
import departure from "@/public/art/passage/quai-depart.webp";
import shelter from "@/public/art/passage/canopy-abri.webp";
import ocarina from "@/public/art/passage/wind-ocarina.webp";
import submarine from "@/public/art/passage/tide-submersible.webp";
import dome from "@/public/art/passage/observatory-reveil.webp";
import cinema from "@/public/art/passage/cinema.webp";
import post from "@/public/art/passage/post.webp";
import market from "@/public/art/passage/market.webp";
import rail from "@/public/art/passage/rail.webp";
import island from "@/public/art/passage/island.webp";
import film from "@/public/art/passage/cinema-insert.webp";
import letter from "@/public/art/passage/post-insert.webp";
import lanterns from "@/public/art/passage/market-insert.webp";
import junction from "@/public/art/passage/rail-insert.webp";
import reply from "@/public/art/passage/island-insert.webp";
import hall from "@/public/art/passage/museum-hall.webp";
import mirrors from "@/public/art/passage/museum-mirrors.webp";
import workshop from "@/public/art/passage/museum-workshop.webp";
import roof from "@/public/art/passage/museum-roof.webp";
import frame from "@/public/art/passage/museum-frame.webp";
import cloakroomDetail from "@/public/art/passage/museum-hall-insert.webp";
import mirrorsDetail from "@/public/art/passage/museum-mirrors-insert.webp";
import workshopDetail from "@/public/art/passage/museum-workshop-insert.webp";
import roofDetail from "@/public/art/passage/museum-roof-insert.webp";
import frameDetail from "@/public/art/passage/museum-frame-insert.webp";
import inventory from "@/public/art/passage/canopy-inventory.webp";
import bags from "@/public/art/passage/shelter-close.webp";
import orchard from "@/public/art/passage/refuge-orchard.webp";
import stairs from "@/public/art/passage/refuge-stairs.webp";
import kitchen from "@/public/art/passage/refuge-kitchen.webp";
import organ from "@/public/art/passage/refuge-radio.webp";
import moon from "@/public/art/passage/refuge-moon.webp";
import fruit from "@/public/art/passage/refuge-orchard-insert.webp";
import supplies from "@/public/art/passage/refuge-stairs-insert.webp";
import meal from "@/public/art/passage/refuge-kitchen-insert.webp";
import tubes from "@/public/art/passage/refuge-radio-insert.webp";
import landing from "@/public/art/passage/refuge-moon-insert.webp";
import cargo from "@/public/art/passage/refuge-cargo.webp";
import coastScreen from "@/public/art/passage/coast-screen.webp";
import coastShadow from "@/public/art/passage/coast-shadow.webp";
import coastCabin from "@/public/art/passage/coast-cabin.webp";
import coastSignal from "@/public/art/passage/coast-signal.webp";
import coastHome from "@/public/art/passage/coast-home.webp";
import gateDetail from "@/public/art/passage/coast-screen-insert.webp";
import birdDetail from "@/public/art/passage/coast-shadow-insert.webp";
import plateDetail from "@/public/art/passage/coast-cabin-insert.webp";
import signalDetail from "@/public/art/passage/coast-signal-insert.webp";
import harborDetail from "@/public/art/passage/coast-home-insert.webp";

export const passageArt = { quai, canopy, wind, tide, observatory, cinema, post, market, rail, island,
  "museum-hall": hall, "museum-mirrors": mirrors, "museum-workshop": workshop, "museum-roof": roof, "museum-frame": frame,
  "refuge-orchard": orchard, "refuge-stairs": stairs, "refuge-kitchen": kitchen, "refuge-radio": organ, "refuge-moon": moon,
  "coast-screen": coastScreen, "coast-shadow": coastShadow, "coast-cabin": coastCabin, "coast-signal": coastSignal, "coast-home": coastHome,
} satisfies Record<Passage["art"], StaticImageData>;
export const landscapeSizes = "(max-width: 1190px) 100vw, 1160px";

const cutaways = {
  gate: { src: gateDetail, alt: "Un ticket repose près de la lanterne du guichet. Entre les deux battants ouverts de la grande grille, on aperçoit la mer." },
  bird: { src: birdDetail, alt: "Sterne tient un billet roulé dans son bec. Deux étoiles dorées ornent son aile bleu-vert. Son ombre d’oiseau se détache sur la toile." },
  plates: { src: plateDetail, alt: "Deux plaques de verre reposent sur du velours bleu. Celle de gauche montre un voilier, celle de droite un croissant de lune." },
  signals: { src: signalDetail, alt: "Le boîtier du chenal porte deux grandes lentilles, une vague blanche sur fond bleu à gauche, un soleil jaune sur fond rouge à droite." },
  harbor: { src: harborDetail, alt: "Le voilier rouge est amarré au poteau du quai. Derrière sa voile, le soleil se lève et l’écran du cinéma est redevenu blanc." },
  fruit: { src: fruit, alt: "Un carnet de naturaliste présente une pomme rouge sur la page de gauche et une poire jaune sur celle de droite." },
  supplies: { src: supplies, alt: "Une carafe d’eau à gauche et une lampe à droite entourent un jeune plant dans la serre." },
  meal: { src: meal, alt: "Un bol de soupe à gauche, une louche et une miche de pain à droite attendent sur le comptoir." },
  tubes: { src: tubes, alt: "Cinq lampes colorées et un micro de cuivre forment le clavier lumineux de la radio du refuge." },
  cargo: { src: cargo, alt: "Près de la sonnette, des poires dépassent d’un sac bleu posé à côté d’une carafe pleine d’eau." },
  landing: { src: landing, alt: "Au soleil levant, Pip quitte le quai vers le verger. La sonnette, le sac bleu et la carafe sont arrivés avec lui." },
  cloakroom: { src: cloakroomDetail, alt: "Au vestiaire, un sac bleu, une carte dépliée et une clé rouge sont posés côte à côte." },
  mirrors: { src: mirrorsDetail, alt: "La galerie conserve deux médaillons. À gauche se trouve Iris, en vert. À droite se trouve Noé, le gardien à la moustache." },
  automata: { src: workshopDetail, alt: "Un héron mécanique sur ses longues pattes et une tortue chargée de bagages attendent sur l’établi." },
  roof: { src: roofDetail, alt: "Deux étoiles de cuivre reposent sur une carte bleue. Une clé rouge brille sur le carrelage sous la table." },
  frame: { src: frameDetail, alt: "Dans le tableau, Iris et son sac bleu attendent sur le quai du port. Une enveloppe rouge repose devant le cadre." },
  film: { src: film, alt: "Une bande de pellicule montre deux silhouettes, une chanteuse et un pilote." },
  letter: { src: letter, alt: "Dans la poste, une enveloppe cachetée et une broche en forme d’aile attendent dans les casiers." },
  lanterns: { src: lanterns, alt: "Les lanternes bleues sont rangées dans leur panier à côté d’une carte enroulée." },
  junction: { src: junction, alt: "Les aiguillages se divisent entre les arbres lumineux de la ligne souterraine." },
  reply: { src: reply, alt: "Depuis la fenêtre du phare, on aperçoit la route du retour. Une boussole attend près de la lettre." },
  radio: { src: radio, alt: "Dans la cabine, le voyant de la radio s’allume. Derrière le micro, l’horloge du quai est arrêtée." },
  departure: { src: departure, alt: "Depuis la tour, on voit la navette décoller. L’aiguille de la boussole indique une île verte." },
  shelter: { src: shelter, alt: "Sous un immense arbre, un parapluie orange abrite un banc avec deux sacs, un rouge et un bleu." },
  ocarina: { src: ocarina, alt: "Un ocarina bleu et une sacoche reposent sur l’établi entre les engrenages du moulin." },
  submarine: { src: submarine, alt: "Un petit sous-marin jaune tire le ferry avec un câble entre les portes de l’écluse." },
  dome: { src: dome, alt: "Les panneaux peints d’étoiles s’écartent. Au-dessus de la lentille apparaissent une aurore et le vrai ciel." },
};

export const boardPictures = {
  inventory: { src: inventory, alt: "À gauche un sac, au centre une carte et à droite une clé sont posés sur une table en bois." },
  shelter: { src: bags, alt: "Un sac rouge à gauche et un sac bleu à droite attendent sur le banc." },
  film: cutaways.film, letter: cutaways.letter, lanterns: cutaways.lanterns, cloakroom: cutaways.cloakroom,
  automata: cutaways.automata, mirrors: cutaways.mirrors, roof: cutaways.roof, frame: cutaways.frame,
  fruit: cutaways.fruit, supplies: cutaways.supplies, meal: cutaways.meal, cargo: cutaways.cargo,
  "coast-plates": cutaways.plates,
} satisfies Record<BoardPicture, { src: StaticImageData; alt: string }>;

const shots: Record<number, Partial<Record<number | "ending", keyof typeof cutaways>>> = {
  1: { 1: "radio", 2: "radio", 3: "radio", 5: "radio", ending: "departure" },
  2: { 1: "shelter", 2: "shelter", 4: "shelter" },
  3: { 1: "ocarina", 2: "ocarina", 4: "ocarina", 5: "ocarina" },
  4: { 0: "submarine", 2: "submarine", 4: "submarine", ending: "submarine" },
  5: { 1: "dome", 4: "dome", 6: "dome", ending: "dome" },
  6: { 1: "film", 2: "film", 4: "film", ending: "film" },
  7: { 1: "letter", 3: "letter", 5: "letter", ending: "letter" },
  8: { 3: "lanterns", 4: "lanterns", ending: "lanterns" },
  9: { 1: "junction", 2: "junction", 4: "junction", ending: "junction" },
  10: { 1: "reply", 3: "reply", 5: "reply", ending: "reply" },
  11: { 0: "cloakroom", 2: "cloakroom", 4: "cloakroom", ending: "cloakroom" },
  12: { 0: "mirrors", 2: "mirrors", 5: "mirrors", ending: "mirrors" },
  13: { 0: "automata", 2: "automata", 4: "automata", ending: "automata" },
  14: { 1: "roof", 3: "roof", 5: "roof", ending: "roof" },
  15: { 1: "frame", 3: "frame", 5: "frame", ending: "frame" },
  16: { 1: "fruit", 3: "fruit", 5: "fruit" },
  17: { 1: "supplies", 3: "supplies", 4: "supplies" },
  18: { 1: "meal", 3: "meal", 5: "meal" },
  19: { 1: "tubes", 3: "tubes", 5: "tubes" },
  20: { 1: "cargo", 2: "cargo", 5: "cargo", ending: "landing" },
  21: { 1: "gate", 3: "gate", 5: "gate" },
  22: { 2: "bird", 4: "bird", ending: "bird" },
  23: { 1: "plates", 3: "plates", 4: "plates", ending: "plates" },
  24: { 1: "signals", 3: "signals", 5: "signals" },
  25: { 1: "signals", 3: "signals", ending: "harbor" },
};

export function passagePicture(episode: Passage, scene: number | "ending") {
  const key = shots[episode.id]?.[scene];
  return key ? cutaways[key] : { src: passageArt[episode.art], alt: episode.alt };
}
