import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express from 'express';
import DatabaseService from '~/services/db.services';
import userRouter from '~/routes/users.routes';
import { DataSourceFactory } from './models/DataSource/DataSourceFactory';
import path from 'path';
import { FileWatcher } from './models/FileWatcher';
const port = 3000;
const app = express();
const dataSourceFactory = DataSourceFactory.getInstance();
dataSourceFactory.loadPlugins()
dataSourceFactory.runPlugins();
// Usage example
const directoryToWatch = path.join(__dirname, '/models/DataSourcePlugin');
const fileWatcher = new FileWatcher(directoryToWatch);
fileWatcher.startWatching();

// Event listener for 'fileAdded' event
fileWatcher.on('fileAdded', (filename) => {
  console.log(`New file added: ${filename}`);
  // Perform additional actions here
  dataSourceFactory.clearAllPlugins();
  dataSourceFactory.loadPlugins();
  dataSourceFactory.runPlugins();
});

//DatabaseService.run().catch(console.dir);
app.use(express.json());
app.use('/api/v1/users', userRouter);
app.use('*', defaultErrorHandlers);
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
