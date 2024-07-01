import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import { Category } from '~/models/Interfaces/Category';
import { DetailStory } from '~/models/Interfaces/DetailStory';
interface DetailStoryOTruyenResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: {
      og_type: string;
      titleHead: string;
      seoSchema: {
        '@context': string;
        '@type': string;
        name: string;
        url: string;
        image: string;
        director: string;
      };
      descriptionHead: string;
      og_image: string[];
      updated_time: number;
      og_url: string;
    };
    breadCrumb: {
      name: string;
      slug: string;
      position: number;
    }[];
    params: {
      slug: string;
      crawl_check_url: string;
    };
    item: {
      _id: string;
      name: string;
      slug: string;
      origin_name: string[];
      content: string;
      status: string;
      thumb_url: string;
      sub_docquyen: boolean;
      author: string[];
      category: CategoryOTruyen[];
      chapters: {
        server_name: string;
        server_data: {
          filename: string;
          chapter_name: string;
          chapter_title: string;
          chapter_api_data: string;
        }[];
      }[];
      updatedAt: string;
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}
interface CategoryOTruyen {
  id: string;
  name: string;
  slug: string;
}
export default class OTruyenDetailStory implements IDetailStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'OTruyenDetailStory';
    this.baseUrl = url;
  }
  clone(): IDetailStory {
    return new OTruyenDetailStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  private processCategoryList(categories: CategoryOTruyen[]): Category[] {
    const result: Category[] = [];

    for (let i = 0; i < categories.length; i++) {
      const content: string = categories[i].name;
      const href: string = categories[i].slug;

      result.push({ content, href });
    }

    return result;
  }
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/truyen-tranh/${title}`;
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
        const json: DetailStoryOTruyenResponse = await response.json();

        const name = json.data.item.name;
        const title = json.data.item.slug;
        const link = json.data.item._id;
        const cover = 'https://img.otruyenapi.com/uploads/comics/' + json.data.item.thumb_url;

        const author = json.data.item.author[0] ? json.data.item.author[0] : 'no information';

        const authorLink = json.data.item.author[0] ? json.data.item.author[0] : 'no information';

        const description = json.data.item.content.replaceAll(
          /<br\/>|<i>|<\/i>|<b>|<\/b>|<br>|<strong>|<\/strong>|<p>|<\/p>/g,
          ''
        );
        
        const detail = json.data.item.status;
        const host = this.getBaseUrl();
        const categoryList = this.processCategoryList(json.data.item.category);

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
          format: 'image'
        };

        //console.log(data)
        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
