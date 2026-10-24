import type { Token } from "@/lib/tokenize";

// Cümle: ., ! veya ? işaretine kadar olan kısım. Hemen arkasındaki
// kapanış tırnağı da cümleye dahil.
const SENTENCE_PATTERN = /[^.!?]+(?:[.!?]+["'’”]*|$)/g;

export function getSentence(tokens: Token[], tokenIndex: number): string {
  const text = tokens.map((token) => token.text).join("");

  let offset = 0;
  for (let i = 0; i < tokenIndex; i++) {
    offset += tokens[i].text.length;
  }

  for (const match of text.matchAll(SENTENCE_PATTERN)) {
    if (offset < match.index + match[0].length) {
      return match[0].trim();
    }
  }
  return "";
}
