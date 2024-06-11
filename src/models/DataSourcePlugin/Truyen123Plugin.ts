import { IDataSourcePlugin } from '../DataSource/IDataSourcePlugin';
import cheerio from 'cheerio';
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
interface ChapterListTruyen123 {
  title: string;
  host: string;
  maxChapter: number;
  listChapter: { content: string; href: string }[];
  currentPage: number;
  maxPage: number;
  chapterPerPage: number;
}

export class Truyen123Plugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://123truyen.info';
  public constructor(name: string) {
    this.name = name;
  }

  getBaseUrl(): string {
    return Truyen123Plugin.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new Truyen123Plugin(name);
  }

  public async changeContentStoryToThisDataSource(title: string, chap?: string): Promise<any> {
    if (!chap) chap = '1';
    try {
      const story: changeDataSourceStory | null =
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

      const chapterPaginationData: ChapterListTruyen123 = await this.chapterList(checkedTitle);
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

        const $ = cheerio.load(text);

        const elements = $('.list-new .row');

        if (elements.length === 0) {
          return null;
        }
        $('.list-new .row').each((index, element) => {
          if (data.length === 1) {
            return;
          }
          const name = $(element).find('.col-title h3').first().text().trim();

          const link = $(element).find('a').first().attr('href');
          const url = new URL(link ?? '');
          const titleOfStory = url.pathname.substr(1);
          const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
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
          const authorLink = authorUrl?.split('/').pop();
          const view = $(element).find('.col-view.show-view').text().trim();
          const categoryList = $(element)
            .find('.col-category a')
            .map((_, childElement) => {
              const content = $(childElement).text().trim();
              const href = $(childElement).attr('href')?.split('/').pop();
              return { content, href };
            })
            .get();

          const lowerCaseName: string = name.toLowerCase();
          const lowerCaseTitle: string = title.toLowerCase();
          const found: boolean =
            lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);
          //console.log('found in search by title: ', found);

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
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async search(title: string, page?: string, category?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/search?q=${encodeURIComponent(title)}&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        // let doc = response.html();
        // let data = [];
        // doc.select(".list-new .row").forEach(e => {
        //     data.push({
        //         name: e.select(".col-title h3").first().text(),
        //         link: e.select("a").first().attr("href"),
        //         cover: e.select(".thumb img").first().attr("src").replace('-thumbw',''),
        //         description: e.select(".chapter-text").first().text(),
        //         host: this.getBaseUrl()
        //     });
        // });

        //console.log(response)
        // return Response.success(data);
        const text = await response.text();
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

        const $ = cheerio.load(text);
        // htmlDoc.select(".list-new .row").forEach(e => {
        //     data.push({
        //         name: e.select(".col-title h3").first().text(),
        //         link: e.select("a").first().attr("href"),
        //         cover: e.select(".thumb img").first().attr("src").replace('-thumbw',''),
        //         description: e.select(".chapter-text").first().text(),
        //         host: this.getBaseUrl()
        //     });
        // });
        $('.list-new .row').each((index, element) => {
          const name = $(element).find('.col-title h3').first().text().trim();

          const link = $(element).find('a').first().attr('href');
          const url = new URL(link ?? '');
          const title = url.pathname.substr(1);
          const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
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
          const authorLink = authorUrl?.split('/').pop();
          const view = $(element).find('.col-view.show-view').text().trim();
          const categoryList = $(element)
            .find('.col-category a')
            .map((_, childElement) => {
              const content = $(childElement).text().trim();
              const href = $(childElement).attr('href')?.split('/').pop();
              return { content, href };
            })
            .get();
          data.push({
            name,
            link,
            title,
            cover,
            description,
            host: this.getBaseUrl(),
            author,
            authorLink,
            //   view: undefined,
            //   categoryList: undefined,
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
        // .map((_, childElement) => {
        //   const text = $(childElement).text();
        //   console.log(text);
        //   return text;
        // });
        //console.log("maxChapterDiv: ",maxChapterDiv);
        const maxChapter = this.getNumberValueFromString(maxChapterDiv.text());
        const listChapter = $('.wrapper')
          .find('.list-chapter li a')
          .map((_, childElement) => {
            const content = $(childElement).text().trim();
            const href = $(childElement).attr('href')?.split('/').pop();
            return { content, href };
          })
          .get();
        // const chapterPagination: { content: string; href: string | undefined }[] | undefined =
        //   ($('.wrapper')
        //     .find('.pagination li a')
        //     .map((_, childElement) => {
        //       const content = $(childElement).text().trim();
        //       const href = $(childElement).attr('href')?.split('/').pop();
        //       return { content, href };
        //     })
        //     .get() as { content: string; href: string | undefined }[]) || [];
        // // .pop();

        // const maxPage =
        //   chapterPagination.length > 0
        //     ? chapterPagination.forEach((value, index) => {
        //         const number: number = this.getNumberValueFromString(value.content);
        //         if (number != -1) {
        //           return number;
        //         }
        //       })
        //     : undefined;

        const maxPage = await this.getMaxChapterPage(title);
        const chapterPerPage: number = 50;
        const data: object = {
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

        const valueMaxPage = this.getNumberValueFromString(maxPage ? maxPage : '0');
        // chapterPagination.length > 0
        //   ? chapterPagination.forEach((value, index) => {
        //       const number: number = this.getNumberValueFromString(value.content);
        //       if (number != -1) {
        //         return number;
        //       }
        //     }).get()
        //   : undefined;

        const data: number = valueMaxPage;
        //console.log(data)
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/${title}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();

        const $ = cheerio.load(text);

        const name = $('.wrapper').find('h1.title').first().text();
        const cover = $('.wrapper').find('.book img').first().attr('src');
        const author = $('.wrapper').find('.info').find('[itemprop="author"]').text();
        const authorUrl = new URL(
          $('.wrapper').find('.info').find('[itemprop="author"]').attr('href') ?? ''
        );
        const authorLink = authorUrl.pathname.split('/').pop();
        const categoryList = $('.wrapper')
          .find('.info')
          .find('a[itemprop="genre"]')
          .map((_, childElement) => {
            const content = $(childElement).text().trim();
            const href = $(childElement).attr('href')?.split('/').pop();
            return { content, href };
          })
          .get();
        // const author = (
        //   $('.wrapper').find('.container .info > div > div ').get(0) as unknown as HTMLElement
        // )?.textContent?.toString();
        const description = $('.wrapper').find('.desc-text').text().trim().replaceAll('<br>', ' '); //.find('br').text();
        const detail = $('.wrapper').find('.info .label').text();
        const host = this.getBaseUrl();
        const link = searchString;
        const maxChapterDiv = $('.wrapper').find('.l-chapter .l-chapters li a span').first();
        // .map((_, childElement) => {
        //   const text = $(childElement).text();
        //   console.log(text);
        //   return text;
        // });
        //console.log("maxChapterDiv: ",maxChapterDiv);

        /* const maxChapter = this.getNumberValueFromString(maxChapterDiv.text());
        const listChapter = $('.wrapper')
          .find('.list-chapter li a')
          .map((_, childElement) => {
            const content = $(childElement).text().trim();
            const href = $(childElement).attr('href')?.split('/').pop();
            return { content, href };
          })
          .get();
        const chapterPagination = $('.wrapper')
          .find('.pagination li a')
          .map((_, childElement) => {
            const content = $(childElement).text().trim();
            const href = $(childElement).attr('href')?.split('/').pop();
            return { content, href };
          })
          .get();*/
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
          // maxChapter,
          // listChapter,
          // chapterPagination,
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

  public async contentStory(title: string, chap?: string): Promise<any> {
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
        // console.log('content: ', content);
        content = content.replace(/<!-- (.*?) -->/gm, '');
        //content = content.replace(/<p(.*?)>(.*?)<?p>/g, '');
        content = content.replace(/<span(.*?)>(.*?)<?span>/g, '');
        content = content.replace(/<p style=(.*?)>(.*?)(<a.*?>.*?<\/a>)?(.*?)<\/p>/g, '');
        content = content.replace(/\n/g, '<br>');
        content = content.replaceAll(/<\/?p>|<br>/g, '');
        content = content.trim();

        const text2 = await response2.text();

        const $2 = cheerio.load(text2);

        const cover = $2('.wrapper').find('.book img').first().attr('src');
        const author = $2('.wrapper').find('.info').find('[itemprop="author"]').text();

        const data: object = {
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
  public async newestStory(limiter?: number, page?: string): Promise<any> {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/danh-sach/truyen-moi?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
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

        const $ = cheerio.load(text);
        $('.list-new .row').each((index, element) => {
          if (index >= limiter) {
            return;
          }
          const name = $(element).find('.col-title h3').first().text().trim();

          const link = $(element).find('a').first().attr('href');
          const url = new URL(link ?? '');
          const title = url.pathname.substr(1);
          const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
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
          const authorLink = authorUrl?.split('/').pop();
          const view = $(element).find('.col-view.show-view').text().trim();
          const categoryList = $(element)
            .find('.col-category a')
            .map((_, childElement) => {
              const content = $(childElement).text().trim();
              const href = $(childElement).attr('href')?.split('/').pop();
              return { content, href };
            })
            .get();
          data.push({
            name,
            link,
            title,
            cover,
            description,
            host: this.getBaseUrl(),
            author,
            authorLink,
            //   view: undefined,
            //   categoryList: undefined,
            view,
            categoryList
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
  public async fullStory(limiter?: number, page?: string): Promise<any> {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/danh-sach/truyen-full?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
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

        const $ = cheerio.load(text);
        $('.list-new .row').each((index, element) => {
          if (index >= limiter) {
            return;
          }
          const name = $(element).find('.col-title h3').first().text().trim();

          const link = $(element).find('a').first().attr('href');
          const url = new URL(link ?? '');
          const title = url.pathname.substr(1);
          const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
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
          const authorLink = authorUrl?.split('/').pop();
          const view = $(element).find('.col-view.show-view').text().trim();
          const categoryList = $(element)
            .find('.col-category a')
            .map((_, childElement) => {
              const content = $(childElement).text().trim();
              const href = $(childElement).attr('href')?.split('/').pop();
              return { content, href };
            })
            .get();
          data.push({
            name,
            link,
            title,
            cover,
            description,
            host: this.getBaseUrl(),
            author,
            authorLink,
            //   view: undefined,
            //   categoryList: undefined,
            view,
            categoryList
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
  public async hotStory(limiter?: number, page?: string): Promise<any> {
    if (!page) page = '1';
    if (!limiter) limiter = Number.MAX_VALUE;
    const searchString: string = `${this.getBaseUrl()}/danh-sach/truyen-hot?page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
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

        const $ = cheerio.load(text);
        $('.list-new .row').each((index, element) => {
          if (index >= limiter) {
            return;
          }
          const name = $(element).find('.col-title h3').first().text().trim();

          const link = $(element).find('a').first().attr('href');
          const url = new URL(link ?? '');
          const title = url.pathname.substr(1);
          const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
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
          const authorLink = authorUrl?.split('/').pop();
          const view = $(element).find('.col-view.show-view').text().trim();
          const categoryList = $(element)
            .find('.col-category a')
            .map((_, childElement) => {
              const content = $(childElement).text().trim();
              const href = $(childElement).attr('href')?.split('/').pop();
              return { content, href };
            })
            .get();
          data.push({
            name,
            link,
            title,
            cover,
            description,
            host: this.getBaseUrl(),
            author,
            authorLink,
            //   view: undefined,
            //   categoryList: undefined,
            view,
            categoryList
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
    const searchString: string = `${this.getBaseUrl()}`;
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
        $('.list-cat-inner a').each((index, element) => {
          const content = $(element).text().trim();
          const href = $(element).attr('href')?.split('/').pop();
          //const url = link + ;
          // const urlCategory = new URL(link ?? '');
          // const url = urlCategory.pathname.substr(1);

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

  public async newestStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {
    const cate = category
      .split(' ')
      .join('-')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .join('-')
      .toLowerCase();
    const searchString = `${this.getBaseUrl()}/the-loai/${category}?page=${page}`;
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      const listCategory = await this.categoryList();
      console.log(listCategory);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

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
  plugin: Truyen123Plugin
};
