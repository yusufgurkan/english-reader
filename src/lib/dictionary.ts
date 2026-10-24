import dictionaryData from "@/data/dictionary.json";
import type { Dictionary, DictionaryEntry } from "@/types/dictionary";

// JSON dosyası scripts/build-dictionary.ts ile üretiliyor
const dictionary = dictionaryData as Dictionary;

// Sözlükte anahtarlar küçük harfli ve düz kesme işaretli ("i'll")
export function lookupWord(word: string): DictionaryEntry | undefined {
  return dictionary[word.toLowerCase().replace(/’/g, "'")];
}
