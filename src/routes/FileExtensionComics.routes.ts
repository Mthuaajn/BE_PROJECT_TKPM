import { Router } from 'express';
import { downloadChapter, listFileExtension } from '~/controllers/FileExtensionComics.controllers';

const fileExtensionComicsRouter = Router();
fileExtensionComicsRouter.get('/downloadChapter/*', downloadChapter);
fileExtensionComicsRouter.get('/listFileExtension/*', listFileExtension);
export default fileExtensionComicsRouter;
