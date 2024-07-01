import { Category } from './Category';

export interface DetailStory {
  name: string;
  title: string;
  cover: string;
  link: string;
  author: string;
  authorLink: string;
  detail: string;
  host: string;
  categoryList: Category[];
  description: string;
  format?: string;
}
