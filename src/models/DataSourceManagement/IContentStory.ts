export interface IContentStory {
  name: string;
  baseUrl: string;
  clone(): IContentStory;
  getBaseUrl(): string;

  contentStory(title: string, chap?: string): any;

  chapterList(title: string, page?: string): any;

  changeDetailStoryToThisDataSource(title: string): any;

  changeContentStoryToThisDataSource(title: string, chap?: string): any;
}
