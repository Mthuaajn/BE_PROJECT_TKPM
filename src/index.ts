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
import { IListStoryStrategy } from './models/DataSourceManagement/IListStoryStrategy';
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

// KHÔNG XÓA
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
