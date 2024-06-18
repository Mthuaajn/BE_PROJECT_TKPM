import Cheerio from 'cheerio';
import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';
import { Story } from '~/models/Interfaces/Story';
export default class TangThuVienSearchStory implements ISearchStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'TangThuVienSearchStory';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new TangThuVienSearchStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  private getStoryMostLikeTitle = (html: string, searchedTitle: string, limiter?: number) => {
    const result: Story[] = [];
    const $ = Cheerio.load(html);

    const elements = $('#rank-view-list li');

    if (elements.length === 0) {
      return null;
    }
    //console.log(elements);

    $('#rank-view-list li').each((index, element) => {
      if (result.length === 1) return;
      const name = $(element).find('.book-mid-info h4 a').text().trim();
      const cover = $(element).find('.book-img-box img').attr('src') || '';
      const description = $(element).find('.intro').text().trim();
      const author = $(element).find('.author a.name').text().trim();
      // method eq(1) lấy element thứ 2 xuất hiện
      // const category = $(element).find('.author a').eq(1).text().trim();
      const categoryElement = $(element).find('.author a').eq(1);
      const category = {
        content: categoryElement.text().trim(),
        href: categoryElement.attr('href') || ''
      } as never;
      //const link = convertString(name);
      const link = $(element).find('.book-img-box a').first().attr('href') || '';
      const startIndex = link.lastIndexOf('/') + 1;
      const title = link.substring(startIndex);

      const lowerCaseName: string = name.toLowerCase();

      const lowerCaseTitle: string = searchedTitle.toLowerCase();
      let found: boolean =
        lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);

      if (name.length === 0) {
        found = false;
      }

      if (found) {
        const story: Story = {
          name,
          cover,
          description,
          author,
          categoryList: [].concat(category) as { content: string; href: string }[],
          link,
          title: title,
          host: 'https://truyen.tangthuvien.vn/',
          authorLink: 'no information',
          view: 'no information'
        };

        result.push(story);
      }
    });
    return result;
  };
  async search(title: string, page?: string | undefined, category?: string | undefined) {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/ket-qua-tim-kiem?term=${title}&page=${page}`;
    let result: Story[] | null = [];
    console.log('searchString: ', searchString);
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
}
