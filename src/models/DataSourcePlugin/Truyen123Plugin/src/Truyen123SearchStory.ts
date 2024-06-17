import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';
import cheerio from 'cheerio';
import { Story } from '~/models/Interfaces/Story';

export default class Truyen123SearchStory implements ISearchStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'Truyen123SearchStory';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new Truyen123SearchStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  private getSearchedStory(html: string): Story[] | null {
    const data: Story[] = [];

    const $ = cheerio.load(html);
    $('.list-new .row').each((index, element) => {
      const name = $(element).find('.col-title h3').first().text().trim();
      const link = $(element).find('a').first().attr('href') || '';
      const url = new URL(link ?? '');
      const title = url.pathname.substr(1);
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
        categoryList
      });
    });
    return data;
  }
  public async search(title: string, page?: string, category?: string): Promise<any> {
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
