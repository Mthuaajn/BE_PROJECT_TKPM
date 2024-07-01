import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express from 'express';
import dataSourceRouter from './routes/DataSource.routes';
import { DataSourceFactory } from './models/DataSourceManagement/DataSourceFactory';
import { DataSourceManager } from './models/DataSourceManagement/DataSourceManager';
import path from 'path';
import { FileWatcher } from './models/FileWatcher';
import fileExtensionRouter from './routes/FileExtension.routes';
import { FileExtensionFactory } from './models/FileExtensionManagement/FileExtensionFactory';
import { FileExtensionManager } from './models/FileExtensionManagement/FileExtensionManager';
import { IDataSourcePlugin } from './models/DataSourceManagement/IDataSourcePlugin';
import { mostSearchStory } from './models/TestExtendTruyenfull';
import { FileExtensionComicsFactory } from './models/FileExtensionComicsManagement/FileExtensionComicsFactory';
import { FileExtensionComicsManager } from './models/FileExtensionComicsManagement/FileExtensionComicsManager';
import fileExtensionComicsRouter from './routes/FileExtensionComics.routes';
import fileExtensionAudioRouter from './routes/FileExtensionAudio.routes';
import { FileExtensionAudioFactory } from './models/FileExtensionAudioManagement/FileExtensionAudioFactory';
import { FileExtensionAudioManager } from './models/FileExtensionAudioManagement/FileExtensionAudioManager';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const esmRequire = require('esm')(module /*, options*/);
// esmRequire('./index.ts');
// eslint-disable-next-line @typescript-eslint/no-var-requires
// require('ts-node').register();
// require('./index.ts');
// "puppeteer": "^22.10.0"
const port = 3000;
const host = '127.0.0.1'; //'10.0.2.2';////'localhost';
const app = express();

const directoryOfDataSourcePlugin = path.join(__dirname, '/models/DataSourcePlugin');
const directoryOfFileExtensionPlugin = path.join(__dirname, '/models/FileExtensionPlugin');
const directoryOfFileExtensionComicsPlugin = path.join(
  __dirname,
  '/models/FileExtensionComicsPlugin'
);
const directoryOfFileExtensionAudioPlugin = path.join(
  __dirname,
  '/models/FileExtensionAudioPlugin'
);

const dataSourceFactory = DataSourceFactory.getInstance();
const dataSourceManager = DataSourceManager.getInstance();

dataSourceFactory.loadPlugins(directoryOfDataSourcePlugin);
dataSourceManager.setDataSourceMap(dataSourceFactory.cloneAllPlugins());
dataSourceManager.printAllPlugins();
//dataSourceManager.runPlugins();

const truyenfullPlugin: IDataSourcePlugin | null = dataSourceManager.select('TruyenfullPlugin');
if (truyenfullPlugin != null) {
  (truyenfullPlugin.listStory as IListStoryStrategy).register('most search', mostSearchStory);
  dataSourceManager.setDataSource(truyenfullPlugin.name, truyenfullPlugin);
}

const fileWatcher = new FileWatcher(directoryOfDataSourcePlugin);
fileWatcher.startWatching();

// Event listener for 'fileAdded' event
fileWatcher.on('fileAdded', async () => {
  // console.log(`New file added: ${filename}`);
  // Perform additional actions here
  dataSourceFactory.clearAllPlugins();
  dataSourceManager.clearAllPlugins();

  await dataSourceFactory.loadPlugins(directoryOfDataSourcePlugin);
  dataSourceManager.setDataSourceMap(dataSourceFactory.cloneAllPlugins());
  dataSourceManager.printAllPlugins();
  console.log('All data source plugins are running ...');
  //dataSourceManager.runPlugins();

  // dataSourceFactory.clearAllPlugins();
  // dataSourceFactory.loadPlugins();
  // dataSourceFactory.runPlugins();
});

const fileExtensionFactory = FileExtensionFactory.getInstance();
const fileExtensionManager = FileExtensionManager.getInstance();

fileExtensionFactory.loadPlugins(directoryOfFileExtensionPlugin);
fileExtensionManager.setFileExtensionMap(fileExtensionFactory.cloneAllPlugins());
fileExtensionManager.printAllPlugins();

const fileWatcherForFileExtensionPlugin = new FileWatcher(directoryOfFileExtensionPlugin);
fileWatcherForFileExtensionPlugin.startWatching();

fileWatcherForFileExtensionPlugin.on('fileAdded', async () => {
  //console.log(`New file added: ${filename}`);
  fileExtensionFactory.clearAllPlugins();
  fileExtensionManager.clearAllPlugins();

  await fileExtensionFactory.loadPlugins(directoryOfFileExtensionPlugin);
  fileExtensionManager.setFileExtensionMap(fileExtensionFactory.cloneAllPlugins());
  fileExtensionManager.printAllPlugins();
  console.log('All file extension plugins are running ...');
});

const fileExtensionComicsFactory = FileExtensionComicsFactory.getInstance();
const fileExtensionComicsManager = FileExtensionComicsManager.getInstance();

fileExtensionComicsFactory.loadPlugins(directoryOfFileExtensionComicsPlugin);
fileExtensionComicsManager.setFileExtensionMap(fileExtensionComicsFactory.cloneAllPlugins());
fileExtensionComicsManager.printAllPlugins();

const fileWatcherForFileExtensionComicsPlugin = new FileWatcher(
  directoryOfFileExtensionComicsPlugin
);
fileWatcherForFileExtensionComicsPlugin.startWatching();

fileWatcherForFileExtensionComicsPlugin.on('fileAdded', async () => {
  fileExtensionComicsFactory.clearAllPlugins();
  fileExtensionComicsManager.clearAllPlugins();

  await fileExtensionComicsFactory.loadPlugins(directoryOfFileExtensionComicsPlugin);
  fileExtensionComicsManager.setFileExtensionMap(fileExtensionComicsFactory.cloneAllPlugins());
  fileExtensionComicsManager.printAllPlugins();
  console.log('All file extension plugins for comics are running ...');
});

const fileExtensionAudioFactory: FileExtensionAudioFactory =
  FileExtensionAudioFactory.getInstance();
const fileExtensionAudioManager: FileExtensionAudioManager =
  FileExtensionAudioManager.getInstance();

fileExtensionAudioFactory.loadPlugins(directoryOfFileExtensionAudioPlugin);
fileExtensionAudioManager.setFileExtensionMap(fileExtensionAudioFactory.cloneAllPlugins());
fileExtensionAudioManager.printAllPlugins();

const fileWatcherForFileExtensionAudioPlugin: FileWatcher = new FileWatcher(
  directoryOfFileExtensionAudioPlugin
);
fileWatcherForFileExtensionAudioPlugin.startWatching();

fileWatcherForFileExtensionAudioPlugin.on('fileAdded', async () => {
  fileExtensionAudioFactory.clearAllPlugins();
  fileExtensionAudioManager.clearAllPlugins();

  await fileExtensionAudioFactory.loadPlugins(directoryOfFileExtensionAudioPlugin);
  fileExtensionAudioManager.setFileExtensionMap(fileExtensionAudioFactory.cloneAllPlugins());
  fileExtensionAudioManager.printAllPlugins();

  console.log('All file extension plugins for audio are running ...');
});

app.use(express.json());

app.use('/api/v1/', dataSourceRouter);
app.use('/api/v1/download/', fileExtensionRouter);
app.use('/api/v1/downloadComics/', fileExtensionComicsRouter);
app.use('/api/v1/downloadAudio/', fileExtensionAudioRouter);

import { ChapterImage } from './models/Interfaces/ChapterImage';
import createFile from './test';
import { IListStoryStrategy } from './models/DataSourceManagement/IListStoryStrategy';

app.use('/test', async (req, res) => {
  const content: ChapterImage[] = [
    {
      image_page: 1,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_1.jpg'
    },
    {
      image_page: 2,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_2.jpg'
    },
    {
      image_page: 3,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_3.jpg'
    },
    {
      image_page: 4,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_4.jpg'
    },
    {
      image_page: 5,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_5.jpg'
    },
    {
      image_page: 6,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_6.jpg'
    },
    {
      image_page: 7,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_7.jpg'
    },
    {
      image_page: 8,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_8.jpg'
    },
    {
      image_page: 9,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_9.jpg'
    },
    {
      image_page: 10,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_10.jpg'
    },
    {
      image_page: 11,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_11.jpg'
    },
    {
      image_page: 12,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_12.jpg'
    },
    {
      image_page: 13,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_13.jpg'
    },
    {
      image_page: 14,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_14.jpg'
    },
    {
      image_page: 15,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_15.jpg'
    },
    {
      image_page: 16,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_16.jpg'
    },
    {
      image_page: 17,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_17.jpg'
    },
    {
      image_page: 18,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_18.jpg'
    },
    {
      image_page: 19,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_19.jpg'
    },
    {
      image_page: 20,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_20.jpg'
    },
    {
      image_page: 21,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_21.jpg'
    },
    {
      image_page: 22,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_22.jpg'
    },
    {
      image_page: 23,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_23.jpg'
    },
    {
      image_page: 24,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_24.jpg'
    },
    {
      image_page: 25,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_25.jpg'
    },
    {
      image_page: 26,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_26.jpg'
    },
    {
      image_page: 27,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_27.jpg'
    },
    {
      image_page: 28,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_28.jpg'
    },
    {
      image_page: 29,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_29.jpg'
    },
    {
      image_page: 30,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_30.jpg'
    },
    {
      image_page: 31,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_31.jpg'
    },
    {
      image_page: 32,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_32.jpg'
    },
    {
      image_page: 33,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_33.jpg'
    },
    {
      image_page: 34,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_34.jpg'
    },
    {
      image_page: 35,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_35.jpg'
    },
    {
      image_page: 36,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_36.jpg'
    },
    {
      image_page: 37,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_37.jpg'
    },
    {
      image_page: 38,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_38.jpg'
    },
    {
      image_page: 39,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_39.jpg'
    },
    {
      image_page: 40,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_40.jpg'
    },
    {
      image_page: 41,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_41.jpg'
    },
    {
      image_page: 42,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_42.jpg'
    },
    {
      image_page: 43,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_43.jpg'
    },
    {
      image_page: 44,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_44.jpg'
    },
    {
      image_page: 45,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_45.jpg'
    },
    {
      image_page: 46,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_46.jpg'
    },
    {
      image_page: 47,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_47.jpg'
    },
    {
      image_page: 48,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_48.jpg'
    },
    {
      image_page: 49,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_49.jpg'
    },
    {
      image_page: 50,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_50.jpg'
    },
    {
      image_page: 51,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_51.jpg'
    },
    {
      image_page: 52,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_52.jpg'
    },
    {
      image_page: 53,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_53.jpg'
    },
    {
      image_page: 54,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_54.jpg'
    },
    {
      image_page: 55,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_55.jpg'
    },
    {
      image_page: 56,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_56.jpg'
    },
    {
      image_page: 57,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_57.jpg'
    },
    {
      image_page: 58,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_58.jpg'
    },
    {
      image_page: 59,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_59.jpg'
    },
    {
      image_page: 60,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_60.jpg'
    },
    {
      image_page: 61,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_61.jpg'
    },
    {
      image_page: 62,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_62.jpg'
    },
    {
      image_page: 63,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_63.jpg'
    },
    {
      image_page: 64,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_64.jpg'
    },
    {
      image_page: 65,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_65.jpg'
    },
    {
      image_page: 66,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_66.jpg'
    },
    {
      image_page: 67,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_67.jpg'
    },
    {
      image_page: 68,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_68.jpg'
    },
    {
      image_page: 69,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_69.jpg'
    },
    {
      image_page: 70,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_70.jpg'
    },
    {
      image_page: 71,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_71.jpg'
    },
    {
      image_page: 72,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_72.jpg'
    },
    {
      image_page: 73,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_73.jpg'
    },
    {
      image_page: 74,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_74.jpg'
    },
    {
      image_page: 75,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_75.jpg'
    },
    {
      image_page: 76,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_76.jpg'
    },
    {
      image_page: 77,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_77.jpg'
    },
    {
      image_page: 78,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_78.jpg'
    },
    {
      image_page: 79,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_79.jpg'
    },
    {
      image_page: 80,
      image_file:
        'https://sv1.otruyencdn.com/uploads/20231227/e5de139682cd0e5dbd10285013f9d026/chapter_1/page_80.jpg'
    }
  ];

  await createFile();
  res.json({ msg: 'You have accessed to save mp3 file!' });
});

app.use('/', async (req, res) => {
  res.json({ msg: 'You have accessed to this server successfully!' });
});

app.use('*', defaultErrorHandlers);
app.listen(port, host, () => {
  console.log(`app running on port http://${host}:${port}/`);
});

export default app;

// import https from 'https';

// // Create a custom HTTPS agent with specific TLS settings
// const agent = new https.Agent({
//   secureProtocol: 'TLSv1_1_method', // Specify the TLS version, e.g., 'TLSv1_2_method' for TLS 1.2,
//   rejectUnauthorized: false //
// });

// // Making a request with the custom agent
// https
//   .get('https://audiotruyenfull.com/truyen-hot/', { agent }, (res) => {
//     console.log('StatusCode:', res.statusCode);
//     // Handle response...
//   })
//   .on('error', (e) => {
//     console.error(e);
//   });
