import { vocabularyTopics } from "./words/vocabulary-topics";

export function expandWordfallVocabulary<T extends { translations: Record<string, string>; levels: Record<string, number> }>(original: T) {
  const translations: Record<string, string> = { ...original.translations };
  const levels: Record<string, number> = { ...original.levels };
  for (const [, level, entries] of vocabularyTopics) {
    for (const [english, french] of entries) {
      const key = english.toUpperCase();
      if (translations[key]) continue;
      translations[key] = french;
      levels[key] = level;
    }
  }
  return { ...original, translations, levels };
}
