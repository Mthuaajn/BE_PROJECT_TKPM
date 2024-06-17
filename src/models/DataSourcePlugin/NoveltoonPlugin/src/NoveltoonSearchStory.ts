import { ICategoryList } from "~/models/DataSourceManagement/ICategoryList";
import { IContentStory } from "~/models/DataSourceManagement/IContentStory";
import { IDataSourcePlugin } from "~/models/DataSourceManagement/IDataSourcePlugin";
import { IDetailStory } from "~/models/DataSourceManagement/IDetailStory";
import { IListStoryStrategy } from "~/models/DataSourceManagement/IListStoryStrategy";
import { ISearchStory } from "~/models/DataSourceManagement/ISearchStory";

export default class NoveltoonPlugin implements IDataSourcePlugin {
    name: string;
    listStory: IListStoryStrategy;
    listCategory: ICategoryList;
    contentChapter: IContentStory;
    storyDetail: IDetailStory;
    searcher: ISearchStory;
    clone(name: string): IDataSourcePlugin {
        throw new Error("Method not implemented.");
    }
    getBaseUrl(): string {
        throw new Error("Method not implemented.");
    }
    search(title: string, page?: string | undefined, category?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    detailStory(title: string) {
        throw new Error("Method not implemented.");
    }
    contentStory(title: string, chap?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    categoryList(type?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    chapterList(title: string, page?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    selectStoryList(type: string, limiter?: number | undefined, page?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    home() {
        throw new Error("Method not implemented.");
    }
    changeDetailStoryToThisDataSource(title: string) {
        throw new Error("Method not implemented.");
    }
    changeContentStoryToThisDataSource(title: string, chap?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    newestStoryAtCategory(category: string, limiter?: number | undefined, page?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    fullStoryAtCategory(category: string, limiter?: number | undefined, page?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    hotStoryAtCategory(category: string, limiter?: number | undefined, page?: string | undefined) {
        throw new Error("Method not implemented.");
    }
    
}