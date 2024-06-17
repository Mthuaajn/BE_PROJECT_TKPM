import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';
import { Category } from '~/models/Interfaces/Category';
import { Story } from '~/models/Interfaces/Story';
import { StoryTruyenfull } from '~/models/Interfaces/StoryTruyenfull';
import { convertToUnicodeAndCreateURL } from '~/utils/StringUtility';
export default class TruyenfullSearchStory implements ISearchStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'TruyenfullSearchStory';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new TruyenfullSearchStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
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
  public async search(
    title: string,
    page?: string | undefined,
    category?: string | undefined
  ): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/v1/tim-kiem?title=${encodeURIComponent(title)}&page=${page}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json = await response.json();
        const dataArr: StoryTruyenfull[] = json.data;
        const data: Story[] = [];

        dataArr.forEach((element: StoryTruyenfull) => {
          const name = element?.title;
          const link = convertToUnicodeAndCreateURL(element.title);
          const title = element?.id.toString();
          const cover = element.image;
          const description = 'no information';
          const host = this.getBaseUrl();
          const author = element.author;
          const authorLink = convertToUnicodeAndCreateURL(element.author);
          const view = 'no information';
          const categoryList = this.processCategoryList(element.categories, element.category_ids);

          data.push({
            name,
            link,
            title,
            cover,
            description,
            host,
            author,
            authorLink,
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

        //return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
