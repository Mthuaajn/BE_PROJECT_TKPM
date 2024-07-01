import path from 'path';
import fs from 'fs';
import { getFileNamesInFolder, removeFileExtension } from '../../utils/FileUtility';
import { IFileExtensionComicsPlugin } from './IFileExtensionComicsPlugin';

//This class is the factory, create plugin from all file in plugin's folder
export class FileExtensionComicsFactory {
  // Instance of this class, used for singleton design pattern
  private static instance: FileExtensionComicsFactory;

  // Map used for manage the plugin
  private fileExtensionMap: Map<string, IFileExtensionComicsPlugin>;

  private constructor() {
    this.fileExtensionMap = new Map<string, IFileExtensionComicsPlugin>();
  }

  // Get instance of this class using singleton pattern
  public static getInstance(): FileExtensionComicsFactory {
    if (!FileExtensionComicsFactory.instance) {
      FileExtensionComicsFactory.instance = new FileExtensionComicsFactory();
    }
    return FileExtensionComicsFactory.instance;
  }

  // Register a new plugin
  public registerFileExtensionPlugin(
    name: string,
    fileExtensionPlugin: IFileExtensionComicsPlugin
  ): void {
    this.fileExtensionMap.set(name, fileExtensionPlugin);
  }

  // Get a registered plugin in this class
  public select(name: string): IFileExtensionComicsPlugin | null {
    if (this.fileExtensionMap.has(name)) {
      return this.fileExtensionMap.get(name) ?? null;
    }
    return null;
  }

  // Get plugin's map
  public getFileExtensionMap(): Map<string, IFileExtensionComicsPlugin> {
    return this.fileExtensionMap;
  }

  // clone all plugin and put into a map
  public cloneAllPlugins(): Map<string, IFileExtensionComicsPlugin> {
    const mapPlugins: Map<string, IFileExtensionComicsPlugin> = new Map<
      string,
      IFileExtensionComicsPlugin
    >();
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
        const plugin: IFileExtensionComicsPlugin = this.loadPluginFromFileName(name, folderPath);
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
  private loadPluginFromFileName(
    pluginName: string,
    folderPath: string
  ): IFileExtensionComicsPlugin {
    const pluginFile = path.join(folderPath, pluginName);

    if (fs.existsSync(pluginFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { plugin: PluginClass } = require(pluginFile);

      return new PluginClass();
    }
    throw new Error(`Plugin not found: ${pluginName}`);
  }
}
