import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import cheerio from 'cheerio';
import { Category } from '~/models/Interfaces/Category';

export default class Truyen123CategoryList implements ICategoryList {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'Truyen123CategoryList';
    this.baseUrl = url;
  }
  clone(): ICategoryList {
    return new Truyen123CategoryList(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public async categoryList(): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });

      if (response.ok) {
        const text = await response.text();
        const data: Category[] = [];

        const $ = cheerio.load(text);
        $('.list-cat-inner a').each((index, element) => {
          const content = $(element).text().trim();
          const href = $(element).attr('href')?.split('/').pop() || '';

          data.push({
            content,
            href
            //host: this.getBaseUrl()
          });
        });

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
