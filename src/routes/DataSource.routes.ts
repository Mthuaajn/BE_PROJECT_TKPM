import { Router } from 'express';
import { search, detailStory, contentStory } from '~/controllers/DataSource.controllers';
const dataSourceRouter = Router();

dataSourceRouter.get('/search/*', search);
dataSourceRouter.get('/detailStory/*', detailStory);
dataSourceRouter.get('/contentStory/*', contentStory);
export default dataSourceRouter;
