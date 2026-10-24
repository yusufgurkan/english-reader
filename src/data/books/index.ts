import type { Book } from "@/types/book";
import { foxAndGrapes } from "./fox-and-grapes";
import { hanselAndGretel } from "./hansel-and-gretel";
import { hareAndTortoise } from "./hare-and-tortoise";

export const books: Book[] = [hareAndTortoise, foxAndGrapes, hanselAndGretel];

export function getBookById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
