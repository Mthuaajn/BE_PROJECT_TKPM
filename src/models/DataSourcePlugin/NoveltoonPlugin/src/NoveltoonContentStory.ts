import { IContentStory } from '~/models/DataSourceManagement/IContentStory';

export default class NoveltoonContentStory implements IContentStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'NoveltoonContentStory';
    this.baseUrl = url;
  }
  clone(): IContentStory {
    return new NoveltoonContentStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  contentStory(title: string, chap?: string | undefined) {
    throw new Error('Method not implemented.');
  }
  chapterList(title: string, page?: string | undefined) {
    throw new Error('Method not implemented.');
  }
  changeDetailStoryToThisDataSource(title: string) {
    throw new Error('Method not implemented.');
  }
  changeContentStoryToThisDataSource(title: string, chap?: string | undefined) {
    throw new Error('Method not implemented.');
  }
}
