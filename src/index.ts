import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express from 'express';
import dataSourceRouter from './routes/DataSource.routes';
import { DataSourceFactory } from './models/DataSourceManagement/DataSourceFactory';
import { DataSourceManager } from './models/DataSourceManagement/DataSourceManager';
import path from 'path';
import { FileWatcher } from './models/FileWatcher';
import { hostname } from 'os';
import fileExtensionRouter from './routes/FileExtension.routes';
import { FileExtensionFactory } from './models/FileExtensionManagement/FileExtensionFactory';
import { FileExtensionManager } from './models/FileExtensionManagement/FileExtensionManager';
import { IDataSourcePlugin } from './models/DataSourceManagement/IDataSourcePlugin';
import { mostSearchStory } from './models/TestExtendTruyenfull';
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

const dataSourceFactory = DataSourceFactory.getInstance();
const dataSourceManager = DataSourceManager.getInstance();

dataSourceFactory.loadPlugins(directoryOfDataSourcePlugin);
dataSourceManager.setDataSourceMap(dataSourceFactory.cloneAllPlugins());
dataSourceManager.printAllPlugins();
//dataSourceManager.runPlugins();

const truyenfullPlugin: IDataSourcePlugin | null = dataSourceManager.select('TruyenfullPlugin');
if (truyenfullPlugin != null) {
  truyenfullPlugin.listStory.register('most search', mostSearchStory);
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

app.use(express.json());

app.use('/api/v1/', dataSourceRouter);
app.use('/api/v1/download/', fileExtensionRouter);

import { createFile } from './converter/wav';
app.use('/test', async (req, res) => {
  await createFile('title', '1', 'content');
  res.json({ msg: 'You have accessed to this server to save wav!' });
});

app.use('/', async (req, res) => {
  res.json({ msg: 'You have accessed to this server successfully!' });
});

app.use('*', defaultErrorHandlers);
app.listen(port, host, () => {
  console.log(`app running on port http://${host}:${port}/`);
});


export default app;
