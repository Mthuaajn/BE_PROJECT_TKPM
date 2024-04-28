import { url } from 'inspector';
import { IDataSourcePlugin } from '../DataSource/IDataSourcePlugin';
import cheerio from 'cheerio';
import e from 'express';
interface ItemTruyenfull {
  id: string;
  title: string;
  image: string;
  is_full: boolean;
  time: string;
  author: string;
  categories: string;
  category_ids: string;
  total_chapters: number;
}

interface APITruyenfullResponse {
  status: string;
  message: string;
  status_code: number;
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: {
        previous: string;
        next: string;
      };
    };
  };
  data: ItemTruyenfull[];
}
interface DetailStoryItemTruyenfull {
  id: number;
  title: string;
  image: string;
  link: string;
  status: string;
  author: string;
  time: string;
  source: string;
  liked: boolean;
  total_chapters: number;
  total_like: number;
  total_view: string;
  categories: string;
  category_ids: string;
  chapters_new: string;
  new_chapters: any[]; // or specify the type of new_chapters if available
  description: string;
}
interface ContentStoryItemTruyenfull {
  chapter_id: number;
  story_id: number;
  story_name: string;
  chapter_name: string;
  chapter_next: number | null;
  chapter_prev: number | null;
  has_image: boolean;
  position: number;
  current_page: number;
  content: string;
}
interface ChapterItemTruyenfull {
  id: number;
  title: string;
  date: string;
}
interface APIListChapterTruyenfullResponse {
  status: string;
  message: string;
  status_code: number;
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: {
        previous: string;
        next: string;
      };
    };
  };
  data: ChapterItemTruyenfull[];
}
export class TruyenfullPlugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://api.truyenfull.vn';
  public constructor(name: string) {
    this.name = name;
  }

  getBaseUrl(): string {
    return TruyenfullPlugin.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new TruyenfullPlugin(name);
  }

  public async search(title: string, page?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/v1/tim-kiem?title=${encodeURIComponent(title)}&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.api+json'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: ItemTruyenfull[] = json.data;
        const data: {
          name: string;
          link: string | undefined;
          title: string | undefined;
          cover: string | undefined;
          description: string | undefined;
          host: string | undefined;
          author: string | undefined;
          authorLink: string | undefined;
          view: string | undefined;
          categoryList: any[] | undefined;
        }[] = [];

        dataArr.forEach((element: ItemTruyenfull) => {
          const name = element?.title;
          const link = this.convertToUnicodeAndCreateURL(element.title);
          const title = element?.id.toString();
          const cover = element.image;
          const description = 'no information';
          const host = this.getBaseUrl();
          const author = element.author;
          const authorLink = this.convertToUnicodeAndCreateURL(element.author);
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
            //   view: undefined,
            //   categoryList: undefined,
            view,
            categoryList
          });
        });
        return data;

        //return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private processCategoryList(category: string, category_ids: string): any {
    const categories = category.split(','); // Split categories by comma
    const categoryIds = category_ids.split(','); // Split category_ids by comma

    const result: { content: string; href: string }[] = [];

    for (let i = 0; i < categories.length; i++) {
      const content: string = categories[i].trim(); // Remove whitespace around category
      const href: string = categoryIds[i].trim(); // Convert category_id to number

      result.push({ content, href });
    }

    return result;
  }
  private convertToUnicodeAndCreateURL(input: string): string {
    // Convert ASCII string to Unicode string
    const unicodeString = encodeURIComponent(input);

    // Replace spaces with hyphens
    const url = unicodeString.split(' ').join('-');

    return url;
  }

  public async chapterList(title: string, page?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/v1/story/detail/${title}/chapters?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const json: APIListChapterTruyenfullResponse = await response.json();
        const dataResponse: ChapterItemTruyenfull[] = json.data;

        const host = this.getBaseUrl();
        const maxChapter: number = json.meta.pagination.total;
        const maxPage: number = json.meta.pagination.total_pages;
        const listChapter: { content: string; href: number }[] = [];
        dataResponse.forEach((value, index) => {
          const content = value.title;
          const href = value.id;
          listChapter.push({ content, href });
        });

        const data: object = {
          title,
          host,
          maxChapter,
          listChapter,
          currentPage:  this.getNumberValueFromString(page),
          maxPage
        };

        //console.log(data)
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private getNumberValueFromString(input: string): number {
    const numberPattern = /\d+/; // Regular expression to match one or more digits

    const match = input.match(numberPattern);
    if (match) {
      const integerValue = parseInt(match[0], 10);
      return integerValue;
    } else {
      //console.log('No integer value found');
      return -1;
    }
  }
  
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/v1/story/detail/${title}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const json = await response.json();
        const dataResponse: DetailStoryItemTruyenfull = json.data;

        const name = dataResponse.title;
        const title = dataResponse.id.toString();
        const link = dataResponse.link;
        const cover = dataResponse.image;
        const author = dataResponse.author;
        const authorLink = this.convertToUnicodeAndCreateURL(dataResponse.author);
        const description = dataResponse.description.trim();
        const detail = dataResponse.status;
        const host = this.getBaseUrl();
        const categoryList = this.processCategoryList(
          dataResponse.categories,
          dataResponse.category_ids
        );
        const data: object = {
          name,
          title,
          link,
          cover,
          author,
          authorLink,
          description,
          detail,
          host,
          categoryList
        };

        //console.log(data)
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async contentStory(title: string, chap?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/v1/chapter/detail/${title}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const json = await response.json();
        const dataResponse: ContentStoryItemTruyenfull = json.data;
        const name = dataResponse.story_name;
        const title = dataResponse.story_id;
        const chapterTitle = dataResponse.chapter_name;
        const host = this.getBaseUrl();
        const content = dataResponse.content;
        const data: object = {
          name,
          title,
          chapterTitle,
          chap,
          host,
          content
        };

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async newestStory(limiter?: number, page?: string): Promise<any> {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/v1/story/all?type=story_new&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: ItemTruyenfull[] = json.data;
        const data: {
          name: string;
          link: string | undefined;
          title: string | undefined;
          cover: string | undefined;
          description: string | undefined;
          host: string | undefined;
          author: string | undefined;
          authorLink: string | undefined;
          view: string | undefined;
          categoryList: any[] | undefined;
        }[] = [];

        dataArr.forEach((element: ItemTruyenfull) => {
          if (data.length >= limiter) {
            return;
          }
          const name = element?.title;
          const link = this.convertToUnicodeAndCreateURL(element.title);
          const title = element?.id.toString();

          const cover = element.image;
          const description = 'no information';
          const host = this.getBaseUrl();
          const author = element.author;
          const authorLink = this.convertToUnicodeAndCreateURL(element.author);
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
            //   view: undefined,
            //   categoryList: undefined,
            view,
            categoryList
          });
        });
        return data;

        //return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async fullStory(limiter?: number, page?: string): Promise<any> {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/v1/story/all?type=story_full_rate&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: ItemTruyenfull[] = json.data;
        const data: {
          name: string;
          link: string | undefined;
          title: string | undefined;
          cover: string | undefined;
          description: string | undefined;
          host: string | undefined;
          author: string | undefined;
          authorLink: string | undefined;
          view: string | undefined;
          categoryList: any[] | undefined;
        }[] = [];

        dataArr.forEach((element: ItemTruyenfull) => {
          if (data.length >= limiter) {
            return;
          }
          const name = element?.title;
          const link = this.convertToUnicodeAndCreateURL(element.title);
          const title = element?.id.toString();

          const cover = element.image;
          const description = 'no information';
          const host = this.getBaseUrl();
          const author = element.author;
          const authorLink = this.convertToUnicodeAndCreateURL(element.author);
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
            //   view: undefined,
            //   categoryList: undefined,
            view,
            categoryList
          });
        });
        return data;

        //return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async hotStory(limiter?: number, page?: string): Promise<any> {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/v1/story/all?type=story_full_view&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: ItemTruyenfull[] = json.data;
        const data: {
          name: string;
          link: string | undefined;
          title: string | undefined;
          cover: string | undefined;
          description: string | undefined;
          host: string | undefined;
          author: string | undefined;
          authorLink: string | undefined;
          view: string | undefined;
          categoryList: any[] | undefined;
        }[] = [];

        dataArr.forEach((element: ItemTruyenfull) => {
          if (data.length >= limiter) {
            return;
          }
          const name = element?.title;
          const link = this.convertToUnicodeAndCreateURL(element.title);
          const title = element?.id.toString();

          const cover = element.image;
          const description = 'no information';
          const host = this.getBaseUrl();
          const author = element.author;
          const authorLink = this.convertToUnicodeAndCreateURL(element.author);
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
            //   view: undefined,
            //   categoryList: undefined,
            view,
            categoryList
          });
        });
        return data;

        //return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async home(): Promise<any> {
    try {
      const hot = await this.hotStory(12, '1');
      const full = await this.fullStory(12, '1');
      const newest = await this.newestStory(12, '1');

      const data: object = {
        hot,
        newest,
        full
      };
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async categoryList(): Promise<any> {
    const searchString: string = `https://truyenfull.vn/`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });

      if (response.ok) {
        const text = await response.text();
        const data: {
          content: string | undefined;
          href: string | undefined;
          host: string | undefined;
        }[] = [];

        const $ = cheerio.load(text);
        $('.dropdown-menu ul li a').each((index, element) => {
          const content = $(element).text().trim();
          const href = $(element).attr('href'); //?.split('/').pop();

          data.push({
            content,
            href,
            host: this.getBaseUrl()
          });
        });
        //console.log(data)
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
module.exports = {
  plugin: TruyenfullPlugin
};
