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

const port = 3000;
const host = 'localhost';
const app = express();
const dataSourceFactory = DataSourceFactory.getInstance();
const dataSourceManager = DataSourceManager.getInstance();
dataSourceFactory.loadPlugins();
dataSourceManager.setDataSourceMap(dataSourceFactory.getDataSourceMap());
//dataSourceManager.runPlugins();
// Usage example
const directoryToWatch = path.join(__dirname, '/models/DataSourcePlugin');
const fileWatcher = new FileWatcher(directoryToWatch);
fileWatcher.startWatching();

// Event listener for 'fileAdded' event
fileWatcher.on('fileAdded', (filename) => {
  console.log(`New file added: ${filename}`);
  // Perform additional actions here
  dataSourceFactory.clearAllPlugins();
  dataSourceManager.clearAllPlugins();

  dataSourceFactory.loadPlugins();
  dataSourceManager.setDataSourceMap(dataSourceFactory.getDataSourceMap());
  //dataSourceManager.runPlugins();

  // dataSourceFactory.clearAllPlugins();
  // dataSourceFactory.loadPlugins();
  // dataSourceFactory.runPlugins();
});

//DatabaseService.run().catch(console.dir);
app.use(express.json());
app.use('/api/v1/users', userRouter);
app.use('/api/v1/',dataSourceRouter);
//import { search } from './controllers/DataSource.controllers';
//app.get('/api/v1/search/DataSource/Voz/title', search);
app.use('*', defaultErrorHandlers);
app.listen(port,host, () => {
  console.log(`app running on port http://${host}:${port}/`);
});
