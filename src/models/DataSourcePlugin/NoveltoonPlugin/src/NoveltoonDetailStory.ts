import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';

export default class NoveltoonDetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'NoveltoonDetailStory';
    this.baseUrl = url;
  }
  clone(): IDetailStory {
    return new NoveltoonDetailStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  detailStory(title: string) {
    throw new Error('Method not implemented.');
  }
}
