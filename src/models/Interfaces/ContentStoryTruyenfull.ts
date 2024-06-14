export interface ContentStoryTruyenfull {
  chapter_id: number;
  story_id: number;
  story_name: string;
  chapter_name: string;
  chapter_next: number | null;
  chapter_prev: number | null;
  has_image: boolean;
  position: number;
  current_page: number;
  content: string;
}
