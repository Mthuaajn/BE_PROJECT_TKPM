export interface IDataSourcePlugin {
  name: string;

  clone(name: string): IDataSourcePlugin;
  getBaseUrl(): string;

  search(title: string, page?: string): any;
  detailStory(title: string): any;
  contentStory(title: string, chap?: string): any;
}
