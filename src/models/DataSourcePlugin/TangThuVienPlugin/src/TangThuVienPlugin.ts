import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import { IDataSourcePlugin } from '~/models/DataSourceManagement/IDataSourcePlugin';
import { IDetailStory } from '~/models/DataSourceManagement/IDetailStory';
import { IListStoryStrategy } from '~/models/DataSourceManagement/IListStoryStrategy';
import { ISearchStory } from '~/models/DataSourceManagement/ISearchStory';

export default class TangThuVienPlugin implements IDataSourcePlugin {
  name: string;
  listStory: IListStoryStrategy;
  listCategory: ICategoryList;
  contentChapter: IContentStory;
  storyDetail: IDetailStory;
  searcher: ISearchStory;
  static baseUrl: string = 'https://truyen.tangthuvien.vn';

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
  clone(name: string): IDataSourcePlugin {
    return new TangThuVienPlugin(
      this.name,
      this.listCategory.clone(),
      this.contentChapter.clone(),
      this.storyDetail.clone(),
      this.listStory.clone(),
      this.searcher.clone()
    );
  }
  getBaseUrl(): string {
    return TangThuVienPlugin.baseUrl;
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

  public async changeDetailStoryToThisDataSource(title: string): Promise<any> {
    return await this.contentChapter.changeDetailStoryToThisDataSource(title);
  }
  public async changeContentStoryToThisDataSource(
    title: string,
    chap?: string | undefined
  ): Promise<any> {
    return await this.contentChapter.changeContentStoryToThisDataSource(title, chap);
  }
  public async newestStoryAtCategory(
    category: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    return Promise.resolve(this.getBaseUrl());
  }
  public async fullStoryAtCategory(
    category: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    return Promise.resolve(this.getBaseUrl());
  }
  public async hotStoryAtCategory(
    category: string,
    limiter?: number | undefined,
    page?: string | undefined
  ): Promise<any> {
    return Promise.resolve(this.getBaseUrl());
  }
}
