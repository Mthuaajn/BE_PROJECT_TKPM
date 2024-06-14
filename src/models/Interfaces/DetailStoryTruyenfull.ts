export interface DetailStoryTruyenfull {
  id: number;
  title: string;
  image: string;
  link: string;
  status: string;
  author: string;
  time: string;
  source: string;
  liked: boolean;
  total_chapters: number;
  total_like: number;
  total_view: string;
  categories: string;
  category_ids: string;
  chapters_new: string;
  new_chapters: any[]; // or specify the type of new_chapters if available
  description: string;
}
