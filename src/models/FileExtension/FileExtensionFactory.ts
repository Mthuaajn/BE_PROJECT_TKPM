import { IFileExtensionPlugin } from './IFileExtensionPlugin';
import path from 'path';
import fs from 'fs';
import { getFileNamesInFolder, removeFileExtension } from '../../utils/FileUtility';
import { contentStory } from '~/controllers/DataSource.controllers';

const fileExtensionPluginFolder = path.join(__dirname, '../FileExtensionPlugin/');
export class FileExtensionFactory {
  private static instance: FileExtensionFactory;
  private fileExtensionMap: Map<string, IFileExtensionPlugin>;
  private constructor() {
    this.fileExtensionMap = new Map<string, IFileExtensionPlugin>();
  }
  public static getInstance(): FileExtensionFactory {
    if (!FileExtensionFactory.instance) {
      FileExtensionFactory.instance = new FileExtensionFactory();
    }
    return FileExtensionFactory.instance;
  }

  public registerFileExtensionPlugin(
    name: string,
    fileExtensionPlugin: IFileExtensionPlugin
  ): void {
    this.fileExtensionMap.set(name, fileExtensionPlugin);
  }

  public select(name: string): IFileExtensionPlugin | null {
    if (this.fileExtensionMap.has(name)) {
      return this.fileExtensionMap.get(name) ?? null;
    }
    return null;
  }

  public getFileExtensionMap(): Map<string, IFileExtensionPlugin> {
    return this.fileExtensionMap;
  }

  public loadPlugins() {
    try {
      const fileNames: string[] = getFileNamesInFolder(fileExtensionPluginFolder);
      for (const name of fileNames) {
        console.log('load plugin name: ', name);
        const plugin: IFileExtensionPlugin = this.loadPluginFromFileName(name);
        this.registerFileExtensionPlugin(removeFileExtension(name), plugin);
      }
    } catch (error) {
      console.log(error);
    }
  }

  public clearAllPlugins(): void {
    this.fileExtensionMap.clear();
  }

  public runPlugins(): void {
    this.fileExtensionMap.forEach((value, key) => {
      console.log(`Running plugin ${key} ...`);
    });
  }

  private loadPluginFromFileName(pluginName: string): IFileExtensionPlugin {
    const pluginFilePath = `file://${path.join(fileExtensionPluginFolder, pluginName)}`;

    const pluginFile = path.join(fileExtensionPluginFolder, pluginName);
    //console.log('pluginFile: ', path.join(dataSourcePluginFolder, removeFileExtension(pluginName)));

    const moduleName = removeFileExtension(pluginName);
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

  private async loadPluginFromPath(pluginPath: string): Promise<IFileExtensionPlugin> {
    const pluginName = path.basename(pluginPath);
    const pluginFile = path.join(pluginPath, `${pluginName}.ts`);

    if (fs.existsSync(pluginFile)) {
      //const PluginClass = require(pluginFile).default;
      const importedModule = await import(pluginFile);
      const PluginClass = importedModule.default;
      return new PluginClass();
    }

    throw new Error(`Plugin not found: ${pluginName}`);
  }
}
