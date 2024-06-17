export interface ICategoryList {
  name: string;
  baseUrl: string;
  clone(): ICategoryList;
  getBaseUrl(): string;
  categoryList(type?: string): any;
}
