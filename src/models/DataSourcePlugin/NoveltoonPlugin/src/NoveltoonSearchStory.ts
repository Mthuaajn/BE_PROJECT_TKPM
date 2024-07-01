import Cheerio from 'cheerio';
import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';
import { Story } from '~/models/Interfaces/Story';

export default class NoveltoonSearchStory implements ISearchStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'NoveltoonSearchStory';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new NoveltoonSearchStory(this.baseUrl);
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

  private cutStringTitle(input: string): string {
    const result = input.split('/vi/');
    return result[1];
  }
  private convertStringToCategoryList(
    input: string,
    separate: string
  ): { content: string; href: string }[] {
    return input
      .split(separate)
      .map((el, index) => {
        const trimmedCategory = el.trim();
        return {
          content: trimmedCategory,
          href: this.convertString(trimmedCategory)
        };
      })
      .filter((el) => el.content.toLocaleLowerCase() !== 'đã full');
  }
  private getStoryForSearch = (html: string) => {
    const result: Story[] = [];
    const $ = Cheerio.load(html);
    $('.recommend-comics .recommend-item ').each((index, element) => {
      const name = $(element).find('.recommend-comics-title').text().trim();
      const link = $(element).find('a').attr('href') || '';
      const cover = $(element).find('a .comics-image img').attr('data-src') || '';
      const description = $(element).find('.comics-type span').text().trim();
      const category = this.convertStringToCategoryList(description, '/');
      const title = this.cutStringTitle(link);
      const story: Story = {
        name,
        link,
        cover,
        description: description,
        author: 'no information',
        categoryList: category,
        title,
        host: `${this.getBaseUrl()}`,
        authorLink: 'no information',
        view: 'no information'
      };
      result.push(story);
    });
    return result;
  };
  async search(title: string, page?: string | undefined, category?: string | undefined) {
    const searchString: string = `${this.getBaseUrl()}/vi/search?word=${title}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStoryForSearch(html);
      if (category) {
        result = result.filter((story) => {
          return story.categoryList.some((el) => {
            return el.content === category;
          });
        });
      }
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
}
