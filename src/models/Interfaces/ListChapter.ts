import { ChapterItem } from './ChapterItem';

export interface ListChapter {
  title: string;
  host: string;
  maxChapter: number;
  currentPage: number;
  maxPage: number;
  chapterPerPage: number;
  listChapter: ChapterItem[];
}
