import { Router } from 'express';
import { downloadChapter } from '~/controllers/FileExtension.controllers';
const fileExtensionRouter = Router();

fileExtensionRouter.get('/downloadChapter/*', downloadChapter);
export default fileExtensionRouter;
