import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';
export default class TangThuVienSearchStory implements ISearchStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'TangThuVienSearchStory';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new TangThuVienSearchStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  search(title: string, page?: string | undefined, category?: string | undefined) {
    throw new Error('Method not implemented.');
  }
}
