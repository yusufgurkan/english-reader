import AsyncStorage from "@react-native-async-storage/async-storage";

// Her kitap için ayrı anahtar: "readingPosition:hansel-and-gretel" gibi
function storageKey(bookId: string): string {
  return `readingPosition:${bookId}`;
}

// Kaldığı paragrafın numarası; kayıt yoksa ya da bozuksa 0 (baş)
export async function loadReadingPosition(bookId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(bookId));
    const index = Number(raw);
    return raw !== null && Number.isInteger(index) && index >= 0 ? index : 0;
  } catch (error) {
    console.warn("Okuma konumu okunamadı", error);
    return 0;
  }
}

export async function saveReadingPosition(
  bookId: string,
  paragraphIndex: number,
): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(bookId), String(paragraphIndex));
  } catch (error) {
    console.warn("Okuma konumu kaydedilemedi", error);
  }
}
