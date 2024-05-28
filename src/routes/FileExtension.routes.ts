import { Router } from 'express';
import { downloadChapter, listFileExtension } from '~/controllers/FileExtension.controllers';
const fileExtensionRouter = Router();

fileExtensionRouter.get('/downloadChapter/*', downloadChapter);
fileExtensionRouter.get('/listFileExtension/*', listFileExtension);
export default fileExtensionRouter;
