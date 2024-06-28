import { ICategoryList } from './ICategoryList';
import { IContentStory } from './IContentStory';
import { IDetailStory } from './IDetailStory';
import { IListStoryStrategy } from './IListStoryStrategy';
import { ISearchStory } from './ISearchStory';

// This interface regulates behaviors of crawl data plugin, and is the abstraction that other component of system can
// used to interactive with plugins
export interface IDataSourcePlugin {
  // Name of plugin
  name: string;

  // List Strory of plugin
  listStory?: IListStoryStrategy;
  listCategory?: ICategoryList;
  contentChapter?: IContentStory;
  storyDetail?: IDetailStory;
  searcher?: ISearchStory;

  // Creata a clone instance of this plugin
  clone(name: string): IDataSourcePlugin;

  // Get base url/ host of website
  getBaseUrl(): string;

  // Search story, can filter by category
  search(title: string, page?: string, category?: string): any;

  // Get Detail Information of Story
  detailStory(title: string): any;

  // Get content of chapter of story
  contentStory(title: string, chap?: string): any;

  // Get all categories of website
  categoryList(type?: string): any;

  // Get all chapters of a story
  chapterList(title: string, page?: string): any;

  // Get story by types of website
  selectStoryList(type: string, limiter?: number, page?: string): any;

  // Get home of this website
  home(): any;

  // Get detail of story that only know name from this website
  changeDetailStoryToThisDataSource(title: string): any;

  // Get content of chapter of story that only know name from this website
  changeContentStoryToThisDataSource(title: string, chap?: string): any;

  // Get ne
  newestStoryAtCategory(category: string, limiter?: number, page?: string): any;
  fullStoryAtCategory(category: string, limiter?: number, page?: string): any;
  hotStoryAtCategory(category: string, limiter?: number, page?: string): any;
}
