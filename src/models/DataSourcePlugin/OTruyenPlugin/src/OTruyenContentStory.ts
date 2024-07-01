import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import { ChapterImage } from '~/models/Interfaces/ChapterImage';
import { ChapterItem } from '~/models/Interfaces/ChapterItem';
import { ContentStoryComic } from '~/models/Interfaces/ContentStoryComic';
import { ListChapter } from '~/models/Interfaces/ListChapter';
import { getNumberValueFromString } from '~/utils/StringUtility';
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
        server_data: ChapterItemOTruyen[];
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
interface ChapterItemOTruyen {
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string;
}
interface ContentStoryOTruyen {
  status: string;
  message: string;
  data: {
    domain_cdn: string;
    item: {
      _id: string;
      comic_name: string;
      chapter_name: string;
      chapter_title: string;
      chapter_path: string;
      chapter_image: ChapterImage[];
    };
  };
}

export default class OTruyenContentStory implements IContentStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'OTruyenContentStory';
    this.baseUrl = url;
  }
  clone(): IContentStory {
    return new OTruyenContentStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public async contentStory(title: string, chap?: string | undefined): Promise<any> {
    if (!chap) chap = '1';
    const chapNumber: number = Number.parseInt(chap);
    let indexChapterInPage: number = chapNumber - 1;
    indexChapterInPage = indexChapterInPage >= 0 ? indexChapterInPage : 0;
    const searchString2: string = `${this.getBaseUrl()}/truyen-tranh/${title}`;

    try {
      const chapterList: ListChapter = await this.chapterList(title, '1');

      if (chapterList === null) {
        console.log('ChapterList is null');
        return null;
      }

      if (
        !chapterList.listChapter[indexChapterInPage] ||
        chapterList.listChapter[indexChapterInPage] === null ||
        chapterList.listChapter[indexChapterInPage] === undefined
      ) {
        return null;
      }

      const chapterId: string = chapterList.listChapter[indexChapterInPage].href || 'href is null';
      const searchString: string = chapterId;

      console.log('searchString: ', searchString);
      console.log('searchString: ', searchString2);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8',
          'Content-Type': 'application/json'
        }
      });
      const response2 = await fetch(searchString2, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok && response2.ok) {
        const json: ContentStoryOTruyen = await response.json();

        const name = json.data.item.comic_name;
        const chapterTitle = json.data.item.chapter_name;
        const host = this.getBaseUrl();

        const chapterPath = json.data.item.chapter_path;
        const content: ChapterImage[] = [];
        for (let i = 0; i < json.data.item.chapter_image.length; i++) {
          const imageFile =
            'https://sv1.otruyencdn.com/' +
            chapterPath +
            '/' +
            json.data.item.chapter_image[i].image_file;

          content.push({
            image_page: json.data.item.chapter_image[i].image_page,
            image_file: imageFile
          });
        }

        const json2: DetailStoryOTruyenResponse = await response2.json();

        const author = json2.data.item.author[0] ? json2.data.item.author[0] : 'no information';
        const cover = 'https://img.otruyenapi.com/uploads/comics/' + json2.data.item.thumb_url;

        const data: ContentStoryComic = {
          name,
          title: title,
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
    const searchString: string = `${this.getBaseUrl()}/truyen-tranh/${title}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok) {
        const json: DetailStoryOTruyenResponse = await response.json();

        if (json.data.item.chapters.length <= 0) {
          return null;
        }
        const dataResponse: ChapterItemOTruyen[] = json.data.item.chapters[0].server_data;

        const host = this.getBaseUrl();
        const maxChapter: number = dataResponse.length;
        const maxPage: number = 1;
        const chapterPerPage: number = dataResponse.length;
        const listChapter: ChapterItem[] = [];
        dataResponse.forEach((value, index) => {
          const content = value.chapter_name;
          const href = value.chapter_api_data;
          listChapter.push({ content, href });
        });

        const data: ListChapter = {
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
    return Promise.resolve(null);
  }
  public async changeContentStoryToThisDataSource(
    title: string,
    chap?: string | undefined
  ): Promise<any> {
    return Promise.resolve(null);
  }
}
