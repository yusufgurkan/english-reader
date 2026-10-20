import type { Book } from "@/types/book";
import { foxAndGrapes } from "./fox-and-grapes";
import { hareAndTortoise } from "./hare-and-tortoise";

export const books: Book[] = [hareAndTortoise, foxAndGrapes];

export function getBookById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
