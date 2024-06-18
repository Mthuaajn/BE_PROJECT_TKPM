import Cheerio from 'cheerio';
import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import { Category } from '~/models/Interfaces/Category';

export default class TangThuVienCategoryList implements ICategoryList {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TangThuVienCategoryList';
    this.baseUrl = url;
  }
  clone(): ICategoryList {
    return new TangThuVienCategoryList(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  private getCategoryList = (html: string) => {
    const $ = Cheerio.load(html);
    const result: Category[] = [];
    const length = $('#classify-list dd').length;
    $('#classify-list dd').each((index, element) => {
      if (index == length - 1) return;
      const link = $(element).find('a');
      if (link.length) {
        const content = link.find('span.info i').text().trim();
        const href = link.attr('href') || '';

        result.push({
          content,
          //host: this.getBaseUrl(),
          href
        });
      }
    });
    return result;
  };
  async categoryList(): Promise<any> {
    let result: Category[] = [];
    try {
      const searchString: string = `${this.getBaseUrl()}`;
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
