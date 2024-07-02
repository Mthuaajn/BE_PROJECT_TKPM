import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import { ContentStory } from '~/models/Interfaces/ContentStory';
import cheerio from 'cheerio';
import { getNumberValueFromString } from '~/utils/StringUtility';
import { ChapterItem } from '~/models/Interfaces/ChapterItem';

export default class AudioTruyenfullContentStory implements IContentStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'AudioTruyenfullContentStory';
    this.baseUrl = url;
  }
  clone(): IContentStory {
    return new AudioTruyenfullContentStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public async contentStory(title: string, chap?: string | undefined): Promise<any> {
    if (!chap) chap = '1';
    const searchString: string = `${this.getBaseUrl()}/${title}`;

    let chapNumber: number = Number.parseInt(chap) - 1;
    chapNumber = chapNumber >= 0 ? chapNumber : 0;

    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });

      if (response.ok) {
        const text = await response.text();

        const $ = cheerio.load(text);

        const name = $('.wrapper .container .truyen-right .tr-title').text() || '';
        const cover =
          $('.wrapper .container .truyen-left .tl-avt').find('img').first().attr('src') || '';
        const author = $('.wrapper .container .row .truyen-left .tl-audio .tl-post span')
          .find('[itemprop="author"]')
          .first()
          .text();

        const host = this.getBaseUrl();

        const mp3Links: ChapterItem[] = [];

        let countChapter: number = 1;
        $('script').each((index, element) => {
          const scriptContent = $(element).html() || '';
          const mp3Regex = /mp3:\s*"([^"]+)"/g;
          let match;
          while ((match = mp3Regex.exec(scriptContent)) !== null) {
            //const stringWithoutSpaces = match[1].replace(/\s/g, '');
            mp3Links.push({ content: 'Tập ' + countChapter, href: match[1] });
            countChapter++;
          }
        });

        let chapterTitle: string = '';
        let content: string = '';
        if (mp3Links.length > 0 && mp3Links.length > chapNumber) {
          content = mp3Links[chapNumber].href || '';
          chapterTitle = mp3Links[chapNumber].content || '';
        }

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
  public async chapterList(title: string, page?: string | undefined): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/${title}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();

        const $ = cheerio.load(text);

        const host = this.getBaseUrl();

        const mp3Links: ChapterItem[] = [];

        let countChapter: number = 1;
        $('script').each((index, element) => {
          const scriptContent = $(element).html() || '';
          const mp3Regex = /mp3:\s*"([^"]+)"/g;
          let match;
          while ((match = mp3Regex.exec(scriptContent)) !== null) {
            // const stringWithoutSpaces = match[1].replace(/\s/g, '');
            mp3Links.push({ content: 'Tập ' + countChapter, href: match[1] });
            countChapter++;
          }
        });

        const maxChapter = mp3Links.length;
        const listChapter = mp3Links;

        const maxPage = 1;
        const chapterPerPage: number = mp3Links.length;

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
  public async changeDetailStoryToThisDataSource(title: string): Promise<any> {
    return null;
  }
  public async changeContentStoryToThisDataSource(
    title: string,
    chap?: string | undefined
  ): Promise<any> {
    return null;
  }
}
