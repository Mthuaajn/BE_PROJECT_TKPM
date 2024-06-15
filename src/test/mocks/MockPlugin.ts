import { IDataSourcePlugin } from '~/models/DataSourceManagement/IDataSourcePlugin';

export class MockPlugin implements IDataSourcePlugin {
  name = 'MockPlugin';
  listStory: any;

  clone(name: string): IDataSourcePlugin {
    return new MockPlugin();
  }
  getBaseUrl(): string {
    return 'http://mockplugin.com';
  }
  search(title: string, page?: string, category?: string): any {
    return { title, page, category };
  }
  detailStory(title: string): any {}
  contentStory(title: string, chap?: string): any {}
  categoryList(type?: string): any {}
  chapterList(title: string, page?: string): any {}
  selectStoryList(type: string, limiter?: number, page?: string): any {}
  home(): any {}
  newestStoryAtCategory(category: string, limiter?: number, page?: string): any {}
  fullStoryAtCategory(category: string, limiter?: number, page?: string): any {}
  hotStoryAtCategory(category: string, limiter?: number, page?: string): any {}
  changeDetailStoryToThisDataSource(title: string): any {}
  changeContentStoryToThisDataSource(title: string, chap?: string): any {}
}
