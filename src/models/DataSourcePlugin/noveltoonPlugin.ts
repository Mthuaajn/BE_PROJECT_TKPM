import { IDataSourcePlugin } from '~/models/DataSource/IDataSourcePlugin';
import cheerio from 'cheerio';
import { listChapter } from '~/controllers/DataSource.controllers';

interface Story {
  name: string;
  link: string;
  title: string;
  cover: string;
  description: string;
  host: string;
  author: string;
  authorLink: string;
  categoryList: {
    content: string;
    href: string;
  }[];
  view: string;
}

interface ListChapter {
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

interface Category {
  content: string;
  host: string;
  href: string;
}

interface DetailStory {
  name: string;
  title: string;
  cover: string;
  link: string;
  author: string;
  authorLink: string;
  description: string;
  categoryList: {
    content: string;
    href: string;
  }[];
  detail: string;
  host: string;
}

interface ContentStory {
  name: string;
  title: string;
  chap: string;
  chapterTitle: string;
  content: string;
  author: string;
  cover: string;
  hot: string;
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
  return kebabCaseStr;
}

function cutStringTitle(input: string): string {
  const result = input.split('/vi/');
  return result[1];
}

function findNumberFromString(input: string): boolean {
  const regex = /\d+/g;
  const matches = input.match(regex);
  if (matches === null) {
    return false;
  }
  return true;
}

function findContent_id(input: string): string {
  const result = input.split('?')[1].split('=')[1];
  return result;
}

function convertStringToCategoryList(
  input: string,
  separate: string
): { content: string; href: string }[] {
  return input
    .split(separate)
    .map((el, index) => {
      const trimmedCategory = el.trim();
      return {
        content: trimmedCategory,
        href: convertString(trimmedCategory)
      };
    })
    .filter((el) => el.content.toLocaleLowerCase() !== 'đã full');
}

export class NoveltoonPlugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://noveltoon.vn/';
  public constructor(name: string) {
    this.name = name;
  }

  getBaseUrl(): string {
    return NoveltoonPlugin.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new NoveltoonPlugin(name);
  }

  private getStoryForSearch = (html: string) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);
    $('.recommend-comics .recommend-item ').each((index, element) => {
      const name = $(element).find('.recommend-comics-title').text().trim();
      const link = $(element).find('a').attr('href') || '';
      const cover = $(element).find('a .comics-image img').attr('data-src') || '';
      const description = $(element).find('.comics-type span').text().trim();
      const category = convertStringToCategoryList(description, '/');
      const title = cutStringTitle(link);
      const story: Story = {
        name,
        link,
        cover,
        description: description,
        author: 'no information',
        categoryList: category,
        title,
        host: `${this.getBaseUrl()}`,
        authorLink: 'no information',
        view: 'no information'
      };
      result.push(story);
    });
    return result;
  };

  private getDetailStory = (html: string) => {
    const result: DetailStory[] = [];
    const $ = cheerio.load(html);
    const $$ = $('.detail-top .detail-top-mask');
    const name = $$.find('.detail-top-title h1.detail-title').text().trim();
    const author = $$.find('.detail-author.web-author').text().trim();
    const cover = $$.find('.detail-top-right img').attr('src') || '';
    const description = $$.find('.detail-desc p.detail-desc-info').text().trim();
    const authorLink = convertString(author);
    const listCategory = $('.detail-tag-content .detail-tag-item')
      .map((index, element): { content: string; href: string } => {
        const content = $(element).find('a span').text().trim();

        const href = $(element).find('a').attr('href') || '|';
        return {
          content,
          href
        };
      })
      .filter((index, el) => el.content.toLocaleLowerCase() !== 'đã full');
    const story: DetailStory = {
      name,
      title: 'no information',
      cover,
      description,
      categoryList: listCategory.get(),
      link: 'no information',
      host: `${this.getBaseUrl()}`,
      detail: 'full',
      author,
      authorLink
    };
    return story;
  };

  private getStory = (html: string, limiter?: number) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);
    $('.genre-content a.genre-item-box').each((index, element) => {
      if (limiter && index >= limiter) return;
      const name = $(element).find('.genre-item-info p.genre-item-title').text().trim();
      const link = $(element).attr('href') || '';
      const cover = $(element).find('.genre-item-image img').attr('src') || '';
      const description = $(element).find('.genre-item-label').text().trim();
      const category = convertStringToCategoryList(description, '|');
      const title = cutStringTitle(link);
      const story: Story = {
        name,
        link,
        cover,
        description: description,
        author: 'no information',
        categoryList: category,
        title,
        host: `${this.getBaseUrl()}`,
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
    const length = $('.channel-list a').length;
    $('.channel-list a').each((index, element) => {
      if (index == 0) return;
      const content = $(element).find('.channel').text().trim();
      const href = $(element).attr('href') || '';
      result.push({
        content,
        host: `${this.getBaseUrl()}`,
        href
      });
    });
    return result;
  };

  private getContentStory = (html: string, chapter: string) => {
    const $ = cheerio.load(html);
    const name = $('.watch-main').find('.watch-main-top .watch-main-title').eq(0).text().trim();
    const chap = chapter.toString() || '';
    const chapterTitle = $('.watch-main')
      .find('.watch-chapter-content h1.watch-chapter-title')
      .text()
      .trim();
    let content;
    const temp = $('.watch-main').find('.chart-story .row');
    if (temp.length > 0) {
      content = temp
        .map((index, el) => {
          return $(el).text().trim();
        })
        .get()
        .join('\n');
    } else {
      const listContent = $('.watch-main').find('.watch-chapter-content .watch-chapter-detail p');
      content = listContent
        .map((index, el) => {
          return $(el).text().trim();
        })
        .get()
        .join('\n');
    }

    const hot = `${this.getBaseUrl()}`;
    const story = {
      name,
      chapterTitle,
      chap,
      title: 'no information',
      author: 'no information',
      content,
      hot,
      cover: 'no information'
    };
    // console.log('story: ', story);
    return story;
  };

  private getListChapterStory = (html: string, chapter: string, url: string) => {
    const $ = cheerio.load(html);

    const $$ = $('.detail-top .detail-top-mask');
    const title = $$.find('.detail-top-title h1.detail-title').text().trim();
    const host = url;
    const maxChapterString =
      $('.episodes-content .episodes-top .episodes-total').text().trim() || '';
    const maxChapterMatch = maxChapterString.match(/\d+/);
    const maxChapter = maxChapterMatch ? parseInt(maxChapterMatch[0], 10) : 0;
    const ListCategory = $('.episodes-info#positive')
      .find('a.episodes-info-a-item')
      .map((index, el) => {
        const content = $(el)
          .find('.episode-item-detail span')
          .text()
          .replace(/[^\w\s\d:]+$/g, '')
          .trim();
        const href = $(el).find('.episodes-item').attr('data-id')?.toString() || '';
        return {
          content,
          href
        };
      });
    const result: ListChapter = {
      title,
      host,
      maxChapter: maxChapter,
      listChapter: ListCategory.get(),
      currentPage: Number(chapter) || 1,
      maxPage: Math.ceil(maxChapter / ListCategory.get().length) - 1 || 1,
      chapterPerPage: ListCategory.get().length || 1
    };
    return result;
  };

  private getNewestStoryAtCategory = (html: string, limiter?: number) => {};

  private getNumberValueFromString(input: string): any {}
  public async getMaxChapterPage(title: string): Promise<any> {}
  public async search(title: string, page?: string, category?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/vi/search?word=${title}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStoryForSearch(html);
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
    const searchString = `${this.getBaseUrl()}//vi/genre/2/0/1?page=${page || 0}`;
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
    const searchString = `${this.getBaseUrl()}//vi/genre/2/0/2?page=${page || 0}`;
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
    const searchString = `${this.getBaseUrl()}//vi/genre/2/0/0?page=${page || 0}`;
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
  async categoryList(): Promise<Category[]> {
    let result: Category[] = [];
    try {
      const searchString: string = `${this.getBaseUrl()}vi/genre/novel`;
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
      const hot = await this.hotStory(12, '0');
      const full = await this.fullStory(12, '0');
      const newest = await this.newestStory(12, '0');

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
    // const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}/chuong-${chap}`;
    let result: ContentStory;
    const resultDetailStory = await this.detailStory(title);
    const tempTitle = title;
    title = resultDetailStory.name;
    console.log('title sau khi decode: ', title);
    try {
      const content_id = findContent_id(tempTitle);
      console.log('content_id: ', content_id);
      const chapter = (await this.chapterList(tempTitle, '0')).listChapter[Number(chap) - 1].href;
      console.log('chapter: ', chapter);
      const searchString = `${this.getBaseUrl()}/vi/watch/${content_id}/${chapter}`;
      console.log('searchString: ', searchString);
      const detailStory = await this.detailStory(title);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getContentStory(html, chap as string);
      result = {
        ...result,
        author: detailStory.author,
        cover: detailStory.cover
      };
    } catch (err) {
      console.log(err);
      return null;
    }
    return {
      ...result,
      title: tempTitle,
      author: resultDetailStory.author,
      cover: resultDetailStory.cover
    };
  }
  public async chapterList(title: string, page?: string): Promise<any> {
    let result: ListChapter;
    try {
      const resultSearch = await this.detailStory(title);
      if (resultSearch.length === 0) return null;
      const searchString = resultSearch.link;
      console.log('searchString: " ', searchString);
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
    // const resultSearch = await this.search(title);
    // if (resultSearch.length === 0) return null;
    // const searchString = resultSearch[0].link;
    const searchString: string = `${this.getBaseUrl()}/vi/${title}`;
    console.log('searchString: ', searchString);
    let result: DetailStory;
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
    const StorySearch = await this.search(result.name);
    let story: Story = {
      author: 'no information',
      authorLink: 'no information',
      categoryList: [],
      cover: 'no information',
      description: 'no information',
      host: 'no information',
      link: 'no information',
      name: 'no information',
      title: 'no information',
      view: 'no information'
    };
    StorySearch.forEach((el: Story) => {
      if (el.name === result.name) {
        story = el;
      }
    });
    return {
      ...result,
      title: cutStringTitle(searchString),
      link: StorySearch[0].link
    };
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
  private async getStoryWithSearchString(searchString: string): Promise<any> {}

  public async newestStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {}

  public async fullStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {}

  public async hotStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {}
}
module.exports = {
  plugin: NoveltoonPlugin
};
