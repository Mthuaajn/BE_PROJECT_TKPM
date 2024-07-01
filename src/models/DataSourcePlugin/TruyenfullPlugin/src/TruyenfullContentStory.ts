import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import { APIListChapterTruyenfullResponse } from '~/models/Interfaces/APIListChapterTruyenfullResponse';
import { Category } from '~/models/Interfaces/Category';
import { ChangeDataSourceStory } from '~/models/Interfaces/ChangeDataSourceStory';
import { ChapterItemTruyenfull } from '~/models/Interfaces/ChapterItemTruyenfull';
import { ContentStory } from '~/models/Interfaces/ContentStory';
import { ContentStoryTruyenfull } from '~/models/Interfaces/ContentStoryTruyenfull';
import { DetailStoryTruyenfull } from '~/models/Interfaces/DetailStoryTruyenfull';
import { ListChapter } from '~/models/Interfaces/ListChapter';
import { Story } from '~/models/Interfaces/Story';
import { StoryTruyenfull } from '~/models/Interfaces/StoryTruyenfull';
import { convertToUnicodeAndCreateURL, getNumberValueFromString } from '~/utils/StringUtility';

export default class TruyenfullContentStory implements IContentStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TruyenfullContentStory';
    this.baseUrl = url;
  }
  public clone(): IContentStory {
    return new TruyenfullContentStory(this.baseUrl);
  }
  public getBaseUrl(): string {
    return this.baseUrl;
  }
  public async contentStory(title: string, chap?: string | undefined): Promise<any> {
    const chapterPerPage: number = 50;
    if (!chap) chap = '1';
    const chapNumber: number = Number.parseInt(chap);

    const pageNumber: number =
      Math.floor(chapNumber / chapterPerPage) + (chapNumber % chapterPerPage === 0 ? 0 : 1);

    // console.log('pageNumber: ', pageNumber);

    let indexChapterInPage: number = (chapNumber - 1) % chapterPerPage; // array start from 0, chapter in page start from 1
    indexChapterInPage = indexChapterInPage >= 0 ? indexChapterInPage : 0;
    // console.log('indexChapterInPage: ', indexChapterInPage);

    const searchString2: string = `${this.getBaseUrl()}/v1/story/detail/${title}`;

    try {
      const chapterList: ListChapter = await this.chapterList(title, pageNumber.toString());

      if (chapterList === null) {
        console.log('ChapterList is null');
        return null;
      }

      // const countChapterInCurrentPage: number = chapterList.listChapter.length;

      //console.log('countChapterInCurrentPage: ', countChapterInCurrentPage);
      if (
        !chapterList.listChapter[indexChapterInPage] ||
        chapterList.listChapter[indexChapterInPage] === null ||
        chapterList.listChapter[indexChapterInPage] === undefined
      ) {
        return null;
      }

      const chapterId: string = chapterList.listChapter[indexChapterInPage].href || 'href is null';
      const searchString: string = `${this.getBaseUrl()}/v1/chapter/detail/${chapterId}`;

      console.log('searchString: ', searchString);
      console.log('searchString: ', searchString2);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const response2 = await fetch(searchString2, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      if (response.ok && response2.ok) {
        const json = await response.json();
        const dataResponse: ContentStoryTruyenfull = json.data;
        const name = dataResponse.story_name;
        const title = dataResponse.story_id.toString();
        const chapterTitle = dataResponse.chapter_name;
        const host = this.getBaseUrl();
        const content = dataResponse.content.replaceAll(/<br\/>|<i>|<\/i>|<b>|<\/b>/g, '');

        const json2 = await response2.json();
        const dataResponse2: DetailStoryTruyenfull = json2.data;

        const cover = dataResponse2.image;
        const author = dataResponse2.author;

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
    const searchString: string = `${this.getBaseUrl()}/v1/story/detail/${title}/chapters?page=${page}`;
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
        const json: APIListChapterTruyenfullResponse = await response.json();
        if (json.meta.pagination.current_page > json.meta.pagination.total_pages) {
          return null;
        }
        const dataResponse: ChapterItemTruyenfull[] = json.data;

        const host = this.getBaseUrl();
        const maxChapter: number = json.meta.pagination.total;
        const maxPage: number = json.meta.pagination.total_pages;
        const chapterPerPage: number = json.meta.pagination.per_page;
        const listChapter: { content: string; href: string }[] = [];
        dataResponse.forEach((value, index) => {
          const content = value.title;
          const href = value.id.toString();
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
    try {
      const data: object[] | null = await this.searchByTitle(title);
      if (data === null || data.length <= 0) {
        const result: object = {
          data: null,
          message: 'not found'
        };
        return result;
      } else {
        const result: object = {
          data: data ? data[0] : null,
          message: 'found'
        };
        return result;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async changeContentStoryToThisDataSource(
    title: string,
    chap?: string | undefined
  ): Promise<any> {
    if (!chap) chap = '1';
    try {
      const story: ChangeDataSourceStory | null =
        await this.changeDetailStoryToThisDataSource(title);

      const foundTitle: string | undefined =
        story && story.data && story.message === 'found' ? story.data.title : undefined;

      //console.log('story: ', story);
      //console.log('foundTitle: ', foundTitle);
      const checkedTitle: string = foundTitle ?? '';
      if (!checkedTitle || checkedTitle === '') {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      }
      const detailChapter = await this.contentStory(checkedTitle, chap);

      if (detailChapter === null) {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      } else {
        const result: object = {
          data: detailChapter,
          message: 'found'
        };
        return result;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  private async searchByTitle(title: string, page?: string): Promise<any> {
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

        if (dataArr.length <= 0) {
          return null;
        }
        dataArr.forEach((element: StoryTruyenfull) => {
          if (data.length === 1) {
            return;
          }
          const name = element?.title;
          const link = convertToUnicodeAndCreateURL(element.title);
          const titleOfStory = element?.id.toString();
          const cover = element.image;
          const description = 'no information';
          const host = this.getBaseUrl();
          const author = element.author;
          const authorLink = convertToUnicodeAndCreateURL(element.author);
          const view = 'no information';
          const categoryList = this.processCategoryList(element.categories, element.category_ids);

          const lowerCaseName: string = name.toLowerCase();
          const lowerCaseTitle: string = title.toLowerCase();
          // console.log('name: ', lowerCaseName);
          // console.log('title: ', lowerCaseTitle);
          const found: boolean = //lowerCaseName === lowerCaseTitle;
            lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);
          //console.log('found: ', found);
          if (found) {
            data.push({
              name,
              link,
              title: titleOfStory,
              cover,
              description,
              host,
              author,
              authorLink,
              view,
              categoryList
            });
          }
        });
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
