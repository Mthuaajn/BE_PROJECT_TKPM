import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import { Category } from '~/models/Interfaces/Category';

interface CategoryOTruyenResponse {
  status: string;
  message: string;
  data: {
    items: CategoryOTruyen2[];
  };
}
interface CategoryOTruyen2 {
  _id: string;
  slug: string;
  name: string;
}
export default class OTruyenCategoryList implements ICategoryList {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'OTruyenCategoryList';
    this.baseUrl = url;
  }
  clone(): ICategoryList {
    return new OTruyenCategoryList(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public async categoryList(type?: string | undefined): Promise<any> {
    const searchString: string = `${this.baseUrl}/the-loai`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const json: CategoryOTruyenResponse = await response.json();
        const data: Category[] = [];

        const categories: CategoryOTruyen2[] = json.data.items;

        for (let i = 0; i < categories.length; i++) {
          const content = categories[i].name;
          const href = categories[i].slug;

          data.push({
            content,
            href
          });
        }

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
