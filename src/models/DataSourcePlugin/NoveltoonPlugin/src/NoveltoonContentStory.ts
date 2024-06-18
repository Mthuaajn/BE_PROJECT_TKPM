import { DetailStory } from './../../../Interfaces/DetailStory';
import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import cheerio from 'cheerio';
import { ListChapter } from '~/models/Interfaces/ListChapter';
import { ContentStory } from '~/models/Interfaces/ContentStory';
import { PartialContentStory } from '~/models/Interfaces/PartialContentStory';
import NoveltoonDetailStory from './NoveltoonDetailStory';
import { Story } from '~/models/Interfaces/Story';
import { ChangeDataSourceStory } from '~/models/Interfaces/ChangeDataSourceStory';
export default class NoveltoonContentStory implements IContentStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'NoveltoonContentStory';
    this.baseUrl = url;
  }
  clone(): IContentStory {
    return new NoveltoonContentStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }

  private removeVietnameseAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
  private convertString(input: string): string {
    // Chuyển đổi chuỗi về chữ thường
    const lowerCaseStr = input.toLowerCase();

    // Bỏ dấu tiếng Việt
    const noAccentsStr = this.removeVietnameseAccents(lowerCaseStr);

    // Thay thế các dấu cách bằng dấu gạch ngang
    const kebabCaseStr = noAccentsStr.split(' ').join('-');
    return kebabCaseStr;
  }
  private cutStringTitle(input: string): string {
    const result = input.split('/vi/');
    return result[1];
  }
  private convertStringToCategoryList(
    input: string,
    separate: string
  ): { content: string; href: string }[] {
    return input
      .split(separate)
      .map((el, index) => {
        const trimmedCategory = el.trim();
        return {
          content: trimmedCategory,
          href: this.convertString(trimmedCategory)
        };
      })
      .filter((el) => el.content.toLocaleLowerCase() !== 'đã full');
  }
  private findContent_id(input: string): string {
    const result = input.split('?')[1].split('=')[1];
    return result;
  }
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

    const host = this.getBaseUrl();
    const story = {
      name,
      chapterTitle,
      chap,
      author: 'no information',
      content,
      host
    };
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

  public async chapterList(title: string, page?: string): Promise<any> {
    let result: ListChapter;
    const searchString: string = `${this.getBaseUrl()}/vi/${title}`;
    try {
      console.log('searchString: ', searchString);
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
  public async contentStory(title: string, chap?: string): Promise<any> {
    let result: ContentStory;
    const tempTitle = title;
    let data: PartialContentStory;
    if (!chap) chap = '1';
    try {
      const content_id = this.findContent_id(tempTitle);
      console.log('content_id: ', content_id);

      const chapNumber: number = Number.parseInt(chap);
      const chaptersList: ListChapter = (await this.chapterList(title, '1')) as ListChapter;

      if (chaptersList === null) {
        console.log('ChapterList is null');
        return null;
      }

      if (
        chapNumber > chaptersList.listChapter.length ||
        !chaptersList.listChapter[chapNumber - 1] ||
        chaptersList.listChapter[chapNumber - 1] === null ||
        chaptersList.listChapter[chapNumber - 1] === undefined
      ) {
        return null;
      }
      const chapter = chaptersList.listChapter[chapNumber - 1].href;
      console.log('chapter: ', chapter);
      const searchString = `${this.getBaseUrl()}/vi/watch/${content_id}/${chapter}`;
      console.log('searchString: ', searchString);
      const detailStory = (await new NoveltoonDetailStory(this.baseUrl).detailStory(
        title
      )) as DetailStory;
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      data = this.getContentStory(html, chap as string);
      result = {
        author: detailStory.author,
        cover: detailStory.cover,
        name: data.name,
        title,
        chap: data.chap,
        chapterTitle: data.chapterTitle,
        content: data.content,
        host: data.host
      };
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  private getStoryMostLikeTitle = (html: string, searchedTitle: string) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);
    const elements = $('.recommend-comics .recommend-item ');

    if (elements.length === 0) {
      return null;
    }

    $('.recommend-comics .recommend-item ').each((index, element) => {
      if (result.length === 1) return;
      const name = $(element).find('.recommend-comics-title').text().trim();
      const link = $(element).find('a').attr('href') || '';
      const cover = $(element).find('a .comics-image img').attr('data-src') || '';
      const description = $(element).find('.comics-type span').text().trim();
      const category = this.convertStringToCategoryList(description, '/');
      const title = this.cutStringTitle(link);

      const lowerCaseName: string = name.toLowerCase();
      const lowerCaseTitle: string = searchedTitle.toLowerCase();
      let found: boolean = //lowerCaseName === lowerCaseTitle;
        lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);

      if (name.length === 0) {
        found = false;
      }

      if (found) {
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
      }
    });
    return result;
  };
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
  public async changeContentStoryToThisDataSource(
    title: string,
    chap?: string | undefined
  ): Promise<any> {
    if (!chap) chap = '1';
    try {
      const story: ChangeDataSourceStory | null =
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
}
