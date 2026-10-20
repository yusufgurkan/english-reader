export type Token = {
  text: string;
  isWord: boolean;
};

const TOKEN_PATTERN = /[A-Za-z]+(?:['’][A-Za-z]+)*|[^A-Za-z]+/g;

export function tokenize(paragraph: string): Token[] {
  const parts = paragraph.match(TOKEN_PATTERN) || [];
  return parts.map((text) => ({ text, isWord: /^[A-Za-z]/.test(text) }));
}
