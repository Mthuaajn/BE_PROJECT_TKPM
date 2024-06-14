import { ChapterItem } from './ChapterItem';

export interface PartialChapterPagination {
  maxPage: number;
  chapterPerPage: number;
  chapters: ChapterItem[];
}
