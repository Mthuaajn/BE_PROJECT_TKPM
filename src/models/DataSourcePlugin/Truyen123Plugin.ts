import { url } from 'inspector';
import { IDataSourcePlugin } from '../DataSource/IDataSourcePlugin';
import cheerio from 'cheerio';

export default class Truyen123 implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://123truyeni.com';
  public constructor(name: string) {
    this.name = name;
  }

  getBaseUrl(): string {
    return Truyen123.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new Truyen123(name);
  }

  public async search(title: string, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/search?q=${encodeURIComponent(title)}`;
    if (!page) page = '1';
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
          const view = $(element).find('.col-view.show-view').text().trim();
          const categoryList = $(element)
            .find('.col-category a')
            .map((_, childElement) => {
              const content = $(childElement).text().trim();
              const href = $(childElement).attr('href');
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
            const href = $(childElement).attr('href');
            return { content, href };
          })
          .get();
        // const author = (
        //   $('.wrapper').find('.container .info > div > div ').get(0) as unknown as HTMLElement
        // )?.textContent?.toString();
        const description = $('.wrapper').find('.desc-text').text().trim(); //.find('br').text();
        const detail = $('.wrapper').find('.info .label').text();
        const host = this.getBaseUrl();

        const data: object = {
          name,
          title,
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
    const searchString: string = `${this.getBaseUrl()}/${title}/chuong-${chap}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();

        const $ = cheerio.load(text);

        const name = $('.wrapper').find('a.truyen-title').text();
        const host = this.getBaseUrl();
        const chapterTitle = $('.wrapper').find('div.chapter-title').text().trim();
        $('.wrapper').find('.chapter-content div').remove();
        let content = $('.wrapper').find('div.chapter-content').html() ?? '';
        content = content.replace(/<!-- (.*?) -->/gm, '');
        content = content.replace(/<p(.*?)>(.*?)<?p>/g, '');
        content = content.replace(/\n/g, '<br>');
        content = content.replaceAll('<br>', ' ');
        content = content.trim();
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
}
