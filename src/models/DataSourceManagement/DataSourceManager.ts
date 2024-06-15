import { IDataSourcePlugin } from './IDataSourcePlugin';

//This class is used for manage crawl story plugin
export class DataSourceManager {
  // Instance of this class, used for singleton design pattern
  private static instance: DataSourceManager;

  // Map used for manage the plugins
  private dataSourcePlugin: Map<string, IDataSourcePlugin>;

  private constructor() {
    this.dataSourcePlugin = new Map<string, IDataSourcePlugin>();
  }

  // Get instance of this class using singleton pattern
  public static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }

    return DataSourceManager.instance;
  }

  // Register a new plugin
  public registerDataSourcePlugin(name: string, dataSourcePlugin: IDataSourcePlugin): void {
    this.dataSourcePlugin.set(name, dataSourcePlugin);
  }

  // Get a registered plugin in this class
  public select(name: string): IDataSourcePlugin | null {
    if (this.dataSourcePlugin.has(name)) {
      return this.dataSourcePlugin.get(name) ?? null;
    }

    return null;
  }

  // Clear all plugins in map
  public clearAllPlugins(): void {
    this.dataSourcePlugin.clear();
  }

  // Get plugin map
  public getDataSourceMap(): Map<string, IDataSourcePlugin> | null {
    return this.dataSourcePlugin;
  }

  // Set plugin map
  public setDataSourceMap(map: Map<string, IDataSourcePlugin>): void {
    this.dataSourcePlugin = map;
  }

  // Create a clone plugin map and set it to this class's plugin map
  public setCloneDataSourceMap(map: Map<string, IDataSourcePlugin>): void {
    //this.dataSourcePlugin = new Map<string, IDataSourcePlugin>(map);
    //this.dataSourcePlugin = this.deepCopyMap(map);
    this.dataSourcePlugin = this.cloneDataSourceMap(map);
  }

  // Set a plugin
  public setDataSource(key: string, value: IDataSourcePlugin): void {
    this.dataSourcePlugin.set(key, value);
  }

  public cloneDataSourceMap(
    originalMap: Map<string, IDataSourcePlugin>
  ): Map<string, IDataSourcePlugin> {
    const newMap = new Map<string, IDataSourcePlugin>();

    originalMap.forEach((value, key) => {
      newMap.set(key, value.clone(key));
      //console.log('deep cop: ', key);
    });

    return newMap;
  }

  private cloneObject<T>(source: T): T {
    if (typeof source !== 'object' || source === null) {
      return source;
    }

    const clonedObject: any = Array.isArray(source) ? [] : {};

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        clonedObject[key] = this.cloneObject(source[key]);
      }
    }

    return clonedObject;
  }

  private deepCopyMap(originalMap: Map<string, IDataSourcePlugin>): Map<string, IDataSourcePlugin> {
    const newMap = new Map<string, IDataSourcePlugin>();

    for (const [key, value] of originalMap.entries()) {
      const clonedValue = this.cloneObject(value);
      newMap.set(key, clonedValue);
    }

    return newMap;
  }

  public runPlugins(): void {
    this.dataSourcePlugin.forEach((value, key) => {
      console.log(`Running plugin ${key} ...`);
      value.search(key);
    });
  }

  public printAllPlugins(): void {
    this.dataSourcePlugin.forEach((Value, key) => {
      console.log(`Running plugin ${key} ...`);
    });
  }

  public getAllPluginName(): string[] {
    const list: string[] = [];
    this.dataSourcePlugin.forEach((value, key) => {
      // console.log("value: ",value.name);
      // console.log("key: ",key);
      const str: string = value.name.replace(/Plugin/g, '');
      list.push(str);
    });

    return list;
  }
}
