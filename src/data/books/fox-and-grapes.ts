import type { Book } from "@/types/book";

export const foxAndGrapes: Book = {
  id: "fox-and-grapes",
  title: "The Fox and the Grapes",
  author: "Aesop",
  level: "B1",
  source: {
    name: "Project Gutenberg",
    url: "https://www.gutenberg.org/ebooks/11339",
  },
  license: "public-domain",
  chapters: [
    {
      title: "The Fox and the Grapes",
      paragraphs: [
        "A hungry Fox saw some fine bunches of Grapes hanging from a vine that was trained along a high trellis, and did his best to reach them by jumping as high as he could into the air. But it was all in vain, for they were just out of reach: so he gave up trying, and walked away with an air of dignity and unconcern, remarking, 'I thought those Grapes were ripe, but I see now they are quite sour.'",
      ],
    },
  ],
};
