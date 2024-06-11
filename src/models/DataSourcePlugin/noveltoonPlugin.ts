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
  //host: string;
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
interface changeDataSourceStory {
  data: Story;
  message: string;
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

  public async searchByTitle(title: string, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/vi/search?word=${title}`;
    let result: Story[] | null = [];
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
      const story: Story = {
        name,
        link,
        cover,
        description: description,
        author: 'no information',
        categoryList: category,
        title: 'no information',
        host: `${this.getBaseUrl()}`,
        authorLink: 'no information',
        view: 'no information'
      };
      result.push(story);
    });
    return result;
  };
  private getStoryMostLikeTitle = (html: string, searchedTitle: string) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);

    const elements = $('.recommend-comics .recommend-item');

    if (elements.length === 0) {
      return null;
    }

    $('.recommend-comics .recommend-item ').each((index, element) => {
      if (result.length === 1) return;

      const name = $(element).find('.recommend-comics-title').text().trim();
      const link = $(element).find('a').attr('href') || '';
      const cover = $(element).find('a .comics-image img').attr('data-src') || '';
      const description = $(element).find('.comics-type span').text().trim();
      const category = convertStringToCategoryList(description, '/');

      const lowerCaseName: string = name.toLowerCase();
      const lowerCaseTitle: string = searchedTitle.toLowerCase();
      const found: boolean =
        lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);

      if (found) {
        const story: Story = {
          name,
          link,
          cover,
          description: description,
          author: 'no information',
          categoryList: category,
          title: 'no information',
          host: `${this.getBaseUrl()}`,
          authorLink: 'no information',
          view: 'no information'
        };
        result.push(story);
      }
    });
    return result;
  };
  private getDetailStory = (html: string) => {
    const result: DetailStory[] = [];
    const $ = cheerio.load(html);
    const $$ = $('.detail-top .detail-top-mask');
    const name = $$.find('.detail-top-title h1.detail-title').text().trim();
    const author = $$.find('.detail-author.app-author.select-text').text().trim();
    const cover = $$.find('.detail-top-right img').attr('src') || '';
    const description = $$.find('.detail-desc p.detail-desc-info').text().trim();
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
      authorLink: 'no information'
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
      const story: Story = {
        name,
        link,
        cover,
        description: description,
        author: 'no information',
        categoryList: category,
        title: 'no information',
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
       // host: `${this.getBaseUrl()}`,
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
    if (temp) {
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
    try {
      const content_id = (await this.search(title))[0].link.split('?')[1].split('=')[1];
      console.log('content_id: ', content_id);
      const chapter = (await this.chapterList(title, '0')).listChapter[Number(chap) - 1].href;
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
    return result;
  }
  public async chapterList(title: string, page?: string): Promise<any> {
    let result: ListChapter;
    try {
      const resultSearch = await this.search(title);
      if (resultSearch.length === 0) return null;
      const searchString = resultSearch[0].link;

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
    const resultSearch = await this.search(title);
    if (resultSearch.length === 0) return null;
    const searchString = resultSearch[0].link;
    // const searchString: string = `${this.getBaseUrl()}/vi/${title}?content_id=${content_id || 0}`;
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
