import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import { Category } from '~/models/Interfaces/Category';
import { Story } from '~/models/Interfaces/Story';
import { StoryTruyenfull } from '~/models/Interfaces/StoryTruyenfull';
import { convertToUnicodeAndCreateURL } from '~/utils/StringUtility';

export default class TruyenfullListStoryStrategy implements IListStoryStrategy {
  name: string;
  listStoryMap: Map<string, (limiter?: number, page?: string) => any>;
  baseUrl: string;
  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'TruyenfulllListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();

    this.register('hot', this.hotStory);
    this.register('newest', this.newestStory);
    this.register('full', this.fullStory);
    this.register('update', this.updateStory);
  }
  public clone(): IListStoryStrategy {
    return new TruyenfullListStoryStrategy(this.baseUrl);
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
  public newestStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/v1/story/all?type=story_new&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: StoryTruyenfull[] = json.data;
        let data: Story[] | null = [];
        data = this.getListStory(dataArr, limiter);

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
    const searchString: string = `${this.getBaseUrl()}/v1/story/all?type=story_full_rate&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: StoryTruyenfull[] = json.data;
        let data: Story[] | null = [];
        data = this.getListStory(dataArr, limiter);

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
    const searchString: string = `${this.getBaseUrl()}/v1/story/all?type=story_full_view&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: StoryTruyenfull[] = json.data;
        let data: Story[] | null = [];
        data = this.getListStory(dataArr, limiter);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  private getListStory(dataArr: StoryTruyenfull[], limiter?: number): Story[] | null {
    const data: Story[] | null = [];
    dataArr.forEach((element: StoryTruyenfull) => {
      if (limiter && data.length >= limiter) {
        return;
      }
      const name = element?.title;
      const link = convertToUnicodeAndCreateURL(element.title);
      const title = element?.id.toString();

      const cover = element.image;
      const description = 'no information';
      const host = this.getBaseUrl();
      const author = element.author;
      const authorLink = convertToUnicodeAndCreateURL(element.author);
      const view = 'no information';
      const categoryList = this.processCategoryList(element.categories, element.category_ids);

      data.push({
        name,
        link,
        title,
        cover,
        description,
        host,
        author,
        authorLink,
        view,
        categoryList
      });
    });

    return data;
  }
  private processCategoryList(category: string, category_ids: string): Category[] {
    const categories = category.split(','); // Split categories by comma
    const categoryIds = category_ids.split(','); // Split category_ids by comma

    const result: Category[] = [];

    for (let i = 0; i < categories.length; i++) {
      const content: string = categories[i].trim(); // Remove whitespace around category
      const href: string = categoryIds[i].trim(); // Convert category_id to number

      result.push({ content, href });
    }

    return result;
  }
  public updateStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/v1/story/all?type=story_update&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: StoryTruyenfull[] = json.data;
        let data: Story[] | null = [];
        data = this.getListStory(dataArr, limiter);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
}
