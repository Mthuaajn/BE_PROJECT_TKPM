import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import cheerio from 'cheerio';
import { Story } from '~/models/Interfaces/Story';

enum TangThuVienListStoryEnum {
  MOST_VIEW = 'most view'
}

export default class TangThuVienListStoryStrategy implements IListStoryStrategy {
  name: string;
  listStoryMap: Map<string, (limiter?: number, page?: string) => any>;
  baseUrl: string;
  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'TangThuVienListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();

    this.register('hot', this.hotStory);
    this.register('newest', this.newestStory);
    this.register('full', this.fullStory);
    this.register(TangThuVienListStoryEnum.MOST_VIEW, this.mostViewStory);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public clone(): IListStoryStrategy {
    return new TangThuVienListStoryStrategy(this.baseUrl);
  }
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

  private getStory = (html: string, limiter?: number) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);
    $('#rank-view-list li').each((index, element) => {
      if (limiter && index >= limiter) return;
      const name = $(element).find('.book-mid-info h4 a').text().trim();
      const cover = $(element).find('.book-img-box img').attr('src') || '';
      const description = $(element).find('.intro').text().trim();
      const author = $(element).find('.author a.name').text().trim();
      // method eq(1) lấy element thứ 2 xuất hiện
      // const category = $(element).find('.author a').eq(1).text().trim();
      const categoryElement = $(element).find('.author a').eq(1);
      const category = {
        content: categoryElement.text().trim(),
        href: categoryElement.attr('href') || ''
      } as never;
      //const link = convertString(name);
      const link = $(element).find('.book-img-box a').first().attr('href') || '';
      const startIndex = link.lastIndexOf('/') + 1;
      const title = link.substring(startIndex);
      const story: Story = {
        name,
        cover,
        description,
        author,
        categoryList: [].concat(category) as { content: string; href: string }[],
        link,
        title: title,
        host: 'https://truyen.tangthuvien.vn/',
        authorLink: 'no information',
        view: 'no information'
      };
      result.push(story);
    });
    return result;
  };
  public newestStory = async (limiter?: number, page?: string): Promise<any> => {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?ord=new&page=${page}`;
    let result: Story[];
    try {
      console.log('searchString: ', searchString);
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
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=nm&page=${page}`;
    let result: Story[] = [];
    try {
      console.log('searchString: ', searchString);
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
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=vw&page=${page}`;
    let result: Story[] = [];
    try {
      console.log('searchString: ', searchString);
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
  public mostViewStory = async (limiter?: number, page?: string): Promise<any> => {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=td&page=${page}`;
    let result: Story[] = [];
    try {
      console.log('searchString: ', searchString);
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
