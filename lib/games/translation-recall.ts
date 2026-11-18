/** Common equivalents for the senses used in the two translation games. */
const variants: Record<string, string[]> = {
  behaviour: ["behavior"], bookshop: ["bookstore"], film: ["movie"],
  fridge: ["refrigerator"], grey: ["gray"], holiday: ["vacation", "holidays"],
  holidays: ["vacation", "holiday"], neighbour: ["neighbor"],
  "on holiday": ["on vacation"], organise: ["organize"], practise: ["practice"],
  realise: ["realize"], rubber: ["eraser"], shop: ["store"], trousers: ["pants"],
};

export function translationAnswers(word: string): string[] {
  const alternative = variants[word.trim().toLowerCase()];
  return Array.isArray(alternative) ? [word, ...alternative] : [word];
}
