import Cheerio from 'cheerio';
import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import { Category } from '~/models/Interfaces/Category';
import { DetailStory } from '~/models/Interfaces/DetailStory';

export default class TangThuVienDetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TangThuVienDetailStory';
    this.baseUrl = url;
  }
  clone(): IDetailStory {
    return new TangThuVienDetailStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  private removeVietnameseAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
  private convertString(input: string): string {
    // Chuyển đổi chuỗi về chữ thường
    const lowerCaseStr = input.toLowerCase();

    // Bỏ dấu tiếng Việt
    const noAccentsStr = this.removeVietnameseAccents(lowerCaseStr);

    // Thay thế các dấu cách bằng dấu gạch ngang
    const kebabCaseStr = noAccentsStr.split(' ').join('-');

    // Chỉ giữ lại các ký tự chữ thường và dấu gạch ngang
    const validStr = kebabCaseStr.replace(/[^a-z-]/g, '');

    return validStr;
  }
  private getDetailStory = (html: string, searchString: string, title: string) => {
    const result: DetailStory[] = [];
    const $ = Cheerio.load(html);
    const name = $('.book-info h1 ').text().trim();
    const link = searchString;
    const host = this.getBaseUrl();
    const cover = $('.book-img a img').attr('src') || '';
    const description = $('.book-info-detail .book-intro p').text().trim();
    const author = $('.tag a.blue').text().trim();
    const authorLink = this.convertString(author);
    const categoryList: Category[] = [];
    // method eq(1) lấy element thứ 2 xuất hiện
    const category = $('.tag a.red').eq(0).text().trim();
    categoryList.push({ content: category, href: this.convertString(category) });

    const story: DetailStory = {
      name,
      title: title,
      link,
      cover,
      description,
      author,
      authorLink,
      categoryList,
      host,
      detail: 'full'
    };
    return story;
  };
  async detailStory(title: string) {
    const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
    let result: DetailStory;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getDetailStory(html, searchString, title);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
}
