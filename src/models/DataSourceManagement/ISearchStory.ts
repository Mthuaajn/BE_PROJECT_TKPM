export interface ISearchStory {
  name: string;
  baseUrl: string;
  clone(): ISearchStory;
  getBaseUrl(): string;
  search(title: string, page?: string, category?: string): any;
}
