import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import cheerio from 'cheerio';
import { Category } from '~/models/Interfaces/Category';

export default class TruyenfullCategoryList implements ICategoryList {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TruyenfullCategoryList';
    this.baseUrl = url;
  }
  public clone(): ICategoryList {
    return new TruyenfullCategoryList(this.baseUrl);
  }
  public getBaseUrl(): string {
    return this.baseUrl;
  }
  public async categoryList(type?: string): Promise<any> {
    const searchString: string = `https://truyenfull.vn/`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });

      if (response.ok) {
        const text = await response.text();
        const data: Category[] = [];

        const $ = cheerio.load(text);
        $('.dropdown-menu ul li a').each((index, element) => {
          const content = $(element).text().trim();
          const href = $(element).attr('href') || '';

          data.push({
            content,
            href
          });
        });
        //console.log(data)
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
