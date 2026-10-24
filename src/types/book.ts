export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type License = "public-domain" | "CC-BY-4.0" | "CC-BY-SA-4.0";

// Lisanslar atıf istiyor: Hakkında ekranında kaynağın adı ve linki gösterilecek
export type Source = {
  name: string;
  url: string;
};

export type Chapter = {
  title: string;
  paragraphs: string[];
};

export type Book = {
  id: string;
  title: string;
  // Halk masalı gibi yazarı belli olmayan kitaplarda boş bırakılır
  author?: string;
  level: Level;
  source: Source;
  license: License;
  chapters: Chapter[];
};
