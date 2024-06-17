import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';

export default class TangThuVienCategoryList implements ISearchStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TangThuVienCategoryList';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new TangThuVienCategoryList(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  search(title: string, page?: string | undefined, category?: string | undefined) {
    throw new Error('Method not implemented.');
  }
}
