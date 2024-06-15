import { IFileExtensionPlugin } from './IFileExtensionPlugin';
import path from 'path';
import fs from 'fs';
import { getFileNamesInFolder, removeFileExtension } from '../../utils/FileUtility';
const fileExtensionPluginFolder = path.join(__dirname, '../FileExtensionPlugin/');

//This class is the factory, create plugin from all file in plugin's folder
export class FileExtensionFactory {
  // Instance of this class, used for singleton design pattern
  private static instance: FileExtensionFactory;

  // Map used for manage the plugin
  private fileExtensionMap: Map<string, IFileExtensionPlugin>;

  private constructor() {
    this.fileExtensionMap = new Map<string, IFileExtensionPlugin>();
  }

  // Get instance of this class using singleton pattern
  public static getInstance(): FileExtensionFactory {
    if (!FileExtensionFactory.instance) {
      FileExtensionFactory.instance = new FileExtensionFactory();
    }
    return FileExtensionFactory.instance;
  }

  // Register a new plugin
  public registerFileExtensionPlugin(
    name: string,
    fileExtensionPlugin: IFileExtensionPlugin
  ): void {
    this.fileExtensionMap.set(name, fileExtensionPlugin);
  }

  // Get a registered plugin in this class
  public select(name: string): IFileExtensionPlugin | null {
    if (this.fileExtensionMap.has(name)) {
      return this.fileExtensionMap.get(name) ?? null;
    }
    return null;
  }

  // Get plugin's map
  public getFileExtensionMap(): Map<string, IFileExtensionPlugin> {
    return this.fileExtensionMap;
  }

  // clone all plugin and put into a map
  public cloneAllPlugins(): Map<string, IFileExtensionPlugin> {
    const mapPlugins: Map<string, IFileExtensionPlugin> = new Map<string, IFileExtensionPlugin>();
    this.fileExtensionMap.forEach((value, key) => {
      mapPlugins.set(key, value.clone());
    });

    return mapPlugins;
  }

  // load all plugin from a folder
  public loadPlugins(folderPath: string) {
    try {
      const fileNames: string[] = getFileNamesInFolder(folderPath);
      for (const name of fileNames) {
        console.log('load plugin name: ', name);
        const plugin: IFileExtensionPlugin = this.loadPluginFromFileName(name, folderPath);
        this.registerFileExtensionPlugin(removeFileExtension(name), plugin);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Clear all plugins in map
  public clearAllPlugins(): void {
    this.fileExtensionMap.clear();
  }

  public runPlugins(): void {
    this.fileExtensionMap.forEach((value, key) => {
      console.log(`Running plugin ${key} ...`);
    });
  }

  // Load one plugin
  private loadPluginFromFileName(pluginName: string, folderPath: string): IFileExtensionPlugin {
    //const pluginFilePath = `file://${path.join(fileExtensionPluginFolder, pluginName)}`;

    const pluginFile = path.join(folderPath, pluginName);
    //console.log('pluginFile: ', path.join(dataSourcePluginFolder, removeFileExtension(pluginName)));

    //const moduleName = removeFileExtension(pluginName);
    //console.log('module: ', moduleName);
    if (fs.existsSync(pluginFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      //const  PluginClass = require(pluginFile).default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { plugin: PluginClass } = require(pluginFile);
      //console.log("PluginClass: ",PluginClass);
      // const importedModule = await import(pluginFilePath);
      // console.log(importedModule);
      //const PluginClass = importedModule.default;
      //return new PluginClass(pluginName);
      //return new PluginClass(moduleName);
      return new PluginClass();
    }
    throw new Error(`Plugin not found: ${pluginName}`);
  }
}
