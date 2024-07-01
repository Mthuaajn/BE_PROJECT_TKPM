import { Category } from './Category';

export interface Story {
  name: string;
  link: string;
  title: string;
  cover: string;
  description: string;
  host: string;
  author: string;
  authorLink: string;
  view: string;
  categoryList: Category[];
  format?: string;
}
