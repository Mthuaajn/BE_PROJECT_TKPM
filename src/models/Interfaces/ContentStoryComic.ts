import { ChapterImage } from './ChapterImage';

export interface ContentStoryComic {
  name: string;
  title: string;
  chap: string;
  chapterTitle: string;
  author: string;
  cover: string;
  host: string;
  content: ChapterImage[];
}
