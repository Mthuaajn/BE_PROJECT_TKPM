import { Router } from 'express';
import {
  search,
  detailStory,
  contentStory,
  listStory,
  home,
  listDataSource,
  listCategory,
  listChapter
} from '~/controllers/DataSource.controllers';
const dataSourceRouter = Router();

dataSourceRouter.get('/search/*', search);
dataSourceRouter.get('/detailStory/*', detailStory);
dataSourceRouter.get('/contentStory/*', contentStory);
dataSourceRouter.get('/listStory/*', listStory);
dataSourceRouter.get('/home/*', home);
dataSourceRouter.get('/listDataSource/*', listDataSource);
dataSourceRouter.get('/listCategory/*', listCategory);
dataSourceRouter.get('/listChapter/*', listChapter);
export default dataSourceRouter;
