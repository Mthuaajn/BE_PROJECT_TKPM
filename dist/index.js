"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_middlewares_1 = require("./middlewares/error.middlewares");
const express_1 = __importDefault(require("express"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const DataSource_routes_1 = __importDefault(require("./routes/DataSource.routes"));
const DataSourceFactory_1 = require("./models/DataSource/DataSourceFactory");
const DataSourceManager_1 = require("./models/DataSource/DataSourceManager");
const path_1 = __importDefault(require("path"));
const FileWatcher_1 = require("./models/FileWatcher");
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const esmRequire = require('esm')(module /*, options*/);
// esmRequire('./index.ts');
// eslint-disable-next-line @typescript-eslint/no-var-requires
// require('ts-node').register();
// require('./index.ts');
const port = 3000;
const host = '127.0.0.1'; //'10.0.2.2';////'localhost';
const app = (0, express_1.default)();
const dataSourceFactory = DataSourceFactory_1.DataSourceFactory.getInstance();
const dataSourceManager = DataSourceManager_1.DataSourceManager.getInstance();
dataSourceFactory.loadPlugins();
dataSourceManager.setDataSourceMap(dataSourceFactory.getDataSourceMap());
dataSourceManager.printAllPlugins();
//dataSourceManager.runPlugins();
// Usage example
const directoryToWatch = path_1.default.join(__dirname, '/models/DataSourcePlugin');
const fileWatcher = new FileWatcher_1.FileWatcher(directoryToWatch);
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
//DatabaseService.run().catch(console.dir);
app.use(express_1.default.json());
app.use('/api/v1/users', users_routes_1.default);
app.use('/api/v1/', DataSource_routes_1.default);
//import { search } from './controllers/DataSource.controllers';
//app.get('/api/v1/search/DataSource/Voz/title', search);
app.use('*', error_middlewares_1.defaultErrorHandlers);
app.listen(port, host, () => {
    console.log(`app running on port http://${host}:${port}/`);
});
