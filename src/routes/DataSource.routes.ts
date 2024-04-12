
import { Router } from 'express';
import { search } from '~/controllers/DataSource.controllers';
const dataSourceRouter = Router();

dataSourceRouter.get('/search/*',search);

export default dataSourceRouter;