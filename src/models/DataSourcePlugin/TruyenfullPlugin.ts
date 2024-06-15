import { url } from 'inspector';
import { IDataSourcePlugin } from '../DataSourceManagement/IDataSourcePlugin';
import cheerio from 'cheerio';
import e from 'express';
import { data } from 'node_modules/cheerio/lib/api/attributes';
import { IListStoryStrategy } from '../DataSourceManagement/IListStoryStrategy';
import { StoryTruyenfull } from '../Interfaces/StoryTruyenfull';
import { Category } from '../Interfaces/Category';
import { ContentStory } from '../Interfaces/ContentStory';
import { ListChapter } from '../Interfaces/ListChapter';
import { DetailStory } from '../Interfaces/DetailStory';
import { Story } from '../Interfaces/Story';
import { ChangeDataSourceStory } from '../Interfaces/ChangeDataSourceStory';
import { DetailStoryTruyenfull } from '../Interfaces/DetailStoryTruyenfull';
import { ChapterItemTruyenfull } from '../Interfaces/ChapterItemTruyenfull';
import { APIListChapterTruyenfullResponse } from '../Interfaces/APIListChapterTruyenfullResponse';
import { ContentStoryTruyenfull } from '../Interfaces/ContentStoryTruyenfull';

// This class is used for crawl data from Truyen full website
export class TruyenfullPlugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://api.truyenfull.vn';
  listStory: IListStoryStrategy;
  public constructor(name: string) {
    this.name = name;
    this.listStory = new TruyenfullListStoryStrategy(this.getBaseUrl());
    //console.log(this.listStory.getBaseUrl());
  }

  public async selectStoryList(
    type: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    return this.listStory.select(type, limiter, page);
  }

  getBaseUrl(): string {
    return TruyenfullPlugin.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new TruyenfullPlugin(name);
  }
  public async changeContentStoryToThisDataSource(title: string, chap?: string): Promise<any> {
    if (!chap) chap = '1';
    try {
      const story: ChangeDataSourceStory | null =
        await this.changeDetailStoryToThisDataSource(title);

      const foundTitle: string | undefined =
        story && story.data && story.message === 'found' ? story.data.title : undefined;

      //console.log('story: ', story);
      //console.log('foundTitle: ', foundTitle);
      const checkedTitle: string = foundTitle ?? '';
      if (!checkedTitle || checkedTitle === '') {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      }
      const detailChapter = await this.contentStory(checkedTitle, chap);

      if (detailChapter === null) {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      } else {
        const result: object = {
          data: detailChapter,
          message: 'found'
        };
        return result;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async changeDetailStoryToThisDataSource(title: string): Promise<any> {
    try {
      const data: object[] | null = await this.searchByTitle(title);
      if (data === null || data.length <= 0) {
        const result: object = {
          data: null,
          message: 'not found'
        };
        return result;
      } else {
        const result: object = {
          data: data ? data[0] : null,
          message: 'found'
        };
        return result;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async searchByTitle(title: string, page?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/v1/tim-kiem?title=${encodeURIComponent(title)}&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: StoryTruyenfull[] = json.data;
        const data: Story[] = [];

        if (dataArr.length <= 0) {
          return null;
        }
        dataArr.forEach((element: StoryTruyenfull) => {
          if (data.length === 1) {
            return;
          }
          const name = element?.title;
          const link = this.convertToUnicodeAndCreateURL(element.title);
          const titleOfStory = element?.id.toString();
          const cover = element.image;
          const description = 'no information';
          const host = this.getBaseUrl();
          const author = element.author;
          const authorLink = this.convertToUnicodeAndCreateURL(element.author);
          const view = 'no information';
          const categoryList = this.processCategoryList(element.categories, element.category_ids);

          const lowerCaseName: string = name.toLowerCase();
          const lowerCaseTitle: string = title.toLowerCase();
          // console.log('name: ', lowerCaseName);
          // console.log('title: ', lowerCaseTitle);
          const found: boolean = //lowerCaseName === lowerCaseTitle;
            lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);
          //console.log('found: ', found);
          if (found) {
            data.push({
              name,
              link,
              title: titleOfStory,
              cover,
              description,
              host,
              author,
              authorLink,
              view,
              categoryList
            });
          }
        });
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async search(title: string, page?: string, category?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/v1/tim-kiem?title=${encodeURIComponent(title)}&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: StoryTruyenfull[] = json.data;
        const data: Story[] = [];

        dataArr.forEach((element: StoryTruyenfull) => {
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
            view,
            categoryList
          });
        });
        if (category) {
          const categoryData = data.filter((value) => {
            return value.categoryList?.some((item) => item.content === category);
          });
          return categoryData;
        }
        return data;

        //return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
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
          'Content-Type': 'application/json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json: APIListChapterTruyenfullResponse = await response.json();
        if (json.meta.pagination.current_page > json.meta.pagination.total_pages) {
          return null;
        }
        const dataResponse: ChapterItemTruyenfull[] = json.data;

        const host = this.getBaseUrl();
        const maxChapter: number = json.meta.pagination.total;
        const maxPage: number = json.meta.pagination.total_pages;
        const chapterPerPage: number = json.meta.pagination.per_page;
        const listChapter: { content: string; href: string }[] = [];
        dataResponse.forEach((value, index) => {
          const content = value.title;
          const href = value.id.toString();
          listChapter.push({ content, href });
        });

        const data: ListChapter = {
          title,
          host,
          maxChapter,
          listChapter,
          currentPage: this.getNumberValueFromString(page),
          maxPage,
          chapterPerPage
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
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataResponse: DetailStoryTruyenfull = json.data;

        const name = dataResponse.title;
        const title = dataResponse.id.toString();
        const link = dataResponse.link;
        const cover = dataResponse.image;
        const author = dataResponse.author;
        const authorLink = this.convertToUnicodeAndCreateURL(dataResponse.author);
        const description = dataResponse.description
          .trim()
          .replaceAll(/<br\/>|<i>|<\/i>|<b>|<\/b>|<br>|<strong>|<\/strong>/g, '');
        const detail = dataResponse.status;
        const host = this.getBaseUrl();
        const categoryList = this.processCategoryList(
          dataResponse.categories,
          dataResponse.category_ids
        );
        const data: DetailStory = {
          name,
          link,
          title,
          cover,
          description,
          host,
          author,
          authorLink,
          detail,
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
    const chapterPerPage: number = 50;
    if (!chap) chap = '1';
    const chapNumber: number = Number.parseInt(chap);

    const pageNumber: number =
      Math.floor(chapNumber / chapterPerPage) + (chapNumber % chapterPerPage === 0 ? 0 : 1);

    console.log('pageNumber: ', pageNumber);

    let indexChapterInPage: number = (chapNumber - 1) % chapterPerPage; // array start from 0, chapter in page start from 1
    indexChapterInPage = indexChapterInPage >= 0 ? indexChapterInPage : 0;
    console.log('indexChapterInPage: ', indexChapterInPage);

    const searchString2: string = `${this.getBaseUrl()}/v1/story/detail/${title}`;

    try {
      const chapterList: ListChapter = await this.chapterList(title, pageNumber.toString());

      if (chapterList === null) {
        console.log('ChapterList is null');
        return null;
      }

      // const countChapterInCurrentPage: number = chapterList.listChapter.length;

      //console.log('countChapterInCurrentPage: ', countChapterInCurrentPage);
      if (
        !chapterList.listChapter[indexChapterInPage] ||
        chapterList.listChapter[indexChapterInPage] === null ||
        chapterList.listChapter[indexChapterInPage] === undefined
      ) {
        return null;
      }

      const chapterId: string = chapterList.listChapter[indexChapterInPage].href || 'href is null';
      const searchString: string = `${this.getBaseUrl()}/v1/chapter/detail/${chapterId}`;

      console.log('searchString: ', searchString);
      console.log('searchString: ', searchString2);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const response2 = await fetch(searchString2, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok && response2.ok) {
        const json = await response.json();
        const dataResponse: ContentStoryTruyenfull = json.data;
        const name = dataResponse.story_name;
        const title = dataResponse.story_id.toString();
        const chapterTitle = dataResponse.chapter_name;
        const host = this.getBaseUrl();
        const content = dataResponse.content.replaceAll(/<br\/>|<i>|<\/i>|<b>|<\/b>/g, '');

        const json2 = await response2.json();
        const dataResponse2: DetailStoryTruyenfull = json2.data;

        const cover = dataResponse2.image;
        const author = dataResponse2.author;

        const data: ContentStory = {
          name,
          title,
          chapterTitle,
          chap,
          host,
          content,
          cover,
          author
        };

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async home(): Promise<any> {
    try {
      // const hot = await this.hotStory(12, '1');
      // const full = await this.fullStory(12, '1');
      // const newest = await this.newestStory(12, '1');

      // const data: object = {
      //   hot,
      //   newest,
      //   full
      // };
      // return data;
      const data = await this.listStory.home();
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
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });

      if (response.ok) {
        const text = await response.text();
        const data: Category[] = [];

        const $ = cheerio.load(text);
        $('.dropdown-menu ul li a').each((index, element) => {
          const content = $(element).text().trim();
          const href = $(element).attr('href') || '';

          data.push({
            content,
            href
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

  public async newestStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {
    let data;
    const cate = category
      .split(' ')
      .join('-')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .join('-')
      .toLowerCase();
    const searchString = `${this.getBaseUrl()}/v1/story/cate?cate=${cate}&type=story_new&page=${page}`;
    ``;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const res = await response.json();
      data = res.data;
    } catch (err) {
      console.log(err);
      return null;
    }
    return data;
  }

  public async fullStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {
    let data;
    const cate = category
      .split(' ')
      .join('-')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .join('-')
      .toLowerCase();
    const searchString = `${this.getBaseUrl()}/v1/story/cate?cate=${cate}&type=story_full&page=${page}`;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const res = await response.json();
      data = res.data;
    } catch (err) {
      console.log(err);
      return null;
    }
    return data;
  }

  public async hotStoryAtCategory(category: string, limiter?: number, page?: string): Promise<any> {
    let data;
    const cate = category
      .split(' ')
      .join('-')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .join('-')
      .toLowerCase();
    const searchString = `${this.getBaseUrl()}/v1/story/cate?cate=${cate}&type=story_view&page=${page}`;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const res = await response.json();
      data = res.data;
    } catch (err) {
      console.log(err);
      return null;
    }
    return data;
  }
}
export class TruyenfullListStoryStrategy implements IListStoryStrategy {
  name: string;
  listStoryMap: Map<string, (limiter?: number, page?: string) => any>;
  baseUrl: string = 'https://api.truyenfull.vn';
  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'TruyenfullListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();
    this.register('newest', this.newestStory);
    this.register('hot', this.hotStory);
    this.register('full', this.fullStory);
    this.register('update', this.updateStory);
  }
  getBaseUrl(): string {
    return this.baseUrl;
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
  private convertToUnicodeAndCreateURL(input: string): string {
    // Convert ASCII string to Unicode string
    const unicodeString = encodeURIComponent(input);

    // Replace spaces with hyphens
    const url = unicodeString.split(' ').join('-');

    return url;
  }
  private getListStory(dataArr: StoryTruyenfull[], limiter?: number): Story[] | null {
    const data: Story[] | null = [];
    dataArr.forEach((element: StoryTruyenfull) => {
      if (limiter && data.length >= limiter) {
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
        view,
        categoryList
      });
    });

    return data;
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

    // const hot = await this.hotStory(12, '1');
    // const full = await this.fullStory(12, '1');
    // const newest = await this.newestStory(12, '1');
    // const update = await this.updateStory(12, '1');
    // const data: object = {
    //   hot,
    //   newest,
    //   full,
    //   update
    // };
    // return data;
  }
}
module.exports = {
  plugin: TruyenfullPlugin,
  listStory: TruyenfullListStoryStrategy
};
