import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import { Story } from '~/models/Interfaces/Story';
import cheerio from 'cheerio';

export default class AudioTruyenfullListStoryStrategy implements IListStoryStrategy {
  name: string;
  baseUrl: string;
  listStoryMap: Map<string, (limiter?: number | undefined, page?: string | undefined) => any>;
  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'NoveltoonListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();

    this.register('hot', this.hotStory);
    this.register('newest', this.newestStory);
    this.register('full', this.fullStory);
  }
  private getListStory(html: string, limiter?: number): Story[] | null {
    const data: Story[] | null = [];

    //console.log('limiter: ', limiter);
    const $ = cheerio.load(html);

    const elements = $(
      '.wrapper .container #list-index  .list-full .list-thumbnail .row .item-story'
    ); //.container //#truyen-slide

    if (elements.length === 0) {
      console.log('empty');
      return data;
    }

    //.wrapper .container .col-truyen-main .list-truyen .container .list-full .list .row
    $('.wrapper .container #list-index  .list-full .list-thumbnail .row .item-story').each(
      (index, element) => {
        if (limiter && index >= limiter) {
          return;
        }
        const name = $(element).find('.item-story .caption a').first().text().trim() || '';

        const link = $(element).find('.item-story .caption a').first().attr('href') || '';
        const url = new URL(link ?? '');
        const title = url.pathname.substr(1);
        const cover =
          $(element)
            .find('.item-story .img-hover img')
            .first()
            ?.attr('src')
            ?.replace('-thumbw', '') || '';
        const description = 'no information';
        const author = 'no information';
        const authorUrl = 'no information';
        const authorLink = 'no information';
        const view = 'no information';
        const categoryList = [
          {
            content: 'empty',
            href: 'empty'
          }
        ];
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
          categoryList,
          format: 'audio'
        });
      }
    );

    //console.log('data: ', data.length);
    return data;
  }
  public fullStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.POSITIVE_INFINITY;
    const searchString = `${this.getBaseUrl()}/danh-sach/truyen-full?page=${page}`;
    let result: Story[] | null = [];
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      //console.log('html: ', html);
      result = this.getListStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  };
  public newestStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.POSITIVE_INFINITY;
    const searchString = `${this.getBaseUrl()}/danh-sach/truyen-moi?page=${page}`;
    let result: Story[] | null = [];
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      //console.log('html: ', html);
      result = this.getListStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  };
  public hotStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.POSITIVE_INFINITY;
    const searchString = `${this.getBaseUrl()}/danh-sach/truyen-hot?page=${page}`;
    let result: Story[] | null = [];
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      //console.log('html: ', html);
      result = this.getListStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  };
  clone(): IListStoryStrategy {
    return new AudioTruyenfullListStoryStrategy(this.baseUrl);
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
  public async home(): Promise<any> {
    const data: Record<string, any> = {};
    const parameters: [number, string] = [12, '1'];
    for (const [key, value] of this.listStoryMap.entries()) {
      const result = await value(...parameters);
      data[key] = result;
    }

    return data;
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
