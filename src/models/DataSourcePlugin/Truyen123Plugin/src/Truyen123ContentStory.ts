import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import cheerio from 'cheerio';
import { getNumberValueFromString } from '~/utils/StringUtility';
import { ContentStory } from '~/models/Interfaces/ContentStory';
import { Story } from '~/models/Interfaces/Story';
import { ChangeDataSourceStory } from '~/models/Interfaces/ChangeDataSourceStory';
import { ListChapter } from '~/models/Interfaces/ListChapter';

export default class Truyen123ContentStory implements IContentStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'TruyenfullSearchStory';
    this.baseUrl = url;
  }
  clone(): IContentStory {
    return new Truyen123ContentStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public async contentStory(title: string, chap?: string): Promise<any> {
    if (!chap) chap = '1';
    const searchString: string = `${this.getBaseUrl()}/${title}/chuong-${chap}`;
    const searchString2: string = `${this.getBaseUrl()}/${title}`;
    try {
      console.log('searchString: ', searchString);
      console.log('searchString2: ', searchString2);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const response2 = await fetch(searchString2, {
        method: 'GET'
      });
      if (response.ok && response2.ok) {
        const text = await response.text();

        const $ = cheerio.load(text);

        const name = $('.wrapper').find('a.truyen-title').text();
        const host = this.getBaseUrl();
        const chapterTitle = $('.wrapper').find('div.chapter-title').text().trim();
        $('.wrapper').find('.chapter-content div').remove();
        let content = $('.wrapper').find('div.chapter-content').html() ?? '';
        content = content.replace(/<!-- (.*?) -->/gm, '');
        //content = content.replace(/<p(.*?)>(.*?)<?p>/g, '');
        content = content.replace(/<span(.*?)>(.*?)<?span>/g, '');
        content = content.replace(/<p style=(.*?)>(.*?)(<a.*?>.*?<\/a>)?(.*?)<\/p>/g, '');
        content = content.replace(/\n/g, '<br>');
        content = content.replaceAll(/<\/?p>|<br>/g, '');
        content = content.trim();

        const text2 = await response2.text();

        const $2 = cheerio.load(text2);

        const cover = $2('.wrapper').find('.book img').first().attr('src') || '';
        const author = $2('.wrapper').find('.info').find('[itemprop="author"]').text();

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
  public async chapterList(title: string, page?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/${title}?page=${page}#list-chapter`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();

        const $ = cheerio.load(text);

        const host = this.getBaseUrl();
        const maxChapterDiv = $('.wrapper').find('.l-chapter .l-chapters li a span').first();

        const maxChapter = getNumberValueFromString(maxChapterDiv.text());
        const listChapter = $('.wrapper')
          .find('.list-chapter li a')
          .map((_, childElement) => {
            const content = $(childElement).text().trim();
            const href = $(childElement).attr('href')?.split('/').pop();
            return { content, href };
          })
          .get();

        const maxPage = await this.getMaxChapterPage(title);
        const chapterPerPage: number = 50;
        const data: object = {
          title,
          host,
          maxChapter,
          listChapter,
          currentPage: getNumberValueFromString(page),
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
  public async getMaxChapterPage(title: string): Promise<number | undefined | null> {
    const searchString: string = `${this.getBaseUrl()}/${title}?page=${1}#list-chapter`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();

        const $ = cheerio.load(text);

        const chapterPagination: { content: string; href: string | undefined }[] | undefined =
          ($('.wrapper')
            .find('.pagination li a')
            .map((_, childElement) => {
              const content = $(childElement).text().trim();
              const href = $(childElement).attr('href')?.split('/').pop();
              return { content, href };
            })
            .get() as { content: string; href: string | undefined }[]) || [];
        // .pop();

        const maxPage =
          chapterPagination.length > 0
            ? chapterPagination[chapterPagination.length - 2].content
            : '0';

        const valueMaxPage = getNumberValueFromString(maxPage ? maxPage : '0');

        const data: number = valueMaxPage;
        //console.log(data)
        return data;
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
    const searchString: string = `${this.getBaseUrl()}/search?q=${encodeURIComponent(title)}&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
        let data: Story[] | null = [];
        data = this.getStoryMostLikeTitle(text, title);

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  private getStoryMostLikeTitle(html: string, title: string): Story[] | null {
    const data: Story[] = [];

    const $ = cheerio.load(html);
    const elements = $('.list-new .row');

    if (elements.length === 0) {
      return null;
    }

    $('.list-new .row').each((index, element) => {
      if (data.length === 1) {
        return;
      }
      const name = $(element).find('.col-title h3').first().text().trim();
      const link = $(element).find('a').first().attr('href') || '';
      const url = new URL(link ?? '');
      const titleOfStory = url.pathname.substr(1);
      const cover =
        $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '') || '';
      const description = $(element).find('.chapter-text').first().text();
      const author = $(element)
        .find('.col-author a')
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .text()
        .trim();
      const authorUrl = $(element).find('.col-author a').attr('href');
      const authorLink = authorUrl?.split('/').pop() || '';
      const view = $(element).find('.col-view.show-view').text().trim();
      const categoryList = $(element)
        .find('.col-category a')
        .map((_, childElement) => {
          const content = $(childElement).text().trim() || '';
          const href = $(childElement).attr('href')?.split('/').pop() || '';
          return { content, href };
        })
        .get();

      const lowerCaseName: string = name.toLowerCase();
      const lowerCaseTitle: string = title.toLowerCase();
      let found: boolean = //lowerCaseName === lowerCaseTitle;
        lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);
      //console.log('found in search by title: ', found);

      if (name.length === 0) {
        found = false;
      }

      if (found) {
        data.push({
          name,
          link,
          title: titleOfStory,
          cover,
          description,
          host: this.getBaseUrl(),
          author,
          authorLink,
          view,
          categoryList
        });
      }
    });
    return data;
  }
  public async changeContentStoryToThisDataSource(title: string, chap?: string): Promise<any> {
    if (!chap) chap = '1';
    try {
      const story: ChangeDataSourceStory | null =
        await this.changeDetailStoryToThisDataSource(title);

      const foundTitle: string | undefined =
        story && story.data && story.message === 'found' ? story.data.title : undefined;
      // story && story.data && story.data.length >= 1 ? story.data[0].title : undefined;

      const checkedTitle: string = foundTitle ?? '';
      // console.log('checkedTitle: ', checkedTitle);
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
}
