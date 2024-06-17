import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';

export default class TangThuVienDetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TangThuVienDetailStory';
    this.baseUrl = url;
  }
  clone(): IDetailStory {
    return new TangThuVienDetailStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  detailStory(title: string) {
    throw new Error('Method not implemented.');
  }
}
