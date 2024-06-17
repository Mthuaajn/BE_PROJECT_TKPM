import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';

export default class NoveltoonCategoryList implements ICategoryList {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'NoveltoonCategoryList';
    this.baseUrl = url;
  }
  clone(): ICategoryList {
    return new NoveltoonCategoryList(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  categoryList(type?: string | undefined) {
    throw new Error('Method not implemented.');
  }
}
