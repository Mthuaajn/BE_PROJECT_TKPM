export interface IDataSourcePlugin {
  name: string;

  search(title: string, page?: string): any;
  clone(name: string): IDataSourcePlugin;
  getBaseUrl(): string;
}
