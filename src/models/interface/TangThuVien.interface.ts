export interface Category {
  content: string;
  numberStory: string;
  href: string;
}
export interface Story {
  name: string;
  cover: string;
  description: string;
  author: string;
  category: string;
  status: string;
  update: string;
  totalChapter: number;
}

export interface DetailStory {
  name: string;
  cover: string;
  description: string;
  author: string;
  category: string;
  status: string;
  update: string;
  follow: string;
  like: string;
  view: string;
  totalChapter: number;
  poster: string;
}

export interface ContentStory {
  name: string;
  title: string;
  chap: string;
  chapterTitle: string;
  content: string;
  author: string;
  datePost: string;
}

export interface ListChapter {
  title: string;
  host: string;
  maxChapter: number;
  listChapter: {
    content: string;
    href: string;
  }[];
}
