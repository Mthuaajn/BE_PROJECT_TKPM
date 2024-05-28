import { IDataSourcePlugin } from '../DataSource/IDataSourcePlugin';
import cheerio from 'cheerio';
export interface Category {
  content: string;
  numberStory: string;
  href: string;
}
export interface Story {
  name: string;
  link: string;
  title: string;
  cover: string;
  description: string;
  author: string;
  categoryList: {
    content: string;
    href: string;
  }[];
  host: string;
  authorLink: string;
  view: string;
  status: string;
  update: string;
  totalChapter: number;
}

export interface DetailStory {
  name: string;
  cover: string;
  description: string;
  author: string;
  category: string;
  status: string;
  update: string;
  follow: string;
  like: string;
  view: string;
  totalChapter: number;
  poster: string;
}

export interface ContentStory {
  name: string;
  title: string;
  chap: string;
  chapterTitle: string;
  content: string;
  author: string;
  datePost: string;
}

export interface ListChapter {
  title: string;
  host: string;
  maxChapter: number;
  listChapter: {
    content: string;
    href: string;
  }[];
}

export class TangThuVienPlugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://truyen.tangthuvien.vn/';
  public constructor(name: string) {
    this.name = name;
  }

  public async changeDetailStoryToThisDataSource(title: string): Promise<any> {
    //TODO: need to implement
}

  getBaseUrl(): string {
    return TangThuVienPlugin.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new TangThuVienPlugin(name);
  }

  private getDetailStory = (html: string) => {
    const result: DetailStory[] = [];
    const $ = cheerio.load(html);
    const name = $('.book-info h1 ').text().trim();
    const cover = $('.book-img a img').attr('src') || '';
    const description = $('.book-info-detail .book-intro p').text().trim();
    const author = $('.tag a.blue').text().trim();
    // method eq(1) lấy element thứ 2 xuất hiện
    const category = $('.tag a.red').eq(0).text().trim();
    const status = $('.tag span.blue').eq(0).text().trim();
    const like = $('span.ULtwOOTH-like').text().trim();
    const follow = $('span.ULtwOOTH-follow').text().trim();
    const view = $('span.ULtwOOTH-view').text().trim();
    const poster = $('.book-info-detail .book-state li a.tags').text().trim();
    const update = $('.book-info-detail li.update .detail a.blue').text().trim();
    const totalChapterText = $('#j-bookCatalogPage').text().trim();
    const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
    const totalChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;
    const story: DetailStory = {
      name,
      cover,
      description,
      author,
      category,
      status,
      update,
      totalChapter,
      like,
      follow,
      view,
      poster
    };
    result.push(story);
    return result;
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
      const status = $(element).find('.author span').eq(0).text().trim();
      const update = $(element).find('.update span').text().trim();
      const totalChapter = parseInt($(element).find('.KIBoOgno').text().trim(), 10);
      const link = $(element).find('.book-img-box a').first().attr('href') || '';
      const startIndex = link.lastIndexOf('/') + 1;
      const title = link.substring(startIndex);
      const story: Story = {
        name,
        cover,
        description,
        author,
        categoryList: [].concat(category) as { content: string; href: string }[],
        status,
        update,
        totalChapter,
        link: link,
        title: title,
        host: this.getBaseUrl(),
        authorLink: 'no information',
        view: 'no information'
      };
      result.push(story);
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
        const numberStory = link.find('span.info b').text().trim();
        const href = link.attr('href') || '';

        result.push({
          content,
          numberStory: numberStory === '' ? '...' : numberStory,
          href
        });
      }
    });
    return result;
  };

  private getContentStory = (html: string, chapter: string) => {
    const $ = cheerio.load(html);
    const name = $('h1.truyen-title a').text().trim();
    const chapterTitle = $('.content .chapter h2').text().trim();
    const chap = chapter.toString() || '';
    const title = $('.content .chapter h2').text().trim();
    const author = $('.chapter .text-center strong a').text().trim();
    const datePost = $('.chapter .text-center').eq(1).text().trim();
    const content = $('.box-chap').text().trim();
    const story = {
      name,
      chapterTitle,
      chap,
      title,
      author,
      datePost,
      content
    };

    return story;
  };

  private getListChapterStory = (html: string, chapter: string, url: string) => {
    const $ = cheerio.load(html);
    const totalChapterText = $('#j-bookCatalogPage').text().trim();
    const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
    const maxChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;
    const title = $('.book-info h1').text().trim();
    const host = url;

    const listChapter: Array<{ content: string; href: string }> = [];
    $('.volume-wrap #max-volume .cf li ').each((index, element) => {
      const content = $(element).find('a').attr('title')?.toString() || '';
      const href = $(element).find('a').attr('href') || '';
      listChapter.push({
        content,
        href
      });
    });

    const result: ListChapter = {
      title,
      host,
      maxChapter,
      listChapter
    };
    return result;
  };

  private getNewestStoryAtCategory = (html: string, limiter?: number) => {
    const result = this.getStory(html, limiter);
    return result;
  };

  private getNumberValueFromString(input: string): any {}
  public async getMaxChapterPage(title: string): Promise<any> {}
  public async search(title: string, page?: string, category?: string): Promise<any> {
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
        result = result.filter((story) =>
          story.categoryList.filter((el) => el.content === category)
        );
      }
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  async newestStory(limiter?: number, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?ord=new&page=${page}`;
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
  }
  async fullStory(limiter?: number, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=nm&page=${page}`;
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
  }
  async hotStory(limiter?: number, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=vw&page=${page}`;
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
  public async contentStory(title: string, chap?: string): Promise<any> {
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
      result = this.getContentStory(html, chap as string);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  public async chapterList(title: string, page?: string): Promise<any> {
    let result: ListChapter;
    try {
      const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      const url = this.getBaseUrl();
      result = this.getListChapterStory(html, page as string, url as string);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
    let result: DetailStory[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getDetailStory(html);
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
module.exports = {
  plugin: TangThuVienPlugin
};
