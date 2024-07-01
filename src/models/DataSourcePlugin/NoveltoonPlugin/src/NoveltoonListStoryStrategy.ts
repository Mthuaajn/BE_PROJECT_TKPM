import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import cheerio from 'cheerio';
import { Story } from '~/models/Interfaces/Story';
import { removeVietnameseAccents } from '~/utils/StringUtility';
function convertStringToCategoryList(
  input: string,
  separate: string
): { content: string; href: string }[] {
  return input
    .split(separate)
    .map((el, index) => {
      const trimmedCategory = el.trim();
      return {
        content: trimmedCategory,
        href: convertString(trimmedCategory)
      };
    })
    .filter((el) => el.content.toLocaleLowerCase() !== 'đã full');
}
function convertString(input: string): string {
  // Chuyển đổi chuỗi về chữ thường
  const lowerCaseStr = input.toLowerCase();

  // Bỏ dấu tiếng Việt
  const noAccentsStr = removeVietnameseAccents(lowerCaseStr);

  // Thay thế các dấu cách bằng dấu gạch ngang
  const kebabCaseStr = noAccentsStr.split(' ').join('-');
  return kebabCaseStr;
}
function cutStringTitle(input: string): string {
  const result = input.split('/vi/');
  return result[1];
}
export default class NoveltoonListStoryStrategy implements IListStoryStrategy {
  name: string;
  listStoryMap: Map<string, (limiter?: number | undefined, page?: string | undefined) => any>;
  baseUrl: string;
  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'NoveltoonListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();

    this.register('hot', this.hotStory);
    this.register('newest', this.newestStory);
    this.register('full', this.fullStory);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  clone(): IListStoryStrategy {
    return new NoveltoonListStoryStrategy(this.baseUrl);
  }
  private getStory = (html: string, limiter?: number) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);
    $('.genre-content a.genre-item-box').each((index, element) => {
      if (limiter && index >= limiter) return;
      const name = $(element).find('.genre-item-info p.genre-item-title').text().trim();
      const link = $(element).attr('href') || '';
      const cover = $(element).find('.genre-item-image img').attr('src') || '';
      const description = $(element).find('.genre-item-label').text().trim();
      const category = convertStringToCategoryList(description, '|');
      const title = cutStringTitle(link);
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
  public newestStory = async (limiter?: number, page?: string): Promise<any> => {
    const searchString = `${this.getBaseUrl()}//vi/genre/2/0/1?page=${page || 0}`;
    let result: Story[];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  };
  public fullStory = async (limiter?: number, page?: string): Promise<any> => {
    const searchString = `${this.getBaseUrl()}//vi/genre/2/0/2?page=${page || 0}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  };
  public hotStory = async (limiter?: number, page?: string): Promise<any> => {
    const searchString = `${this.getBaseUrl()}//vi/genre/2/0/0?page=${page || 0}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  };
  public async select(type: string, limiter?: number, page?: string) {
    const listFunction = this.listStoryMap.get(type);

    if (listFunction) {
      const result = listFunction(limiter, page);
      return result;
    } else {
      return null;
      // Handle the case when the function for the given type is not found
    }
  }
  public register(name: string, listFunction: (limiter?: number, page?: string) => any) {
    this.listStoryMap.set(name, listFunction);
  }
  public async home(): Promise<any> {
    const data: Record<string, any> = {};
    const parameters: [number, string] = [12, '1'];
    for (const [key, value] of this.listStoryMap.entries()) {
      const result = await value(...parameters);
      data[key] = result;
    }

    return data;
  }
}
