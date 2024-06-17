import { IDataSourcePlugin } from './IDataSourcePlugin';
import path from 'path';
import fs from 'fs';
// import tsnode from 'ts-node';

// const ts = tsnode.register({
//   transpileOnly: true,
// });
//const fileUtils = require('../../utils/FileUtility');
import {
  getFileNamesInFolder,
  readDirectChildFolder,
  removeFileExtension
} from '../../utils/FileUtility';
import { MetaData } from '../Interfaces/MetaData';

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
      const folderNames: string[] = readDirectChildFolder(folderPath);
      for (const name of folderNames) {
        console.log('load plugin name: ', path.basename(name));
        const plugin: IDataSourcePlugin = this.loadPluginFromFolderName(name);
        this.registerDataSourcePlugin(path.basename(name), plugin);
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
    });
  }

  // Load one plugin
  private loadPluginFromFileName(pluginName: string, folderPath: string): IDataSourcePlugin {
    const pluginFile = path.join(folderPath, pluginName);

    const moduleName = removeFileExtension(pluginName);

    if (fs.existsSync(pluginFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { plugin: PluginClass } = require(pluginFile);

      return new PluginClass(moduleName);
    }
    throw new Error(`Plugin not found: ${pluginName}`);
  }

  private loadPluginFromFolderName(pluginFolderName: string): IDataSourcePlugin {
    const metadataPath = path.join(pluginFolderName, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as Record<string, string>;

    const dataSourcePluginPath = path.join(pluginFolderName + '/src', metadata.IDataSourcePlugin);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dataSourcePluginClass = require(dataSourcePluginPath).default;

    const baseUrl: string = dataSourcePluginClass.baseUrl;
    //console.log('baseUrl: ', baseUrl);
    //console.log('dataSourcePluginPath: ', dataSourcePluginPath);
    // console.log('dataSourcePluginClass: ', dataSourcePluginClass);
    const instances: Record<string, any> = {}; //[string, any] = [];

    for (const key in metadata) {
      if (key !== 'IDataSourcePlugin') {
        //console.log('key: ', key);
        const filePath = path.join(pluginFolderName + '/src', metadata[key]);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ClassToInstantiate = require(filePath).default;
        //console.log('filePath: ', filePath);
        //console.log('ClassToInstantiate: ', ClassToInstantiate);
        instances[key] = new ClassToInstantiate(baseUrl);
      }
    }

    //console.log('instances: ', instances);
    const moduleName = removeFileExtension(metadata.IDataSourcePlugin);
    const pluginInstance: IDataSourcePlugin = new dataSourcePluginClass(
      moduleName,
      instances.ICategoryList,
      instances.IContentStory,
      instances.IDetailStory,
      instances.IListStoryStrategy,
      instances.ISearchStory
    );

    return pluginInstance;
  }
}
