import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import { Category } from '~/models/Interfaces/Category';
import { DetailStory } from '~/models/Interfaces/DetailStory';
import { DetailStoryTruyenfull } from '~/models/Interfaces/DetailStoryTruyenfull';
import { convertToUnicodeAndCreateURL } from '~/utils/StringUtility';

export default class TruyenfullDetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TruyenfullDetailStory';
    this.baseUrl = url;
  }
  public clone(): IDetailStory {
    return new TruyenfullDetailStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/v1/story/detail/${title}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataResponse: DetailStoryTruyenfull = json.data;

        const name = dataResponse.title;
        const title = dataResponse.id.toString();
        const link = dataResponse.link;
        const cover = dataResponse.image;
        const author = dataResponse.author;
        const authorLink = convertToUnicodeAndCreateURL(dataResponse.author);
        const description = dataResponse.description
          .trim()
          .replaceAll(/<br\/>|<i>|<\/i>|<b>|<\/b>|<br>|<strong>|<\/strong>/g, '');
        const detail = dataResponse.status;
        const host = this.getBaseUrl();
        const categoryList = this.processCategoryList(
          dataResponse.categories,
          dataResponse.category_ids
        );
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

        //console.log(data)
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  private processCategoryList(category: string, category_ids: string): Category[] {
    const categories = category.split(','); // Split categories by comma
    const categoryIds = category_ids.split(','); // Split category_ids by comma

    const result: Category[] = [];

    for (let i = 0; i < categories.length; i++) {
      const content: string = categories[i].trim(); // Remove whitespace around category
      const href: string = categoryIds[i].trim(); // Convert category_id to number

      result.push({ content, href });
    }

    return result;
  }
}
