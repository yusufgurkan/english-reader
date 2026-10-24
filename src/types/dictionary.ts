// Kelime türleri, ekranda Türkçe adıyla gösterilir
export type PartOfSpeech =
  | "isim"
  | "fiil"
  | "sıfat"
  | "zarf"
  | "zamir"
  | "edat"
  | "bağlaç"
  | "ünlem"
  | "belirteç"
  | "sayı"
  | "diğer";

// Bir türdeki Türkçe anlamlar: { pos: "fiil", meanings: ["koşmak", "kaçmak"] }
export type DictionarySense = {
  pos: PartOfSpeech;
  meanings: string[];
};

// Çekimli bir kelimenin kökü: "ran" için { lemma: "run", label: "geçmiş zaman" }
export type DictionaryForm = {
  lemma: string;
  label: string;
  senses: DictionarySense[];
};

export type DictionaryEntry = {
  // Kelimenin kendi anlamları
  senses: DictionarySense[];
  // Kelime başka bir kelimenin çekimiyse, kökü ve kökün anlamları
  forms: DictionaryForm[];
  // "Bir soyadı" gibi özel isim anlamları; sadece kelime metinde büyük
  // harfle geçiyorsa gösterilir
  names: string[];
};

// Anahtar: kelimenin küçük harfli hâli ("ran", "i'll")
export type Dictionary = Record<string, DictionaryEntry>;
