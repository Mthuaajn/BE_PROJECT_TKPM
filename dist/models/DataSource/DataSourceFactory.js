"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceFactory = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// import tsnode from 'ts-node';
// const ts = tsnode.register({
//   transpileOnly: true,
// });
//const fileUtils = require('../../utils/FileUtility');
const FileUtility_1 = require("../../utils/FileUtility");
const dataSourcePluginFolder = path_1.default.join(__dirname, '../DataSourcePlugin/'); //"/models/DataSourcePlugin/";//
class DataSourceFactory {
    static instance;
    dataSourceMap;
    constructor() {
        this.dataSourceMap = new Map();
    }
    static getInstance() {
        if (!DataSourceFactory.instance) {
            DataSourceFactory.instance = new DataSourceFactory();
        }
        return DataSourceFactory.instance;
    }
    registerDataSourcePlugin(name, dataSourcePlugin) {
        this.dataSourceMap.set(name, dataSourcePlugin);
    }
    select(name) {
        if (this.dataSourceMap.has(name)) {
            return this.dataSourceMap.get(name) ?? null;
        }
        return null;
    }
    getDataSourceMap() {
        return this.dataSourceMap;
    }
    loadPlugins() {
        try {
            const fileNames = (0, FileUtility_1.getFileNamesInFolder)(dataSourcePluginFolder);
            for (const name of fileNames) {
                console.log('load plugin name: ', name);
                const plugin = this.loadPluginFromFileName(name);
                this.registerDataSourcePlugin((0, FileUtility_1.removeFileExtension)(name), plugin);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    // public async loadPlugins(): Promise<void> {
    //   const fileNames = fs.readdirSync(dataSourcePluginFolder);
    //   for (const fileName of fileNames) {
    //     if (path.extname(fileName) === '.ts') {
    //       //console.log("fileName: ",fileName);
    //       const filePath = path.join(dataSourcePluginFolder, removeFileExtension(fileName));//`file://${path.join(dataSourcePluginFolder, fileName)}`; //
    //       // const importedModule = await require(filePath);// import(filePath);
    //       // const PluginClass = importedModule.default;
    //       //const modulePath =  path.resolve(filePath);
    //       //const modulePath = 'file://' + filePath.replace(/\\/g, '/');
    //       //const modulePath = './' + filePath;//replace(/\\/g, '/');
    //       //console.log("modulePath:" ,modulePath);
    //       const modulePath = `file://${path.resolve(filePath)}`;
    //      // const { default: DefaultClass } = await ts.require(modulePath);
    //      // const modulePath = path.resolve(filePath);
    //     // eslint-disable-next-line @typescript-eslint/no-var-requires
    //     //const importedModule = require(modulePath);
    //     const DefaultClass = importedModule.default;
    //       // const DefaultClass = await import(
    //       //   'D:\\Uni Project\\TestTypeScript\\BE_PROJECT_TKPM\\src\\models\\DataSourcePlugin\\Truyen123Plugin'
    //       // );
    //      // this.registerDataSourcePlugin(fileName, new DefaultClass(fileName));
    //     }
    //   }
    // }
    clearAllPlugins() {
        this.dataSourceMap.clear();
    }
    runPlugins() {
        this.dataSourceMap.forEach((value, key) => {
            console.log(`Running plugin ${key} ...`);
            value.search(key);
        });
    }
    loadPluginFromFileName(pluginName) {
        const pluginFilePath = `file://${path_1.default.join(dataSourcePluginFolder, pluginName)}`;
        const pluginFile = path_1.default.join(dataSourcePluginFolder, pluginName);
        //console.log('pluginFile: ', path.join(dataSourcePluginFolder, removeFileExtension(pluginName)));
        const moduleName = (0, FileUtility_1.removeFileExtension)(pluginName);
        //console.log('module: ', moduleName);
        if (fs_1.default.existsSync(pluginFile)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            //const  PluginClass = require(pluginFile).default;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { plugin: PluginClass } = require(pluginFile);
            //console.log("PluginClass: ",PluginClass);
            // const importedModule = await import(pluginFilePath);
            // console.log(importedModule);
            //const PluginClass = importedModule.default;
            //return new PluginClass(pluginName);
            return new PluginClass(moduleName);
        }
        throw new Error(`Plugin not found: ${pluginName}`);
    }
    async loadPluginFromPath(pluginPath) {
        const pluginName = path_1.default.basename(pluginPath);
        const pluginFile = path_1.default.join(pluginPath, `${pluginName}.ts`);
        if (fs_1.default.existsSync(pluginFile)) {
            //const PluginClass = require(pluginFile).default;
            const importedModule = await import(pluginFile);
            const PluginClass = importedModule.default;
            return new PluginClass(pluginName);
        }
        throw new Error(`Plugin not found: ${pluginName}`);
    }
}
exports.DataSourceFactory = DataSourceFactory;
