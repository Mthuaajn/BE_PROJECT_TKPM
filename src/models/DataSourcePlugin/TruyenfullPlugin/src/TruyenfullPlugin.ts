import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import { IDataSourcePlugin } from '~/models/DataSourceManagement/IDataSourcePlugin';
import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';

export default class TruyenfullPlugin implements IDataSourcePlugin {
  name: string;
  listStory: IListStoryStrategy;
  listCategory: ICategoryList;
  contentChapter: IContentStory;
  storyDetail: IDetailStory;
  searcher: ISearchStory;
  static baseUrl: string = 'https://api.truyenfull.vn';
  public constructor(
    name: string,
    listCategory: ICategoryList,
    contentChapter: IContentStory,
    storyDetail: IDetailStory,
    listStory: IListStoryStrategy,
    searcher: ISearchStory
  ) {
    this.name = name;
    this.listCategory = listCategory;
    this.listStory = listStory;
    this.contentChapter = contentChapter;
    this.storyDetail = storyDetail;
    this.searcher = searcher;
    // console.log('this.listCategory: ', listCategory);
    // console.log('searcher: ', searcher);
  }
  public clone(name: string): IDataSourcePlugin {
    return new TruyenfullPlugin(
      this.name,
      this.listCategory.clone(),
      this.contentChapter.clone(),
      this.storyDetail.clone(),
      this.listStory.clone(),
      this.searcher.clone()
    );
    // return new TruyenfullPlugin(
    //   this.name,
    //   this.listStory,
    //   this.listCategory,
    //   this.contentChapter,
    //   this.storyDetail.clone(),
    //   this.searcher
    // );
  }
  public getBaseUrl(): string {
    return TruyenfullPlugin.baseUrl;
  }
  public async search(
    title: string,
    page?: string | undefined,
    category?: string | undefined
  ): Promise<any> {
    return await this.searcher.search(title, page, category);
  }
  public async detailStory(title: string): Promise<any> {
    return await this.storyDetail.detailStory(title);
  }
  public async contentStory(title: string, chap?: string | undefined): Promise<any> {
    return await this.contentChapter.contentStory(title, chap);
  }
  public async categoryList(type?: string | undefined): Promise<any> {
    return await this.listCategory.categoryList(type);
  }
  public async chapterList(title: string, page?: string | undefined): Promise<any> {
    return await this.contentChapter.chapterList(title, page);
  }
  public async selectStoryList(
    type: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    return await this.listStory.select(type, limiter, page);
  }
  public async home(): Promise<any> {
    return await this.listStory.home();
  }
  public async newestStoryAtCategory(
    category: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    let data;
    const cate = category
      .split(' ')
      .join('-')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .join('-')
      .toLowerCase();
    const searchString = `${this.getBaseUrl()}/v1/story/cate?cate=${cate}&type=story_new&page=${page}`;
    ``;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const res = await response.json();
      data = res.data;
    } catch (err) {
      console.log(err);
      return null;
    }
    return data;
  }
  public async fullStoryAtCategory(
    category: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    let data;
    const cate = category
      .split(' ')
      .join('-')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .join('-')
      .toLowerCase();
    const searchString = `${this.getBaseUrl()}/v1/story/cate?cate=${cate}&type=story_full&page=${page}`;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const res = await response.json();
      data = res.data;
    } catch (err) {
      console.log(err);
      return null;
    }
    return data;
  }
  public async hotStoryAtCategory(
    category: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    let data;
    const cate = category
      .split(' ')
      .join('-')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .join('-')
      .toLowerCase();
    const searchString = `${this.getBaseUrl()}/v1/story/cate?cate=${cate}&type=story_view&page=${page}`;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8'
        }
      });
      const res = await response.json();
      data = res.data;
    } catch (err) {
      console.log(err);
      return null;
    }
    return data;
  }
  public async changeDetailStoryToThisDataSource(title: string): Promise<any> {
    return await this.contentChapter.changeDetailStoryToThisDataSource(title);
  }
  public async changeContentStoryToThisDataSource(
    title: string,
    chap?: string | undefined
  ): Promise<any> {
    return await this.contentChapter.changeContentStoryToThisDataSource(title, chap);
  }
}
