import { IDataSourcePlugin } from './IDataSourcePlugin';
import path from 'path';
import fs from 'fs';
// import tsnode from 'ts-node';

// const ts = tsnode.register({
//   transpileOnly: true,
// });
//const fileUtils = require('../../utils/FileUtility');
import { getFileNamesInFolder, removeFileExtension } from '../../utils/FileUtility';
import { contentStory } from '~/controllers/DataSource.controllers';

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

  public registerDataSourcePlugin(name: string, dataSourcePlugin: IDataSourcePlugin): void {
    this.dataSourceMap.set(name, dataSourcePlugin);
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

  public loadPlugins() {
    try {
      const fileNames: string[] = getFileNamesInFolder(dataSourcePluginFolder);
      for (const name of fileNames) {
        console.log('load plugin name: ', name);
        const plugin: IDataSourcePlugin = this.loadPluginFromFileName(name);
        this.registerDataSourcePlugin(removeFileExtension(name), plugin);
      }
    } catch (error) {
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

  public clearAllPlugins(): void {
    this.dataSourceMap.clear();
  }

  public runPlugins(): void {
    this.dataSourceMap.forEach((value, key) => {
      console.log(`Running plugin ${key} ...`);
      value.search(key);
    });
  }

  private loadPluginFromFileName(pluginName: string): IDataSourcePlugin {
    const pluginFilePath = `file://${path.join(dataSourcePluginFolder, pluginName)}`;

    const pluginFile = path.join(dataSourcePluginFolder, pluginName);
    //console.log('pluginFile: ', path.join(dataSourcePluginFolder, removeFileExtension(pluginName)));

    const moduleName = removeFileExtension(pluginName);
    //console.log('module: ', moduleName);
    if (fs.existsSync(pluginFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      //const  PluginClass = require(pluginFile).default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {plugin: PluginClass} = require(pluginFile);
      //console.log("PluginClass: ",PluginClass);
      // const importedModule = await import(pluginFilePath);
      // console.log(importedModule);
      //const PluginClass = importedModule.default;
      //return new PluginClass(pluginName);
      return new PluginClass(moduleName);
    }
    throw new Error(`Plugin not found: ${pluginName}`);
  }

  private async loadPluginFromPath(pluginPath: string): Promise<IDataSourcePlugin> {
    const pluginName = path.basename(pluginPath);
    const pluginFile = path.join(pluginPath, `${pluginName}.ts`);

    if (fs.existsSync(pluginFile)) {
      //const PluginClass = require(pluginFile).default;
      const importedModule = await import(pluginFile);
      const PluginClass = importedModule.default;
      return new PluginClass(pluginName);
    }

    throw new Error(`Plugin not found: ${pluginName}`);
  }
}
