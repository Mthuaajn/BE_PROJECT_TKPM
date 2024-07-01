import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';
import { Category } from '~/models/Interfaces/Category';
import { Story } from '~/models/Interfaces/Story';
interface SeoOnPage {
  og_type: string;
  titleHead: string;
  descriptionHead: string;
  og_image: string[];
  og_url: string;
}

interface BreadCrumb {
  name: string;
  isCurrent: boolean;
  position: number;
}

interface CategoryOTruyen {
  id: string;
  name: string;
  slug: string;
}

interface ChapterData {
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string;
}

interface Chapter {
  server_name: string;
  server_data: ChapterData[];
}

interface Item {
  name: string;
  slug: string;
  origin_name: string[];
  status: string;
  thumb_url: string;
  sub_docquyen: boolean;
  author: string[];
  category: CategoryOTruyen[];
  chapters: Chapter[];
  updatedAt: string;
  chaptersLatest: ChapterData[];
}

interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  pageRanges: number;
}

interface Params {
  type_slug: string;
  keyword: string;
  filterCategory: string[];
  sortField: string;
  sortType: string;
  pagination: Pagination;
}

interface SearchStoryOTruyenResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: SeoOnPage;
    breadCrumb: BreadCrumb[];
    titlePage: string;
    items: Item[];
    params: Params;
    type_list: string;
    APP_DOMAIN_FRONTEND: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export default class OTruyenSearchStory implements ISearchStory {
  name: string;
  baseUrl: string;
  public constructor(url: string) {
    this.name = 'OTruyenSearchStory';
    this.baseUrl = url;
  }
  clone(): ISearchStory {
    return new OTruyenSearchStory(this.baseUrl);
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

  public async search(
    title: string,
    page?: string | undefined,
    category?: string | undefined
  ): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/tim-kiem?keyword=${encodeURIComponent(title)}&page=${page}`;
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
        const json: SearchStoryOTruyenResponse = await response.json();
        const dataArr: Item[] = json.data.items;
        const data: Story[] = [];

        dataArr.forEach((element: Item) => {
          const name = element.name;
          const link = element.slug;
          const title = element.slug;
          const cover = 'https://img.otruyenapi.com/uploads/comics/' + element.thumb_url;
          const description = element.status;
          const host = this.getBaseUrl();
          const author = element.author[0] ? element.author[0] : 'no information';
          const authorLink = element.author[0] ? element.author[0] : 'no information';
          const view = 'no information';
          const categoryList = this.processCategoryList(element.category);

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
