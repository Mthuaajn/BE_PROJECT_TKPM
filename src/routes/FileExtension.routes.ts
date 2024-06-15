import { Router } from 'express';
import { downloadChapter, listFileExtension } from '~/controllers/FileExtension.controllers';

//This router is used for routing request to downloading story controller
const fileExtensionRouter = Router();

fileExtensionRouter.get('/downloadChapter/*', downloadChapter);
fileExtensionRouter.get('/listFileExtension/*', listFileExtension);
export default fileExtensionRouter;
