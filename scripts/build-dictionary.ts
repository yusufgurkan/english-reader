// Kitaplardaki kelimeler için internetsiz sözlüğü üretir.
//
// Çalıştırma: npm run build:dictionary
// Girdi:  data-raw/ içindeki Vikisözlük verileri (kaikki.org, CC BY-SA)
//         - tr-wiktionary-english.jsonl: İngilizce kelimelerin Türkçe anlamları
//         - en-wiktionary-english.jsonl: Türkçe çeviriler ve çekim bilgisi
// Çıktı:  src/data/dictionary.json (sadece kitaplarda geçen kelimeler)

import { createReadStream, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { tokenize } from "../src/lib/tokenize.ts";
import type { Book } from "../src/types/book.ts";
import type {
  Dictionary,
  DictionaryForm,
  DictionarySense,
  PartOfSpeech,
} from "../src/types/dictionary.ts";

const ROOT = join(import.meta.dirname, "..");
const TR_DATA = join(ROOT, "data-raw", "tr-wiktionary-english.jsonl");
const EN_DATA = join(ROOT, "data-raw", "en-wiktionary-english.jsonl");
const BOOKS_DIR = join(ROOT, "src", "data", "books");
const OUTPUT = join(ROOT, "src", "data", "dictionary.json");

// Her türde en fazla kaç anlam gösterilsin
const MAX_MEANINGS = 5;

// Verideki İngilizce tür adları → ekranda gösterilecek Türkçe adlar
const POS_NAMES: Record<string, PartOfSpeech> = {
  noun: "isim",
  verb: "fiil",
  adj: "sıfat",
  adv: "zarf",
  pron: "zamir",
  prep: "edat",
  conj: "bağlaç",
  intj: "ünlem",
  det: "belirteç",
  article: "belirteç",
  num: "sayı",
};

// Bu etiketli çekim kayıtları atlanır: "book", kuzey İngiltere lehçesinde
// "bake"in geçmiş zamanıymış; kullanıcıya "pişirmek" göstermek yanlış olur
const SKIPPED_FORM_TAGS = [
  "dialectal",
  "colloquial",
  "obsolete",
  "archaic",
  "nonstandard",
  "misspelling",
  "rare",
];

// Türkçe Vikisözlük'te özel isim olduğunu gösteren anlamlar
const NAME_GLOSS = /soyadı|erkek adı|kadın adı|kız adı|yer adı|özel ad/i;

// "grape sözcüğünün çoğul çekimi" gibi açıklamalar anlam değil, çekim
// bilgisi; onu İngilizce veriden daha düzenli alıyoruz
const FORM_GLOSS = /sözcüğünün/i;

// --- Verideki kayıtların ihtiyacımız olan kısmı ---

type RawSense = {
  glosses?: string[];
  tags?: string[];
  form_of?: { word: string }[];
  translations?: RawTranslation[];
};

type RawTranslation = { lang_code?: string; word?: string };

type RawEntry = {
  word: string;
  pos: string;
  senses?: RawSense[];
  // Çeviriler bazı kayıtlarda en üstte, çoğunda her anlamın içinde duruyor
  translations?: RawTranslation[];
};

// --- Yardımcılar ---

function normalize(word: string): string {
  return word.toLowerCase().replace(/’/g, "'");
}

function toPos(pos: string): PartOfSpeech {
  return POS_NAMES[pos] ?? "diğer";
}

// "bahse girmek, şart bağlamak." → ["bahse girmek", "şart bağlamak"]
// Uzun açıklamalar ("the" için bir paragraf) bölünmez, ilk cümlesi alınır
function splitGloss(gloss: string): string[] {
  if (gloss.length > 80) return [gloss.split(/\.\s/)[0].replace(/\.$/, "")];
  return gloss
    .split(/[,;]\s+/)
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter((part) => part.length > 0);
}

// Çekim etiketlerini öğrencinin anlayacağı Türkçe bir açıklamaya çevirir
function formLabel(tags: string[]): string | null {
  const has = (tag: string) => tags.includes(tag);
  if (has("plural")) return "çoğul";
  if (has("past") && has("participle")) return "geçmiş zaman ortacı (V3)";
  if (has("present") && has("participle")) return "-ing hâli";
  if (has("past")) return "geçmiş zaman";
  if (has("third-person") && has("singular")) return "he/she/it ile geniş zaman";
  if (has("comparative")) return "karşılaştırma (daha …)";
  if (has("superlative")) return "en üstünlük (en …)";
  return null;
}

// "SAW", "UK" gibi tamamı büyük harfli kısaltmalar: küçük harfe çevrilince
// "saw" ile karışıyorlar, o yüzden hiç almıyoruz
function isAcronym(word: string): boolean {
  // Tek büyük harfli kayıtlar da ("A": Amber, Alert Area…) kısaltma; "I" (ben) hariç
  return /^[A-Z0-9.]{2,}$/.test(word) || (/^[A-Z]$/.test(word) && word !== "I");
}

// Latin alfabesi dışında yazı içeren anlamlar (Arapça vb.) okuyucuya yaramaz
const NON_LATIN = /[^\u0000-\u024F\u1E00-\u1EFF\u2000-\u206F\s]/;

// Anlamı temizler; kullanılamazsa null döner
function cleanMeaning(meaning: string): string | null {
  const text = meaning.trim();
  if (text.length === 0 || NON_LATIN.test(text)) return null;
  if (text.length > 120) return null;
  return text;
}

// Türe göre gruplu anlamlar: Map<"fiil", ["koşmak", ...]>
type SenseMap = Map<PartOfSpeech, string[]>;

function addMeanings(map: SenseMap, pos: PartOfSpeech, meanings: string[]) {
  const list = map.get(pos) ?? [];
  for (const raw of meanings) {
    if (list.length >= MAX_MEANINGS) break;
    const meaning = cleanMeaning(raw);
    if (meaning && !list.includes(meaning)) list.push(meaning);
  }
  if (list.length > 0) map.set(pos, list);
}

function toSenses(
  map: SenseMap | undefined,
  onlyPos?: PartOfSpeech,
  word?: string,
): DictionarySense[] {
  if (!map) return [];
  return [...map.entries()]
    .filter(([pos]) => onlyPos === undefined || pos === onlyPos)
    .map(([pos, meanings]) => ({
      pos,
      // "hansel → Hansel" gibi kelimeyi tekrar eden "anlamlar" işe yaramaz
      meanings: meanings.filter((m) => normalize(m) !== word),
    }))
    .filter((sense) => sense.meanings.length > 0);
}

// JSONL dosyasını satır satır okur (3 GB'lık dosya belleğe sığmaz).
// readline kullanmıyoruz: o, metinlerin içindeki U+2028/U+2029 karakterlerini
// de satır sonu sayıp JSON satırlarını ortadan bölüyor. Biz sadece \n'e bakıyoruz.
async function* readLines(file: string): AsyncGenerator<string> {
  let rest = "";
  for await (const chunk of createReadStream(file, { encoding: "utf8" })) {
    const parts = (rest + chunk).split("\n");
    rest = parts.pop() ?? "";
    for (const line of parts) {
      if (line.trim().length > 0) yield line;
    }
  }
  if (rest.trim().length > 0) yield rest;
}

// --- 1. Kitaplardaki kelimeleri topla ---

async function collectBookWords(): Promise<Set<string>> {
  const files = readdirSync(BOOKS_DIR).filter(
    (file) => file.endsWith(".ts") && file !== "index.ts",
  );
  const words = new Set<string>();
  for (const file of files) {
    const module = await import(pathToFileURL(join(BOOKS_DIR, file)).href);
    for (const book of Object.values(module) as Book[]) {
      for (const paragraph of book.chapters.flatMap((chapter) => chapter.paragraphs)) {
        for (const token of tokenize(paragraph)) {
          if (token.isWord) words.add(normalize(token.text));
        }
      }
    }
  }
  return words;
}

// --- 2. İngilizce Vikisözlük: Türkçe çeviriler ve çekimler ---

type FormInfo = { lemma: string; label: string; pos: PartOfSpeech };

async function readEnglishData(bookWords: Set<string>) {
  const translations = new Map<string, SenseMap>();
  const forms = new Map<string, FormInfo[]>();
  const names = new Set<string>();
  // Ana kelimeyi JSON'u çözmeden bulmak için: satırların çoğunu atlayıp hız kazanıyoruz
  const headword = /"word": "((?:[^"\\]|\\.)*)", "lang": "English"/;

  let lineCount = 0;
  for await (const line of readLines(EN_DATA)) {
    lineCount++;
    if (lineCount % 200_000 === 0) console.log(`  İngilizce veri: ${lineCount} satır`);

    const match = headword.exec(line);
    const word = match ? normalize(JSON.parse(`"${match[1]}"`)) : null;
    const isBookWord = word !== null && bookWords.has(word);
    const hasTurkish = line.includes('"lang_code": "tr"');
    if (match && !isBookWord && !hasTurkish) continue;

    const entry = JSON.parse(line) as RawEntry;
    if (isAcronym(entry.word)) continue;
    const key = normalize(entry.word);
    const pos = toPos(entry.pos);

    const allTranslations = [
      ...(entry.translations ?? []),
      ...(entry.senses ?? []).flatMap((sense) => sense.translations ?? []),
    ];
    const turkish = allTranslations
      .filter((t) => t.lang_code === "tr" && t.word)
      .map((t) => t.word as string);
    if (turkish.length > 0) {
      const map = translations.get(key) ?? new Map();
      addMeanings(map, pos, turkish);
      translations.set(key, map);
    }

    if (!bookWords.has(key)) continue;
    // Büyük harfle yazılan özel isim kayıtları ("Ran", "Hansel")
    if (entry.pos === "name") names.add(key);

    for (const sense of entry.senses ?? []) {
      const tags = sense.tags ?? [];
      if (!sense.form_of || tags.some((tag) => SKIPPED_FORM_TAGS.includes(tag))) continue;
      const label = formLabel(tags);
      if (!label) continue;
      for (const { word: lemma } of sense.form_of) {
        const list = forms.get(key) ?? [];
        const lemmaKey = normalize(lemma);
        if (!list.some((f) => f.lemma === lemmaKey && f.label === label)) {
          list.push({ lemma: lemmaKey, label, pos });
        }
        forms.set(key, list);
      }
    }
  }
  console.log(`  İngilizce veri bitti: ${lineCount} satır`);
  return { translations, forms, names };
}

// --- 3. Türkçe Vikisözlük: Türkçe anlamlar ---

async function readTurkishData(neededWords: Set<string>) {
  const meanings = new Map<string, SenseMap>();
  const names = new Map<string, string[]>();

  for await (const line of readLines(TR_DATA)) {
    const entry = JSON.parse(line) as RawEntry;
    if (isAcronym(entry.word)) continue;
    const key = normalize(entry.word);
    if (!neededWords.has(key)) continue;

    const pos = toPos(entry.pos);
    for (const sense of entry.senses ?? []) {
      for (const gloss of sense.glosses ?? []) {
        if (FORM_GLOSS.test(gloss)) continue;
        if (entry.pos === "name" || NAME_GLOSS.test(gloss)) {
          const list = names.get(key) ?? [];
          const cleaned = gloss.replace(/\.$/, "");
          if (!list.includes(cleaned)) list.push(cleaned);
          names.set(key, list);
          continue;
        }
        const map = meanings.get(key) ?? new Map();
        addMeanings(map, pos, splitGloss(gloss));
        meanings.set(key, map);
      }
    }
  }
  return { meanings, names };
}

// "quietly" → "quiet", "happily" → "happy", "terribly" → "terrible"
function lyBase(word: string): string | null {
  if (!word.endsWith("ly") || word.length < 5) return null;
  if (word.endsWith("ily")) return word.slice(0, -3) + "y";
  if (word.endsWith("bly")) return word.slice(0, -1) + "e";
  return word.slice(0, -2);
}

// Vikisözlük'te Türkçe karşılığı olmayan birkaç kelime. Bu açıklamaları
// biz yazdık; lisans gerektirmez.
const MANUAL_ENTRIES: Dictionary = {
  "i'll": {
    senses: [{ pos: "diğer", meanings: ["I will'in kısaltması: (ben) …-eceğim"] }],
    forms: [],
    names: [],
  },
  shall: {
    senses: [
      {
        pos: "fiil",
        meanings: [
          "-ecek, -acak (gelecek zaman; eski ve resmî)",
          "Shall we …? = …-elim mi?",
        ],
      },
    ],
    forms: [],
    names: [],
  },
};

// --- 4. Birleştir ---

// Önce Türkçe Vikisözlük'ün açıklamaları, eksik kalan türlere İngilizce
// Vikisözlük'ün Türkçe çevirileri
function mergeSenses(tr: SenseMap | undefined, en: SenseMap | undefined): SenseMap {
  const merged: SenseMap = new Map();
  for (const source of [tr, en]) {
    for (const [pos, list] of source ?? []) addMeanings(merged, pos, list);
  }
  return merged;
}

async function main() {
  console.log("1/4 Kitaplardaki kelimeler toplanıyor...");
  const bookWords = await collectBookWords();
  console.log(`  ${bookWords.size} farklı kelime`);

  console.log("2/4 İngilizce Vikisözlük okunuyor (birkaç dakika sürebilir)...");
  const en = await readEnglishData(bookWords);

  // Kökleri de sözlüğe bakılacak kelimelere ekle ("ran" → "run")
  const neededWords = new Set(bookWords);
  for (const list of en.forms.values()) for (const form of list) neededWords.add(form.lemma);
  // "hansel's" gibi iyelik ekli kelimelerin kökü
  for (const word of bookWords) if (word.endsWith("'s")) neededWords.add(word.slice(0, -2));
  // "quietly" gibi zarfların sıfat kökü
  for (const word of bookWords) {
    const base = lyBase(word);
    if (base) neededWords.add(base);
  }

  console.log("3/4 Türkçe Vikisözlük okunuyor...");
  const tr = await readTurkishData(neededWords);

  console.log("4/4 Sözlük birleştiriliyor...");
  const sensesOf = (word: string) =>
    mergeSenses(tr.meanings.get(word), en.translations.get(word));

  const dictionary: Dictionary = {};
  const missing: string[] = [];

  for (const word of [...bookWords].sort()) {
    const forms: DictionaryForm[] = [];
    for (const form of en.forms.get(word) ?? []) {
      const senses = toSenses(sensesOf(form.lemma), form.pos);
      if (senses.length === 0) continue;
      // "put": hem geçmiş zaman hem V3 → tek satırda "geçmiş zaman / V3"
      const same = forms.find((f) => f.lemma === form.lemma);
      if (same) same.label += " / " + form.label;
      else forms.push({ lemma: form.lemma, label: form.label, senses });
    }

    if (word.endsWith("'s") && forms.length === 0) {
      const lemma = word.slice(0, -2);
      const senses = toSenses(sensesOf(lemma));
      if (senses.length > 0) forms.push({ lemma, label: "iyelik ('s)", senses });
    }

    const senses = toSenses(sensesOf(word), undefined, word);

    // Kelimenin kendi kaydı yoksa: sıfattan -ly ile türemiş zarf mı?
    const base = lyBase(word);
    if (senses.length === 0 && forms.length === 0 && base) {
      const adjective = toSenses(sensesOf(base), "sıfat");
      if (adjective.length > 0) {
        forms.push({ lemma: base, label: "-ly ile zarf (… bir şekilde)", senses: adjective });
      }
    }

    const manual = MANUAL_ENTRIES[word];
    if (manual) {
      dictionary[word] = manual;
      continue;
    }

    const names = tr.names.get(word) ?? (en.names.has(word) ? ["özel isim"] : []);

    if (senses.length === 0 && forms.length === 0 && names.length === 0) {
      missing.push(word);
      continue;
    }
    dictionary[word] = { senses, forms, names };
  }

  writeFileSync(OUTPUT, JSON.stringify(dictionary, null, 1) + "\n");

  const found = Object.keys(dictionary).length;
  const percent = ((100 * found) / bookWords.size).toFixed(1);
  console.log(`\nSözlük yazıldı: ${OUTPUT}`);
  console.log(`Kapsama: ${found}/${bookWords.size} kelime (%${percent})`);
  console.log(`Bulunamayan (${missing.length}): ${missing.join(", ")}`);
}

await main();
