import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express from 'express';
import DatabaseService from '~/services/db.services';
import userRouter from '~/routes/users.routes';
import dataSourceRouter from './routes/DataSource.routes';
import { DataSourceFactory } from './models/DataSource/DataSourceFactory';
import { DataSourceManager } from './models/DataSource/DataSourceManager';
import path from 'path';
import { FileWatcher } from './models/FileWatcher';
import { hostname } from 'os';
import fileExtensionRouter from './routes/FileExtension.routes';
import { FileExtensionFactory } from './models/FileExtension/FileExtensionFactory';
import { FileExtensionManager } from './models/FileExtension/FileExtensionManager';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const esmRequire = require('esm')(module /*, options*/);
// esmRequire('./index.ts');
// eslint-disable-next-line @typescript-eslint/no-var-requires
// require('ts-node').register();
// require('./index.ts');

const port = 3000;
const host = '127.0.0.1'; //'10.0.2.2';////'localhost';
const app = express();
const dataSourceFactory = DataSourceFactory.getInstance();
const dataSourceManager = DataSourceManager.getInstance();
dataSourceFactory.loadPlugins();
dataSourceManager.setDataSourceMap(dataSourceFactory.getDataSourceMap());
dataSourceManager.printAllPlugins();
//dataSourceManager.runPlugins();

const directoryToWatch = path.join(__dirname, '/models/DataSourcePlugin');
const fileWatcher = new FileWatcher(directoryToWatch);
fileWatcher.startWatching();

// Event listener for 'fileAdded' event
fileWatcher.on('fileAdded', async (filename) => {
  console.log(`New file added: ${filename}`);
  // Perform additional actions here
  dataSourceFactory.clearAllPlugins();
  dataSourceManager.clearAllPlugins();

  await dataSourceFactory.loadPlugins();
  dataSourceManager.setDataSourceMap(dataSourceFactory.getDataSourceMap());
  dataSourceManager.printAllPlugins();
  //dataSourceManager.runPlugins();

  // dataSourceFactory.clearAllPlugins();
  // dataSourceFactory.loadPlugins();
  // dataSourceFactory.runPlugins();
});

const fileExtensionFactory = FileExtensionFactory.getInstance();
const fileExtensionManager = FileExtensionManager.getInstance();
fileExtensionFactory.loadPlugins();
fileExtensionManager.setFileExtensionMap(fileExtensionFactory.getFileExtensionMap());
fileExtensionManager.printAllPlugins();

const directoryOfFileExtensionPlugin = path.join(__dirname, '/models/FileExtensionPlugin');
const fileWatcherForFileExtensionPlugin = new FileWatcher(directoryOfFileExtensionPlugin);
fileWatcherForFileExtensionPlugin.startWatching();

fileWatcherForFileExtensionPlugin.on('fileAdded', async (filename) => {
  console.log(`New file added: ${filename}`);
  fileExtensionFactory.clearAllPlugins();
  fileExtensionManager.clearAllPlugins();

  await fileExtensionFactory.loadPlugins();
  fileExtensionManager.setFileExtensionMap(fileExtensionFactory.getFileExtensionMap());
  fileExtensionManager.printAllPlugins();
});
//DatabaseService.run().catch(console.dir);
app.use(express.json());
app.use('/api/v1/users', userRouter);
app.use('/api/v1/', dataSourceRouter);
app.use('/api/v1/download/', fileExtensionRouter);
app.use('/', async (req, res) => {
  res.json({ msg: 'You have accessed to this server successfully!' });
});
//import { search } from './controllers/DataSource.controllers';
//app.get('/api/v1/search/DataSource/Voz/title', search);
app.use('*', defaultErrorHandlers);
app.listen(port, host, () => {
  console.log(`app running on port http://${host}:${port}/`);
});
