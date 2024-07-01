import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import { Category } from '~/models/Interfaces/Category';
import { Story } from '~/models/Interfaces/Story';

interface ListStoryOTruyenResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: {
      og_type: string;
      titleHead: string;
      descriptionHead: string;
      og_image: string[];
      og_url: string;
    };
    breadCrumb: {
      name: string;
      slug?: string;
      isCurrent: boolean;
      position: number;
    }[];
    titlePage: string;
    items: StoryOTruyen[];
    params: {
      type_slug: string;
      filterCategory: string[];
      sortField: string;
      sortType: string;
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        pageRanges: number;
      };
    };
    type_list: string;
    APP_DOMAIN_FRONTEND: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}
interface StoryOTruyen {
  _id: string;
  name: string;
  slug: string;
  origin_name: string[];
  status: string;
  thumb_url: string;
  sub_docquyen: boolean;
  category: CategoryOTruyen[];
  updatedAt: string;
  chaptersLatest: {
    filename: string;
    chapter_name: string;
    chapter_title: string;
    chapter_api_data: string;
  }[];
}
interface CategoryOTruyen {
  id: string;
  name: string;
  slug: string;
}
export default class OTruyenListStoryStrategy implements IListStoryStrategy {
  name: string;
  baseUrl: string;
  listStoryMap: Map<string, (limiter?: number | undefined, page?: string | undefined) => any>;

  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'OTruyenListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();

    this.register('update', this.updateStory);
    this.register('newest', this.newestStory);
    this.register('full', this.fullStory);
  }
  private processCategoryList(categories: CategoryOTruyen[]): Category[] {
    const result: Category[] = [];

    for (let i = 0; i < categories.length; i++) {
      const content: string = categories[i].name;
      const href: string = categories[i].slug;

      result.push({ content, href });
    }

    return result;
  }
  private getListStory(dataArr: StoryOTruyen[], limiter?: number): Story[] | null {
    const data: Story[] | null = [];
    dataArr.forEach((element: StoryOTruyen) => {
      if (limiter && data.length >= limiter) {
        return;
      }
      const name = element.name;
      const link = element._id;
      const title = element.slug;

      const cover = 'https://img.otruyenapi.com/uploads/comics/' + element.thumb_url;
      const description = element.status;
      const host = this.getBaseUrl();
      const author = 'no information';
      const authorLink = 'no information';
      const view = 'no information';
      const categoryList = this.processCategoryList(element.category);

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
        categoryList,
        format: 'image'
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
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const json: ListStoryOTruyenResponse = await response.json();
        const dataArr: StoryOTruyen[] = json.data.items;
        let data: Story[] | null = [];
        data = this.getListStory(dataArr, limiter);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  public updateStory = async (limiter?: number, page?: string): Promise<any> => {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/danh-sach/dang-phat-hanh?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const json: ListStoryOTruyenResponse = await response.json();
        const dataArr: StoryOTruyen[] = json.data.items;
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
    const searchString: string = `${this.getBaseUrl()}/danh-sach/hoan-thanh?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const json: ListStoryOTruyenResponse = await response.json();
        const dataArr: StoryOTruyen[] = json.data.items;
        let data: Story[] | null = [];
        data = this.getListStory(dataArr, limiter);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  clone(): IListStoryStrategy {
    return new OTruyenListStoryStrategy(this.baseUrl);
  }
  select(type: string, limiter?: number | undefined, page?: string | undefined) {
    const listFunction = this.listStoryMap.get(type);

    if (listFunction) {
      const result = listFunction(limiter, page);
      return result;
    } else {
      return null;
      // Handle the case when the function for the given type is not found
    }
  }
  register(
    name: string,
    listFunction: (limiter?: number | undefined, page?: string | undefined) => any
  ) {
    this.listStoryMap.set(name, listFunction);
  }
  async home(): Promise<any> {
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
