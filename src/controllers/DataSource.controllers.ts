import { wrapRequestHandler } from '~/utils/handlers';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { IDataSourcePlugin } from '~/models/DataSourceManagement/IDataSourcePlugin';
import { DataSourceManager } from '~/models/DataSourceManagement/DataSourceManager';
import { removeBracket, removeInvalidCharacter } from '~/utils/StringUtility';
export const search = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const search: string = req.query.search?.toString() || '';
    const source: string = req.query.datasource?.toString() || '';
    const category: string = req.query.category?.toString() || '';
    const page: string = req.query.page?.toString() || '1';
    console.log('search:', search);
    console.log('source: ', source);
    console.log('category: ', category);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      //const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`);
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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
export const detailStory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const title: string = req.query.title?.toString() || '';
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);
    console.log('title: ', title);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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
export const contentStory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const chap: string = req.query.chap?.toString() || '';
    const title: string = req.query.title?.toString() || '';
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);
    console.log('title: ', title);
    console.log('chap: ', chap);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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
export const listStory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const type: string = req.query.type?.toString() || '';
    const page: string = req.query.page?.toString() || '';
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);
    console.log('page: ', page);
    console.log('type: ', type);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
        let result = null;
        // if (type === 'newest') {
        //   result = await plugin.newestStory(undefined, page);
        // } else if (type === 'full') {
        //   result = await plugin.fullStory(undefined, page);
        // } else if (type === 'hot') {
        //   result = await plugin.hotStory(undefined, page);
        // } else {
        //   res.json({ success: false, message: 'invalid type of list story' });
        // }

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

export const home = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const source: string = req.query.datasource?.toString() || '';

    console.log('source: ', source);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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

export const listDataSource = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
    const nameDataSource: string[] = dataSourceManager.getAllPluginName();
    const data: object = {
      length: nameDataSource.length,
      names: nameDataSource
    };
    res.json(data);
  }
);

export const listCategory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const source: string = req.query.datasource?.toString() || '';
    const type: string = req.query.type?.toString() || '';
    console.log('source: ', source);
    console.log('type: ', type);
    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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

export const listChapter = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const source: string = req.query.datasource?.toString() || '';
    const title: string = req.query.title?.toString() || '';
    const page: string = req.query.page?.toString() || '';

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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

export const ListStoryAtCategory = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const type: string = req.query.type?.toString() || '';
    const page: string = req.query.page?.toString() || '';
    const source: string = req.query.datasource?.toString() || '';
    const category: string = req.query.category?.toString() || '';
    console.log('source: ', source);
    console.log('page: ', page);
    console.log('type: ', type);
    console.log('category', category);
    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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
export const changeDetailStoryDataSource = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const source: string = req.query.datasource?.toString() || '';
    let title: string = req.query.title?.toString() || '';
    title = removeBracket(title);

    console.log('source: ', source);
    console.log('title: ', title);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      //const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`);
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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
export const changeContentStoryDataSource = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const source: string = req.query.datasource?.toString() || '';
    const chap: string = req.query.chap?.toString() || '';
    let title: string = req.query.title?.toString() || '';
    title = removeBracket(title);
    console.log('source: ', source);
    console.log('title: ', title);
    console.log('chap: ', chap);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      //const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`);
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
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
