import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import cheerio from 'cheerio';
import { Story } from '~/models/Interfaces/Story';

export default class Truyen123ListStoryStrategy implements IListStoryStrategy {
  name: string;
  listStoryMap: Map<string, (limiter?: number, page?: string) => any>;
  baseUrl: string;
  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'Truyen123ListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();

    this.register('hot', this.hotStory);
    this.register('newest', this.newestStory);
    this.register('full', this.fullStory);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public clone(): IListStoryStrategy {
    return new Truyen123ListStoryStrategy(this.baseUrl);
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
  private getListStory(html: string, limiter?: number): Story[] | null {
    const data: Story[] | null = [];
    const $ = cheerio.load(html);
    $('.list-new .row').each((index, element) => {
      if (limiter && index >= limiter) {
        return;
      }
      const name = $(element).find('.col-title h3').first().text().trim();

      const link = $(element).find('a').first().attr('href') || '';
      const url = new URL(link ?? '');
      const title = url.pathname.substr(1);
      const cover =
        $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '') || '';
      const description = $(element).find('.chapter-text').first().text();
      const author = $(element)
        .find('.col-author a')
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .text()
        .trim();
      const authorUrl = $(element).find('.col-author a').attr('href');
      const authorLink = authorUrl?.split('/').pop() || '';
      const view = $(element).find('.col-view.show-view').text().trim();
      const categoryList = $(element)
        .find('.col-category a')
        .map((_, childElement) => {
          const content = $(childElement).text().trim() || '';
          const href = $(childElement).attr('href')?.split('/').pop() || '';
          return { content, href };
        })
        .get();
      data.push({
        name,
        link,
        title,
        cover,
        description,
        host: this.getBaseUrl(),
        author,
        authorLink,
        view,
        categoryList
      });
    });

    return data;
  }
  public newestStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/danh-sach/truyen-moi?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
        let data: Story[] | null = [];
        data = this.getListStory(text, limiter);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  public fullStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/danh-sach/truyen-full?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
        let data: Story[] | null = [];
        data = this.getListStory(text, limiter);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  public hotStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/danh-sach/truyen-hot?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
        let data: Story[] | null = [];
        data = this.getListStory(text, limiter);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  public async home(): Promise<any> {
    const data: Record<string, any> = {};
    const parameters: [number, string] = [12, '1'];
    for (const [key, value] of this.listStoryMap.entries()) {
      const result = await value(...parameters);
      data[key] = result;
    }

    return data;

    // const hot = await this.hotStory(12, '1');
    // const full = await this.fullStory(12, '1');
    // const newest = await this.newestStory(12, '1');

    // const data: object = {
    //   hot,
    //   newest,
    //   full
    // };
    // return data;
  }
}
