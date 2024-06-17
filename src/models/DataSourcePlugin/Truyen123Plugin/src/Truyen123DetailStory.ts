import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import { DetailStory } from '~/models/Interfaces/DetailStory';
import cheerio from 'cheerio';

export default class Truyen123DetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'TruyenfullSearchStory';
    this.baseUrl = url;
  }
  clone(): IDetailStory {
    return new Truyen123DetailStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
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
        const cover = $('.wrapper').find('.book img').first().attr('src') || '';
        const author = $('.wrapper').find('.info').find('[itemprop="author"]').text();
        const authorUrl = new URL(
          $('.wrapper').find('.info').find('[itemprop="author"]').attr('href') ?? ''
        );
        const authorLink = authorUrl.pathname.split('/').pop() || '';
        const categoryList = $('.wrapper')
          .find('.info')
          .find('a[itemprop="genre"]')
          .map((_, childElement) => {
            const content = $(childElement).text().trim() || '';
            const href = $(childElement).attr('href')?.split('/').pop() || '';
            return { content, href };
          })
          .get();
        const description = $('.wrapper').find('.desc-text').text().trim().replaceAll('<br>', ' '); //.find('br').text();
        const detail = $('.wrapper').find('.info .label').text();
        const host = this.getBaseUrl();
        const link = searchString;

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

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
