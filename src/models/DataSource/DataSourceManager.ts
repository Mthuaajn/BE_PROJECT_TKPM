import { DataSourceFactory } from './DataSourceFactory';
import { IDataSourcePlugin } from './IDataSourcePlugin';

export class DataSourceManager {
  private static instance: DataSourceManager;
  private dataSourcePlugin: Map<string, IDataSourcePlugin>;

  private constructor() {
    this.dataSourcePlugin = new Map<string, IDataSourcePlugin>();
  }
  public static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }

    return DataSourceManager.instance;
  }

  public select(name: string): IDataSourcePlugin | null {
    if (this.dataSourcePlugin.has(name)) {
      return this.dataSourcePlugin.get(name) ?? null;
    }

    return null;
  }

  public clearAllPlugins(): void {
    this.dataSourcePlugin.clear();
  }

  public getDataSourceMap(): Map<string, IDataSourcePlugin> | null {
    return this.dataSourcePlugin;
  }

  public setDataSourceMap(map: Map<string, IDataSourcePlugin>): void {
    //this.dataSourcePlugin = new Map<string, IDataSourcePlugin>(map);
    //this.dataSourcePlugin = this.deepCopyMap(map);
    this.dataSourcePlugin = this.cloneDataSourceMap(map);
  }

  private cloneDataSourceMap(
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
}
