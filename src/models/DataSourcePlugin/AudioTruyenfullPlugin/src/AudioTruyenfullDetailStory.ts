import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import cheerio from 'cheerio';
import { DetailStory } from '~/models/Interfaces/DetailStory';

export default class AudioTruyenfullDetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'AudioTruyenfullDetailStory';
    this.baseUrl = url;
  }
  clone(): IDetailStory {
    return new AudioTruyenfullDetailStory(this.baseUrl);
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

        //console.log('text:', text);

        const $ = cheerio.load(text);

        const name = $('.wrapper .container .truyen-right .tr-title').text() || '';
        const cover =
          $('.wrapper .container .truyen-left .tl-avt').find('img').first().attr('src') || '';
        const author = $('.wrapper .container .row .truyen-left .tl-audio .tl-post span')
          .find('[itemprop="author"]')
          .first()
          .text();
        const authorUrl = new URL(
          $('.wrapper .container .row .truyen-left .tl-audio .tl-post span')
            .find('[itemprop="author"]')
            .first()
            .attr('href') ?? ''
        );
        const authorLink = authorUrl.pathname.split('/').pop() || '';
        const categoryList = $('.wrapper  .container .row .truyen-left .tl-audio .tl-post span')
          .find('a[itemprop="genre"]')
          .map((_, childElement) => {
            const content = $(childElement).text().trim() || '';
            const href = $(childElement).attr('href')?.split('/').pop() || '';
            return { content, href };
          })
          .get();
        const description = $(
          '.wrapper  .container .row .truyen-left .tl-audio .singler-content-audio'
        )
          .text()
          .trim()
          .replaceAll('<br>', ' '); //.find('br').text();
        const detail = 'no information';
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
          categoryList,
          format: 'audio'
        };

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
