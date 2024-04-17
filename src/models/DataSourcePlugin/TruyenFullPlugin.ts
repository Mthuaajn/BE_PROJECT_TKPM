import { IDataSourcePlugin } from '../DataSource/IDataSourcePlugin';

export default class TruyenFull implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://truyenfull.com';
  public constructor(name: string) {
    this.name = name;
  }
  getBaseUrl(): string {
    return TruyenFull.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new TruyenFull(name);
  }
  public async search(title: string, page?: string): Promise<any> {}
}
