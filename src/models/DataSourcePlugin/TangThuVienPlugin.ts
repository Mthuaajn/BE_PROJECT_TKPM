import { IDataSourcePlugin } from '../DataSourceManagement/IDataSourcePlugin';
import cheerio from 'cheerio';
import { IListStoryStrategy } from '../DataSourceManagement/IListStoryStrategy';
import { Category } from '../Interfaces/Category';
import { DetailStory } from '../Interfaces/DetailStory';
import { Story } from '../Interfaces/Story';
import { ChapterItem } from '../Interfaces/ChapterItem';
import { ContentStory } from '../Interfaces/ContentStory';
import { ListChapter } from '../Interfaces/ListChapter';
import { PartialChapterPagination } from '../Interfaces/PartialChapterPagination';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const he = require('he');

export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function convertString(input: string): string {
  // Chuyển đổi chuỗi về chữ thường
  const lowerCaseStr = input.toLowerCase();

  // Bỏ dấu tiếng Việt
  const noAccentsStr = removeVietnameseAccents(lowerCaseStr);

  // Thay thế các dấu cách bằng dấu gạch ngang
  const kebabCaseStr = noAccentsStr.split(' ').join('-');

  // Chỉ giữ lại các ký tự chữ thường và dấu gạch ngang
  const validStr = kebabCaseStr.replace(/[^a-z-]/g, '');

  return validStr;
}
interface StoryData {
  name: string;
  link?: string;
  title?: string;
  cover?: string;
  description?: string;
  host?: string;
  author?: string;
  authorLink?: string;
  view?: string;
  categoryList?: any[];
}

interface changeDataSourceStory {
  data: StoryData;
  message: string;
}

// This class is used for crawl data from Tang Thu Vien website
export class TangThuVienPlugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://truyen.tangthuvien.vn';
  listStory: IListStoryStrategy;
  public constructor(name: string) {
    this.name = name;
    this.listStory = new TangThuVienListStoryStrategy(this.getBaseUrl());
  }
  public async selectStoryList(
    type: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    return this.listStory.select(type, limiter, page);
  }

  public async changeDetailStoryToThisDataSource(title: string): Promise<any> {
    try {
      const data: object[] | null = await this.searchByTitle(title);
      //console.log('data: ', data);
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
    const searchString: string = `${this.getBaseUrl()}/ket-qua-tim-kiem?term=${title}&page=${page}`;
    let result: Story[] | null = [];
    console.log('searchString: ', searchString);
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStoryMostLikeTitle(html, title);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }

  public async changeContentStoryToThisDataSource(title: string, chap?: string): Promise<any> {
    if (!chap) chap = '1';
    try {
      const story: changeDataSourceStory | null =
        await this.changeDetailStoryToThisDataSource(title);

      const foundTitle: string | undefined =
        story && story.data && story.message === 'found' ? story.data.title : undefined;

      const checkedTitle: string = foundTitle ?? '';
      if (!checkedTitle || checkedTitle === '') {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      }

      const chapterPaginationData: ListChapter = await this.chapterList(checkedTitle);
      const chapNumber: number = Number.parseInt(chap);
      if (chapNumber > chapterPaginationData.maxChapter) {
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

  public getBaseUrl(): string {
    return TangThuVienPlugin.baseUrl;
  }
  public clone(name: string): IDataSourcePlugin {
    return new TangThuVienPlugin(name);
  }

  private getDetailStory = (html: string, searchString: string, title: string) => {
    const result: DetailStory[] = [];
    const $ = cheerio.load(html);
    const name = $('.book-info h1 ').text().trim();
    const link = searchString;
    const host = this.getBaseUrl();
    const cover = $('.book-img a img').attr('src') || '';
    const description = $('.book-info-detail .book-intro p').text().trim();
    const author = $('.tag a.blue').text().trim();
    const authorLink = convertString(author);
    const categoryList: Category[] = [];
    // method eq(1) lấy element thứ 2 xuất hiện
    const category = $('.tag a.red').eq(0).text().trim();
    categoryList.push({ content: category, href: convertString(category) });
    // const status = $('.tag span.blue').eq(0).text().trim();
    // const like = $('span.ULtwOOTH-like').text().trim();
    // const follow = $('span.ULtwOOTH-follow').text().trim();
    // const view = $('span.ULtwOOTH-view').text().trim();
    // const poster = $('.book-info-detail .book-state li a.tags').text().trim();
    // // const update = $('.book-info-detail li.update .detail a.blue').text().trim();
    // const totalChapterText = $('#j-bookCatalogPage').text().trim();
    // const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
    // const totalChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;
    const story: DetailStory = {
      name,
      title: title,
      link,
      cover,
      description,
      author,
      authorLink,
      categoryList,
      host,
      detail: 'full'
    };
    return story;
  };

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

  private getStoryMostLikeTitle = (html: string, searchedTitle: string, limiter?: number) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);

    const elements = $('#rank-view-list li');

    if (elements.length === 0) {
      return null;
    }
    //console.log(elements);

    $('#rank-view-list li').each((index, element) => {
      if (result.length === 1) return;
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

      const lowerCaseName: string = name.toLowerCase();

      const lowerCaseTitle: string = searchedTitle.toLowerCase();
      let found: boolean =
        lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);

      if (name.length === 0) {
        found = false;
      }

      if (found) {
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
      }
    });
    return result;
  };

  private getCategoryList = (html: string) => {
    const $ = cheerio.load(html);
    const result: Category[] = [];
    const length = $('#classify-list dd').length;
    $('#classify-list dd').each((index, element) => {
      if (index == length - 1) return;
      const link = $(element).find('a');
      if (link.length) {
        const content = link.find('span.info i').text().trim();
        const href = link.attr('href') || '';

        result.push({
          content,
          //host: this.getBaseUrl(),
          href
        });
      }
    });
    return result;
  };

  private getContentStory = (html: string, chapter: string, title: string) => {
    const $ = cheerio.load(html);
    const name = $('h1.truyen-title a').text().trim();
    const chapterTitle = $('.content .chapter h2').text().trim();
    const chap = chapter.toString() || '';
    // const title = $('.content .chapter h2').text().trim();
    const author = $('.chapter .text-center strong a').text().trim();
    const content = $('.box-chap').text().trim();
    const host = this.getBaseUrl();
    const cover = 'no information';
    const story = {
      name,
      chapterTitle,
      chap,
      title,
      author,
      content,
      cover,
      host
    };

    return story;
  };

  private getNumberValueFromString(input: string): any {}
  public async getMaxChapterPage(title: string): Promise<any> {}
  public async search(title: string, page?: string, category?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/ket-qua-tim-kiem?term=${title}&page=${page}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStory(html);
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

  async categoryList(): Promise<any> {
    let result: Category[] = [];
    try {
      const searchString: string = `${this.getBaseUrl()}`;
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getCategoryList(html);
    } catch (err) {
      console.log(err);
    }

    return result;
  }
  async home(): Promise<any> {
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
  public async contentStory(title: string, chap?: string): Promise<any> {
    const storyDetail: DetailStory = await this.detailStory(title);
    const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}/chuong-${chap}`;
    let result: ContentStory;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getContentStory(html, chap as string, title);
    } catch (err) {
      console.log(err);
      return null;
    }
    return { ...result, cover: storyDetail.cover };
  }
  public async chapterList(title: string, page?: string): Promise<any> {
    if (!page) page = '1';
    const currentPage: number = Number.parseInt(page);

    try {
      const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      const totalChapterText = $('#j-bookCatalogPage').text().trim();
      const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
      const maxChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;

      // console.log('maxChapter: ', maxChapter);
      const url = this.getBaseUrl();
      const data: PartialChapterPagination | null = await this.getListChapter(
        html,
        currentPage,
        url as string
      );

      if (data == null) {
        return null;
      }
      const result: ListChapter = {
        title,
        host: this.getBaseUrl(),
        maxChapter: maxChapter,
        listChapter: data.chapters,
        currentPage: currentPage,
        maxPage: data.maxPage,
        chapterPerPage: data.chapterPerPage
      };
      //console.log('result: ', result);
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  private async getListChapter(
    html: string,
    page: number,
    url: string
  ): Promise<PartialChapterPagination | null> {
    const $ = cheerio.load(html);
    const storyId = $('#story_id_hidden').val();
    let pageNumber: number = page;
    pageNumber = pageNumber - 1;
    pageNumber = pageNumber >= 0 ? pageNumber : 0;

    const chapters: ChapterItem[] | null = [];
    const chapterPerPage: number = 50;
    try {
      const searchString: string = `${this.getBaseUrl()}/doc-truyen/page/${storyId}?page=${pageNumber}&limit=${chapterPerPage}&web=0`;
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });

      const html = await response.text();

      const $ = cheerio.load(html);

      $('div.col-md-6 ul li').each((index, element) => {
        const href = $(element).find('a').attr('href');
        let content = $(element).find('a span.chapter-text').text();
        content = he.decode(content);

        if (content && content.length >= 0 && href != undefined && href.length >= 0) {
          chapters.push({ content, href });
        }
      });

      const ul = $('ul.pagination');
      const liCount = ul.find('li').length;
      let maxPage: number = 0;

      //console.log('liCount: ', liCount);

      if (liCount >= 2) {
        const lastLi = $('ul.pagination li:last-child');
        const onclickAttr: string | undefined = lastLi.find('a').attr('onclick');

        if (!onclickAttr) {
          const lastPageStr: string = lastLi.find('a').text();
          maxPage = lastPageStr ? parseInt(lastPageStr) - 1 : 0;
        } else {
          const checkedOnclickAttr: string = onclickAttr ? onclickAttr : '';
          const matchedNumber: string | null = checkedOnclickAttr.match(/\d+/)?.[0] || null;
          maxPage = matchedNumber ? parseInt(matchedNumber) : 0;
        }
      }
      maxPage += 1;

      const result: PartialChapterPagination = {
        chapters,
        maxPage,
        chapterPerPage
      };

      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
    let result: DetailStory;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getDetailStory(html, searchString, title);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  private async getCtg(category: string): Promise<number> {
    const listCategory = await this.categoryList();
    let ctg: number = 0;
    listCategory.forEach((element: any, index: number) => {
      if (element.content === category) {
        ctg = index + 1;
        return;
      }
    });
    return ctg;
  }
  private async getStoryWithSearchString(searchString: string): Promise<any> {
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStory(html);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }

  public async newestStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {
    const ctg: string = (await this.getCtg(category)).toString();
    const searchString: string = `${this.getBaseUrl()}/tong-hop?ord=new&ctg=${ctg}&page=${page}`;
    const result: any = await this.getStoryWithSearchString(searchString);
    return result;
  }

  public async fullStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {
    const ctg: string = (await this.getCtg(category)).toString();
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=nm&ctg=${ctg}&page=${page}`;
    const result: any = await this.getStoryWithSearchString(searchString);
    return result;
  }

  public async hotStoryAtCategory(category: string, limiter?: number, page?: string): Promise<any> {
    const ctg: string = (await this.getCtg(category)).toString();
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=vw&ctg=${ctg}&page=${page}`;
    const result: any = await this.getStoryWithSearchString(searchString);
    return result;
  }
}
enum TangThuVienListStoryEnum {
  MOST_VIEW = 'most view'
}
export class TangThuVienListStoryStrategy implements IListStoryStrategy {
  name: string;
  listStoryMap: Map<string, (limiter?: number, page?: string) => any>;
  baseUrl: string = 'https://truyen.tangthuvien.vn';
  public constructor(url: string) {
    this.baseUrl = url;
    this.name = 'TangThuVienListStoryStrategy';
    this.listStoryMap = new Map<string, (limiter?: number, page?: string) => any>();
    this.register('newest', this.newestStory);
    this.register('hot', this.hotStory);
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
    // const hot = await this.hotStory(12, '1');
    // const full = await this.fullStory(12, '1');
    // const newest = await this.newestStory(12, '1');
    // const mostView = await this.mostViewStory(12, '1');
    // const data: object = {
    //   hot,
    //   newest,
    //   full,
    //   [TangThuVienListStoryEnum.MOST_VIEW]: mostView
    // };
    // return data;
  }
}
module.exports = {
  plugin: TangThuVienPlugin
};
