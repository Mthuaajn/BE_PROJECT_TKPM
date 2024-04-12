import { IDataSourcePlugin } from './IDataSourcePlugin';
import path from 'path';
import fs from 'fs';
//const fileUtils = require('../../utils/FileUtility');
import { getFileNamesInFolder } from '../../utils/FileUtility';

const dataSourcePluginFolder = path.join(__dirname, '../DataSourcePlugin/'); //"/models/DataSourcePlugin/";//
export class DataSourceFactory {
  private static instance: DataSourceFactory;
  private dataSourceMap: Map<string, IDataSourcePlugin>;
  private constructor() {
    this.dataSourceMap = new Map<string, IDataSourcePlugin>();
  }
  public static getInstance(): DataSourceFactory {
    if (!DataSourceFactory.instance) {
      DataSourceFactory.instance = new DataSourceFactory();
    }
    return DataSourceFactory.instance;
  }

  public async registerDataSourcePlugin(
    name: string,
    dataSourcePlugin: Promise<IDataSourcePlugin>
  ): Promise<void> {
    this.dataSourceMap.set(name, await dataSourcePlugin);
  }

  public select(name: string): IDataSourcePlugin | null {
    if (this.dataSourceMap.has(name)) {
      return this.dataSourceMap.get(name) ?? null;
    }
    return null;
  }

  public getDataSourceMap(): Map<string, IDataSourcePlugin> {
    return this.dataSourceMap;
  }

  public loadPlugins(): void {
    const fileNames: string[] = getFileNamesInFolder(dataSourcePluginFolder);
    for (const name of fileNames) {
      console.log('load plugin name: ', name);
      const plugin: Promise<IDataSourcePlugin> = this.loadPluginFromFileName(name);
      this.registerDataSourcePlugin(name, plugin);
    }
  }

  public clearAllPlugins(): void {
    this.dataSourceMap.clear();
  }

  public runPlugins(): void {
    this.dataSourceMap.forEach((value, key) => {
      console.log(`Running plugin ${key} ...`);
      value.search(key);
    });
  }

  private async loadPluginFromFileName(pluginName: string): Promise<IDataSourcePlugin> {
    const pluginFile = path.join(dataSourcePluginFolder, pluginName);

    if (fs.existsSync(pluginFile)) {
      const PluginClass = await import(pluginFile);
      return new PluginClass(pluginName);
    }
    throw new Error(`Plugin not found: ${pluginName}`);
  }

  private async loadPluginFromPath(pluginPath: string): Promise<IDataSourcePlugin> {
    const pluginName = path.basename(pluginPath);
    const pluginFile = path.join(pluginPath, `${pluginName}.ts`);

    if (fs.existsSync(pluginFile)) {
      const PluginClass = await import(pluginFile);
      return new PluginClass(pluginName);
    }

    throw new Error(`Plugin not found: ${pluginName}`);
  }
}
