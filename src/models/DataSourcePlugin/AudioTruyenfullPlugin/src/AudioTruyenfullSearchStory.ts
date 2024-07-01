import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';
import { Story } from '~/models/Interfaces/Story';
import cheerio from 'cheerio';

export default class AudioTruyenfullSearchStory implements ISearchStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'AudioTruyenfullSearchStory';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new AudioTruyenfullSearchStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  private getSearchedStory(html: string): Story[] | null {
    const data: Story[] | null = [];

    const $ = cheerio.load(html);

    const elements = $(
      '.wrapper .container #list-index  .list-full .list-thumbnail .row .item-story'
    ); //.container //#truyen-slide

    if (elements.length === 0) {
      console.log('empty');
      return data;
    }

    $('.wrapper .container #list-index  .list-full .list-thumbnail .row .item-story').each(
      (index, element) => {
        const name = $(element).find('.item-story .caption a').first().text().trim() || '';

        const link = $(element).find('.item-story .caption a').first().attr('href') || '';
        const url = new URL(link ?? '');
        const title = url.pathname.substr(1);
        const cover =
          $(element)
            .find('.item-story .img-hover img')
            .first()
            ?.attr('src')
            ?.replace('-thumbw', '') || '';
        const description = 'no information';
        const author = 'no information';
        const authorUrl = 'no information';
        const authorLink = 'no information';
        const view = 'no information';
        const categoryList = [
          {
            content: 'empty',
            href: 'empty'
          }
        ];

        data.push({
          name,
          link,
          title,
          cover,
          description,
          host: this.getBaseUrl(),
          author,
          authorLink,
          view,
          categoryList,
          format: 'audio'
        });
      }
    );
    return data;
  }
  public async search(
    title: string,
    page?: string | undefined,
    category?: string | undefined
  ): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/search?q=${encodeURIComponent(title)}&page=${page}`;
    let data: Story[] | null = [];
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });
      if (response.ok) {
        const text = await response.text();
        data = this.getSearchedStory(text);
        if (data != null) {
          if (category) {
            const categoryData = data.filter((value) => {
              return value.categoryList?.some((item) => item.content === category);
            });

            return categoryData;
          }
        }
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
