import { IDataSourcePlugin } from './IDataSourcePlugin';
import path from 'path';
import fs from 'fs';
// import tsnode from 'ts-node';

// const ts = tsnode.register({
//   transpileOnly: true,
// });
//const fileUtils = require('../../utils/FileUtility');
import { getFileNamesInFolder, removeFileExtension } from '../../utils/FileUtility';

const dataSourcePluginFolder = path.join(__dirname, '../DataSourcePlugin/'); //"/models/DataSourcePlugin/";//

//This class is the factory, create plugin from all file in plugin's folder
export class DataSourceFactory {
  // Instance of this class, used for singleton design pattern
  private static instance: DataSourceFactory;

  // Map used for manage the plugin
  private dataSourceMap: Map<string, IDataSourcePlugin>;
  private constructor() {
    this.dataSourceMap = new Map<string, IDataSourcePlugin>();
  }

  // Get instance of this class using singleton pattern
  public static getInstance(): DataSourceFactory {
    if (!DataSourceFactory.instance) {
      DataSourceFactory.instance = new DataSourceFactory();
    }
    return DataSourceFactory.instance;
  }

  // Register a new plugin
  public registerDataSourcePlugin(name: string, dataSourcePlugin: IDataSourcePlugin): void {
    this.dataSourceMap.set(name, dataSourcePlugin);
  }

  // Get a registered plugin in this class
  public select(name: string): IDataSourcePlugin | null {
    if (this.dataSourceMap.has(name)) {
      return this.dataSourceMap.get(name) ?? null;
    }
    return null;
  }

  // Get a clone instance of one plugin
  public clonePlugin(name: string): IDataSourcePlugin | null {
    if (this.dataSourceMap.has(name)) {
      const plugin: IDataSourcePlugin | null = this.dataSourceMap.get(name) ?? null;

      if (plugin != null) {
        return plugin.clone(plugin.name);
      }
    }
    return null;
  }

  // Clone all plugin and put into a map
  public cloneAllPlugins(): Map<string, IDataSourcePlugin> {
    const mapPlugins: Map<string, IDataSourcePlugin> = new Map<string, IDataSourcePlugin>();
    this.dataSourceMap.forEach((value, key) => {
      mapPlugins.set(key, value.clone(key));
    });

    return mapPlugins;
  }

  // Get plugin map
  public getDataSourceMap(): Map<string, IDataSourcePlugin> {
    return this.dataSourceMap;
  }

  // load all plugin from a folder
  public loadPlugins(folderPath: string) {
    try {
      const fileNames: string[] = getFileNamesInFolder(folderPath);
      for (const name of fileNames) {
        console.log('load plugin name: ', name);
        const plugin: IDataSourcePlugin = this.loadPluginFromFileName(name, folderPath);
        this.registerDataSourcePlugin(removeFileExtension(name), plugin);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Clear all plugins in map
  public clearAllPlugins(): void {
    this.dataSourceMap.clear();
  }

  public runPlugins(): void {
    this.dataSourceMap.forEach((value, key) => {
      console.log(`Running plugin ${key} ...`);
      value.search(key);
    });
  }

  // Load one plugin
  private loadPluginFromFileName(pluginName: string, folderPath: string): IDataSourcePlugin {
    // const pluginFilePath = `file://${path.join(dataSourcePluginFolder, pluginName)}`;

    const pluginFile = path.join(folderPath, pluginName);
    //console.log('pluginFile: ', path.join(dataSourcePluginFolder, removeFileExtension(pluginName)));

    const moduleName = removeFileExtension(pluginName);
    //console.log('module: ', moduleName);
    if (fs.existsSync(pluginFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      //const  PluginClass = require(pluginFile).default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { plugin: PluginClass } = require(pluginFile);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // const { listStory: listStoryStrategy } = require(pluginFile);
      // const test = new listStoryStrategy(PluginClass.baseUrl);
      // console.log(test.getBaseUrl());
      //console.log("PluginClass: ",PluginClass);
      // const importedModule = await import(pluginFilePath);
      // console.log(importedModule);
      //const PluginClass = importedModule.default;
      //return new PluginClass(pluginName);
      return new PluginClass(moduleName);
    }
    throw new Error(`Plugin not found: ${pluginName}`);
  }
}
