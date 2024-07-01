import { Router } from 'express';
import { downloadChapter, listFileExtension } from '~/controllers/FileExtensionAudio.controllers';

const fileExtensionAudioRouter = Router();
fileExtensionAudioRouter.get('/downloadChapter/*', downloadChapter);
fileExtensionAudioRouter.get('/listFileExtension/*', listFileExtension);
export default fileExtensionAudioRouter;
