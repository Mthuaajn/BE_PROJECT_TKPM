import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import { DetailStory } from '~/models/Interfaces/DetailStory';
import Cheerio from 'cheerio';
export default class NoveltoonDetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'NoveltoonDetailStory';
    this.baseUrl = url;
  }
  clone(): IDetailStory {
    return new NoveltoonDetailStory(this.baseUrl);
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
    return kebabCaseStr;
  }
  private getDetailStory = (html: string, title: string) => {
    const $ = Cheerio.load(html);
    const $$ = $('.detail-top .detail-top-mask');
    const name = $$.find('.detail-top-title h1.detail-title').text().trim();
    const author = $$.find('.detail-author.web-author').text().trim();
    const cover = $$.find('.detail-top-right img').attr('src') || '';
    const description = $$.find('.detail-desc p.detail-desc-info').text().trim();
    const authorLink = this.convertString(author);
    const listCategory = $('.detail-tag-content .detail-tag-item')
      .map((index, element): { content: string; href: string } => {
        const content = $(element).find('a span').text().trim();

        const href = $(element).find('a').attr('href') || '|';
        return {
          content,
          href
        };
      })
      .filter((index, el) => el.content.toLocaleLowerCase() !== 'đã full');
    const story: DetailStory = {
      name,
      title,
      cover,
      description,
      categoryList: listCategory.get(),
      link: 'no information',
      host: `${this.getBaseUrl()}`,
      detail: 'full',
      author,
      authorLink
    };
    return story;
  };
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/vi/${title}`;
    console.log('searchString: ', searchString);
    let result: DetailStory;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getDetailStory(html, title);
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
