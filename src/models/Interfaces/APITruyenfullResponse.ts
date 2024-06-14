import { StoryTruyenfull } from './StoryTruyenfull';

export interface APITruyenfullResponse {
  status: string;
  message: string;
  status_code: number;
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: {
        previous: string;
        next: string;
      };
    };
  };
  data: StoryTruyenfull[];
}
