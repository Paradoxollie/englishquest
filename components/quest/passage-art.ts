import type { StaticImageData } from "next/image";
import type { Passage } from "@/lib/adventure/catalog";
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

export const passageArt = { quai, canopy, wind, tide, observatory, cinema, post, market, rail, island } satisfies Record<Passage["art"], StaticImageData>;
export const landscapeSizes = "(max-width: 1190px) 100vw, 1160px";

const cutaways = {
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
};

export function passagePicture(episode: Passage, scene: number | "ending") {
  const key = shots[episode.id]?.[scene];
  return key ? cutaways[key] : { src: passageArt[episode.art], alt: episode.alt };
}
