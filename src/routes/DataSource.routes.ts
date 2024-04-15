import { Router } from 'express';
import {
  search,
  detailStory,
  contentStory,
  listStory,
  home
} from '~/controllers/DataSource.controllers';
const dataSourceRouter = Router();

dataSourceRouter.get('/search/*', search);
dataSourceRouter.get('/detailStory/*', detailStory);
dataSourceRouter.get('/contentStory/*', contentStory);
dataSourceRouter.get('/listStory/*', listStory);
dataSourceRouter.get('/home/*', home);
export default dataSourceRouter;
