export interface IDataSourcePlugin {
  name: string;

  clone(name: string): IDataSourcePlugin;
  getBaseUrl(): string;

  search(title: string, page?: string, category?: string): any;
  detailStory(title: string): any;
  contentStory(title: string, chap?: string): any;
  newestStory(limiter?: number, page?: string): any;
  fullStory(limiter?: number, page?: string): any;
  hotStory(limiter?: number, page?: string): any;
  categoryList(type?: string): any;
  chapterList(title: string, page?: string): any;
  home(): any;
  newestStoryAtCategory(category: string, limiter?: number, page?: string): any;
  fullStoryAtCategory(category: string, limiter?: number, page?: string): any;
  hotStoryAtCategory(category: string, limiter?: number, page?: string): any;
  changeDetailStoryToThisDataSource(title: string): any;
}
