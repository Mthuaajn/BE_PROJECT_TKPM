import { wrapRequestHandler } from '~/utils/handlers';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { IDataSourcePlugin } from '~/models/DataSourceManagement/IDataSourcePlugin';
import { DataSourceManager } from '~/models/DataSourceManagement/DataSourceManager';
import { removeBracket, removeInvalidCharacter } from '~/utils/StringUtility';

// This function is used for handle request search a story, can filt by category
export const search = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get search terms
    const search: string = req.query.search?.toString() || '';

    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    // Get category of story
    const category: string = req.query.category?.toString() || '';

    // Get page of search results
    const page: string = req.query.page?.toString() || '1';
    console.log('search:', search);
    console.log('source: ', source);
    console.log('category: ', category);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      //const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`);
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
        // Get search result
        const result = await plugin.search(search, page, category);

        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request get detail information of a story
export const detailStory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get title of story
    const title: string = req.query.title?.toString() || '';

    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);
    console.log('title: ', title);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);

      if (plugin != null) {
        // Get data of detail story
        const result = await plugin.detailStory(title);
        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request get content of chapter of story
export const contentStory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get get chap number of story
    const chap: string = req.query.chap?.toString() || '';

    // Get title of story
    const title: string = req.query.title?.toString() || '';

    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);
    console.log('title: ', title);
    console.log('chap: ', chap);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);

      if (plugin != null) {
        // Get data of content of chapter of story
        const result = await plugin.contentStory(title, chap);
        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request get list of story by type such as newest, hot, full, most view, ...
export const listStory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get type of list story
    const type: string = req.query.type?.toString() || '';

    // Get page number of list story
    const page: string = req.query.page?.toString() || '';

    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);
    console.log('page: ', page);
    console.log('type: ', type);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
        let result = null;

        // Get data of list story
        result = await plugin.selectStoryList(type, undefined, page);

        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request home of a website
export const home = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);

      if (plugin != null) {
        // Get data of home of website
        const result = await plugin.home();

        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request get all website's name that server support to crawl data
export const listDataSource = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get plugin name from plugin manager
    const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
    const nameDataSource: string[] = dataSourceManager.getAllPluginName();
    const data: object = {
      length: nameDataSource.length,
      names: nameDataSource
    };
    res.json(data);
  }
);

// This function is used for handle request get list of categories of a website
export const listCategory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    // Get type of category
    const type: string = req.query.type?.toString() || '';
    console.log('source: ', source);
    console.log('type: ', type);
    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);

      if (plugin != null) {
        // Get data
        const result = await plugin.categoryList(type);

        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request get chapters of a story
export const listChapter = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    // Get title of story
    const title: string = req.query.title?.toString() || '';

    // Get page number of chapter pagination of story
    const page: string = req.query.page?.toString() || '';

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);

      if (plugin != null) {
        // Get data of chapter pagination of story
        const result = await plugin.chapterList(title, page);

        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request
export const ListStoryAtCategory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get type of list story
    const type: string = req.query.type?.toString() || '';

    // Get page number of list story
    const page: string = req.query.page?.toString() || '';

    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    // Get category of story
    const category: string = req.query.category?.toString() || '';
    console.log('source: ', source);
    console.log('page: ', page);
    console.log('type: ', type);
    console.log('category', category);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);

      if (plugin != null) {
        // Get data of detail story
        let result = null;
        if (type === 'newest') {
          result = await plugin.newestStoryAtCategory(category, undefined, page);
        } else if (type === 'full') {
          result = await plugin.fullStoryAtCategory(category, undefined, page);
        } else if (type === 'hot') {
          result = await plugin.hotStoryAtCategory(category, undefined, page);
        } else {
          res.json({ success: false, message: 'invalid type of list story' });
        }
        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request get detail information of story known name
export const changeDetailStoryDataSource = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    // Get title of story
    let title: string = req.query.title?.toString() || '';
    title = removeBracket(title);

    console.log('source: ', source);
    console.log('title: ', title);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      //const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`);
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);

      if (plugin != null) {
        // Get story data
        const result = await plugin.changeDetailStoryToThisDataSource(title);

        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0, message: 'not found' });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);

// This function is used for handle request  get detail content of chapter of story known name
export const changeContentStoryDataSource = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    // Get source of story
    const source: string = req.query.datasource?.toString() || '';

    // Get chap number of story
    const chap: string = req.query.chap?.toString() || '';
    // Get title of story
    let title: string = req.query.title?.toString() || '';
    title = removeBracket(title);

    console.log('source: ', source);
    console.log('title: ', title);
    console.log('chap: ', chap);

    if (source != null) {
      // Get plugin to crawl data
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      //const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`);
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
        // Get content of chapter of story
        const result = await plugin.changeContentStoryToThisDataSource(title, chap);
        if (result != null) {
          res.json(result);
        } else {
          res.json({ quantity: 0, message: 'not found' });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);
