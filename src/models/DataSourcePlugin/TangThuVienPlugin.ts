import { IDataSourcePlugin } from '../DataSource/IDataSourcePlugin';
import cheerio from 'cheerio';
export interface Category {
  content: string;
  host: string;
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
}

export interface DetailStory {
  name: string;
  title: string;
  link: string;
  cover: string;
  description: string;
  author: string;
  authorLink: string;
  category: string;
  detail: string;
  host: string;
}

export interface ContentStory {
  name: string;
  title: string;
  chap: string;
  chapterTitle: string;
  content: string;
  author: string;
  cover: string;
  host: string;
}

export interface ListChapter {
  title: string;
  host: string;
  maxChapter: number;
  listChapter: {
    content: string;
    href: string;
  }[];
  currentPage: number;
  maxPage: number;
  chapterPerPage: number;
}

function removeVietnameseAccents(str: string): string {
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

export class TangThuVienPlugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://truyen.tangthuvien.vn/';
  public constructor(name: string) {
    this.name = name;
  }

  getBaseUrl(): string {
    return TangThuVienPlugin.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new TangThuVienPlugin(name);
  }

  private getDetailStory = (html: string, searchString: string) => {
    const result: DetailStory[] = [];
    const $ = cheerio.load(html);
    const name = $('.book-info h1 ').text().trim();
    const link = searchString;
    const host = this.getBaseUrl();
    const cover = $('.book-img a img').attr('src') || '';
    const description = $('.book-info-detail .book-intro p').text().trim();
    const author = $('.tag a.blue').text().trim();
    const authorLink = convertString(author);
    // method eq(1) lấy element thứ 2 xuất hiện
    const category = $('.tag a.red').eq(0).text().trim();
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
      title: 'no information',
      link,
      cover,
      description,
      author,
      authorLink,
      category,
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
      const link = convertString(name);

      const story: Story = {
        name,
        cover,
        description,
        author,
        categoryList: [].concat(category) as { content: string; href: string }[],
        link,
        title: 'no information',
        host: 'https://truyen.tangthuvien.vn/',
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
        const href = link.attr('href') || '';

        result.push({
          content,
          host: this.getBaseUrl(),
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

  private getListChapterStory = (html: string, page: string, url: string) => {
    const $ = cheerio.load(html);
    const totalChapterText = $('#j-bookCatalogPage').text().trim();
    const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
    const maxChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;
    const title = $('.book-info h1').text().trim();
    const host = url;
    const currentPage = Number(page) || 1;
    const listChapter: Array<{ content: string; href: string }> = [];
    $('.volume-wrap #max-volume .cf li ').each((index, element) => {
      const content = $(element).find('a').attr('title')?.toString() || '';
      const href = $(element).find('a').attr('href') || '';
      listChapter.push({
        content,
        href
      });
    });
    const chapterPerPage = listChapter.length - 1;
    const maxPage = Math.ceil(maxChapter / listChapter.length);

    const result: ListChapter = {
      title,
      host,
      maxChapter,
      listChapter,
      currentPage,
      maxPage,
      chapterPerPage
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
  async newestStory(limiter?: number, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?ord=new&page=${page}`;
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
      result = this.getContentStory(html, chap as string);
    } catch (err) {
      console.log(err);
      return null;
    }
    return { ...result, cover: storyDetail.cover };
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
    let result: DetailStory;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getDetailStory(html, searchString);
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
