import Cheerio from 'cheerio';
import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import { Category } from '~/models/Interfaces/Category';

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
  private getCategoryList = (html: string) => {
    const $ = Cheerio.load(html);
    const result: Category[] = [];
    const length = $('.channel-list a').length;
    $('.channel-list a').each((index, element) => {
      if (index == 0) return;
      const content = $(element).find('.channel').text().trim();
      const href = $(element).attr('href') || '';
      result.push({
        content,
        //host: `${this.getBaseUrl()}`,
        href
      });
    });
    return result;
  };
  async categoryList(): Promise<Category[]> {
    let result: Category[] = [];
    try {
      const searchString: string = `${this.getBaseUrl()}vi/genre/novel`;
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getCategoryList(html);
    } catch (err) {
      console.log(err);
    }

    return result;
  }
}
